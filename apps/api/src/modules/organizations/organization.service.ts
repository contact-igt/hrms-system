import { and, eq, isNull } from "drizzle-orm";
import type { Request } from "express";
import { env } from "../../config/env.js";
import { db } from "../../database/client.js";
import {
  employees,
  membershipRoles,
  organizationInvitations,
  organizationMemberships,
  organizations,
  roles,
  users,
} from "../../database/index.js";
import { AppError } from "../../common/errors/app-error.js";
import { createId, createRandomToken, sha256 } from "../../common/utils/crypto.js";
import { addDays } from "../../common/utils/date.js";
import { writeAudit } from "../audit/audit.service.js";
import { mailService } from "../notifications/mail.service.js";
import { findRoleId } from "../auth/role.service.js";

function organizationIdFrom(request: Request) {
  if (!request.auth?.organizationId) {
    throw new AppError(403, "Organization scope is required.", "AUTH_SCOPE_DENIED");
  }
  return request.auth.organizationId;
}

export async function getCurrentOrganization(request: Request) {
  const organizationId = organizationIdFrom(request);
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (!organization) {
    throw new AppError(404, "Organization was not found.", "ORGANIZATION_NOT_FOUND");
  }
  return organization;
}

export async function updateCurrentOrganization(
  body: { name: string; domain: string; timezone: string },
  request: Request,
) {
  const organizationId = organizationIdFrom(request);
  await db
    .update(organizations)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));
  await writeAudit({
    action: "ORGANIZATION_SETTINGS_UPDATED",
    organizationId,
    entityType: "Organization",
    entityId: organizationId,
    actorUserId: request.auth!.userId,
    request,
  });
  return { updated: true as const };
}

export async function listMembers(request: Request) {
  const organizationId = organizationIdFrom(request);
  const memberRows = await db
    .select({
      id: organizationMemberships.id,
      employeeCode: employees.employeeCode,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      status: organizationMemberships.status,
    })
    .from(organizationMemberships)
    .innerJoin(users, eq(organizationMemberships.userId, users.id))
    .leftJoin(
      employees,
      and(
        eq(employees.organizationId, organizationMemberships.organizationId),
        eq(employees.userId, organizationMemberships.userId),
      ),
    )
    .where(eq(organizationMemberships.organizationId, organizationId));

  const activeMembers = await Promise.all(
    memberRows.map(async (row) => {
      const roleRows = await db
        .select({ name: roles.name })
        .from(membershipRoles)
        .innerJoin(roles, eq(membershipRoles.roleId, roles.id))
        .where(eq(membershipRoles.membershipId, row.id));
      return {
        id: row.id,
        employeeCode: row.employeeCode ?? "—",
        name: `${row.firstName} ${row.lastName}`,
        email: row.email,
        role: roleRows[0]?.name ?? "EMPLOYEE",
        status: row.status,
      };
    }),
  );

  const invitedRows = await db
    .select({
      id: organizationInvitations.id,
      employeeCode: employees.employeeCode,
      firstName: organizationInvitations.firstName,
      lastName: organizationInvitations.lastName,
      email: organizationInvitations.email,
      role: organizationInvitations.roleName,
    })
    .from(organizationInvitations)
    .innerJoin(
      employees,
      and(
        eq(employees.organizationId, organizationInvitations.organizationId),
        eq(employees.employeeCode, organizationInvitations.employeeCode),
      )
    )
    .where(
      and(
        eq(organizationInvitations.organizationId, organizationId),
        isNull(organizationInvitations.acceptedAt)
      )
    );

  const invitedMembers = invitedRows.map((row) => ({
    id: row.id,
    employeeCode: row.employeeCode ?? "—",
    name: `${row.firstName} ${row.lastName}`,
    email: row.email,
    role: row.role,
    status: "INVITED" as const,
  }));

  return [...activeMembers, ...invitedMembers];
}

export async function inviteEmployee(
  body: {
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    departmentId?: string;
    designationId?: string;
    role: string;
  },
  request: Request,
) {
  const organizationId = organizationIdFrom(request);
  const [organization] = await db
    .select({ name: organizations.name, status: organizations.status })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (!organization || organization.status !== "ACTIVE") {
    throw new AppError(403, "Organization is not active.");
  }

  const roleId = await findRoleId(body.role, "ORGANIZATION");
  if (!roleId) {
    throw new AppError(400, "Selected organization role is invalid.");
  }

  const [existingEmployee] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.organizationId, organizationId),
        eq(employees.employeeCode, body.employeeCode),
      ),
    )
    .limit(1);
  if (existingEmployee) {
    throw new AppError(409, "Employee code already exists in this organization.");
  }

  const invitationToken = createRandomToken();
  const invitationId = createId();
  await db.transaction(async (transaction) => {
    await transaction.insert(employees).values({
      id: createId(),
      organizationId,
      employeeCode: body.employeeCode,
      departmentId: body.departmentId || null,
      designationId: body.designationId || null,
      status: "INVITED",
    });
    await transaction.insert(organizationInvitations).values({
      id: invitationId,
      organizationId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      employeeCode: body.employeeCode,
      departmentId: body.departmentId || null,
      designationId: body.designationId || null,
      roleName: body.role,
      tokenHash: sha256(invitationToken),
      expiresAt: addDays(new Date(), env.INVITATION_EXPIRES_IN_DAYS),
      invitedBy: request.auth!.userId,
    });
  });

  await mailService.sendInvitation(body.email, organization.name, invitationToken);
  await writeAudit({
    action: "ORGANIZATION_EMPLOYEE_INVITED",
    organizationId,
    entityType: "OrganizationInvitation",
    entityId: invitationId,
    actorUserId: request.auth!.userId,
    request,
    metadata: { email: body.email, role: body.role },
  });
  return { invitationId };
}

export async function updateMemberRole(
  membershipId: string,
  roleName: string,
  request: Request,
) {
  const organizationId = organizationIdFrom(request);
  const [membership] = await db
    .select({ id: organizationMemberships.id })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.id, membershipId),
        eq(organizationMemberships.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!membership) {
    throw new AppError(404, "Organization member was not found.");
  }

  const roleId = await findRoleId(roleName, "ORGANIZATION");
  if (!roleId) {
    throw new AppError(400, "Selected role is invalid.");
  }
  await db.transaction(async (transaction) => {
    await transaction
      .delete(membershipRoles)
      .where(eq(membershipRoles.membershipId, membershipId));
    await transaction.insert(membershipRoles).values({ membershipId, roleId });
  });
  await writeAudit({
    action: "ORGANIZATION_MEMBER_ROLE_CHANGED",
    organizationId,
    entityType: "OrganizationMembership",
    entityId: membershipId,
    actorUserId: request.auth!.userId,
    request,
    metadata: { roleName },
  });
  return { updated: true as const };
}

export async function updateMemberStatus(
  membershipId: string,
  status: "ACTIVE" | "SUSPENDED" | "DISABLED",
  request: Request,
) {
  const organizationId = organizationIdFrom(request);
  const result = await db
    .update(organizationMemberships)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(organizationMemberships.id, membershipId),
        eq(organizationMemberships.organizationId, organizationId),
      ),
    );
  if (result[0].affectedRows === 0) {
    throw new AppError(404, "Organization member was not found.");
  }
  await writeAudit({
    action: "ORGANIZATION_MEMBER_STATUS_CHANGED",
    organizationId,
    entityType: "OrganizationMembership",
    entityId: membershipId,
    actorUserId: request.auth!.userId,
    request,
    metadata: { status },
  });
  return { updated: true as const };
}
