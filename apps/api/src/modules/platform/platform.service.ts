import { and, count, eq, isNull } from "drizzle-orm";
import type { Request } from "express";
import { env } from "../../config/env.js";
import { db } from "../../database/client.js";
import {
  organizationInvitations,
  organizationMemberships,
  organizations,
} from "../../database/index.js";
import { AppError } from "../../common/errors/app-error.js";
import { createId, createRandomToken, sha256 } from "../../common/utils/crypto.js";
import { addDays } from "../../common/utils/date.js";
import { writeAudit } from "../audit/audit.service.js";
import { mailService } from "../notifications/mail.service.js";
import { findRoleId } from "../auth/role.service.js";

type AdminInput = {
  firstName: string;
  lastName: string;
  email: string;
};

async function createAdminInvitation(
  organization: { id: string; name: string },
  admin: AdminInput,
  actorUserId: string,
  sendEmail = true,
) {
  const roleId = await findRoleId("ORGANIZATION_ADMIN", "ORGANIZATION");
  if (!roleId) {
    throw new AppError(500, "Organization Admin role is not seeded.");
  }

  const invitationToken = createRandomToken();
  await db
    .update(organizationInvitations)
    .set({ acceptedAt: new Date() })
    .where(
      and(
        eq(organizationInvitations.organizationId, organization.id),
        eq(organizationInvitations.email, admin.email),
        isNull(organizationInvitations.acceptedAt),
      ),
    );

  const invitationId = createId();
  await db.insert(organizationInvitations).values({
    id: invitationId,
    organizationId: organization.id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    roleName: "ORGANIZATION_ADMIN",
    tokenHash: sha256(invitationToken),
    expiresAt: addDays(new Date(), env.INVITATION_EXPIRES_IN_DAYS),
    invitedBy: actorUserId,
  });

  if (sendEmail) {
    await mailService.sendInvitation(
      admin.email,
      organization.name,
      invitationToken,
    );
  }
  return invitationId;
}

export async function listOrganizations() {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      code: organizations.code,
      domain: organizations.domain,
      status: organizations.status,
      memberCount: count(organizationMemberships.id),
    })
    .from(organizations)
    .leftJoin(
      organizationMemberships,
      eq(organizations.id, organizationMemberships.organizationId),
    )
    .groupBy(organizations.id);
}

export async function getOrganization(id: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  if (!organization) {
    throw new AppError(404, "Organization was not found.", "ORGANIZATION_NOT_FOUND");
  }
  return organization;
}

export async function createOrganization(
  body: {
    name: string;
    code: string;
    domain: string;
    admin: AdminInput;
  },
  request: Request,
) {
  const [duplicate] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.code, body.code))
    .limit(1);
  if (duplicate) {
    throw new AppError(409, "Organization code is already in use.", "ORGANIZATION_CODE_EXISTS");
  }

  const organizationId = createId();
  await db.insert(organizations).values({
    id: organizationId,
    name: body.name,
    code: body.code,
    domain: body.domain,
    status: "NOT_INVITED",
  });

  try {
    await createAdminInvitation(
      { id: organizationId, name: body.name },
      body.admin,
      request.auth!.userId,
      false,
    );
  } catch (error) {
    await db.delete(organizations).where(eq(organizations.id, organizationId));
    throw error;
  }

  await writeAudit({
    action: "PLATFORM_ORGANIZATION_CREATED",
    entityType: "Organization",
    entityId: organizationId,
    actorUserId: request.auth!.userId,
    request,
    metadata: { code: body.code, adminEmail: body.admin.email },
  });

  return {
    id: organizationId,
    name: body.name,
    code: body.code,
    domain: body.domain,
    status: "NOT_INVITED" as const,
    memberCount: 0,
  };
}

export async function updateOrganization(
  id: string,
  body: { name?: string; domain?: string; timezone?: string },
  request: Request,
) {
  await getOrganization(id);
  await db
    .update(organizations)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(organizations.id, id));
  await writeAudit({
    action: "PLATFORM_ORGANIZATION_UPDATED",
    entityType: "Organization",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
  });
  return getOrganization(id);
}

export async function updateOrganizationStatus(
  id: string,
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED",
  request: Request,
) {
  await getOrganization(id);
  await db
    .update(organizations)
    .set({ status, updatedAt: new Date() })
    .where(eq(organizations.id, id));
  await writeAudit({
    action: "PLATFORM_ORGANIZATION_STATUS_CHANGED",
    entityType: "Organization",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: { status },
  });
  return getOrganization(id);
}

export async function inviteOrganizationAdmin(
  id: string,
  body: Partial<AdminInput> | undefined,
  request: Request,
) {
  const organization = await getOrganization(id);

  // Try to find an existing invitation record
  const [existingInvitation] = await db
    .select()
    .from(organizationInvitations)
    .where(
      and(
        eq(organizationInvitations.organizationId, id),
        isNull(organizationInvitations.acceptedAt),
      ),
    )
    .limit(1);

  let invitationId: string;
  const invitationToken = createRandomToken();
  const tokenHash = sha256(invitationToken);
  const expiresAt = addDays(new Date(), env.INVITATION_EXPIRES_IN_DAYS);

  if (existingInvitation) {
    invitationId = existingInvitation.id;
    // Update existing invitation
    const email = body?.email ?? existingInvitation.email;
    const firstName = body?.firstName ?? existingInvitation.firstName;
    const lastName = body?.lastName ?? existingInvitation.lastName;

    await db
      .update(organizationInvitations)
      .set({
        firstName,
        lastName,
        email,
        tokenHash,
        expiresAt,
        invitedBy: request.auth!.userId,
      })
      .where(eq(organizationInvitations.id, invitationId));

    await mailService.sendInvitation(
      email,
      organization.name,
      invitationToken,
    );
  } else {
    // If no existing invitation, we require admin details in the request body
    if (!body?.email || !body?.firstName || !body?.lastName) {
      throw new AppError(400, "Administrator details are required to send an invitation.", "ADMIN_DETAILS_REQUIRED");
    }
    invitationId = await createAdminInvitation(
      organization,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
      },
      request.auth!.userId,
    );
  }

  await db
    .update(organizations)
    .set({ status: "PENDING", updatedAt: new Date() })
    .where(eq(organizations.id, id));

  await writeAudit({
    action: "PLATFORM_ORGANIZATION_ADMIN_INVITED",
    organizationId: id,
    entityType: "OrganizationInvitation",
    entityId: invitationId,
    actorUserId: request.auth!.userId,
    request,
  });
  return { invitationId };
}

export async function deleteOrganization(id: string, request: Request) {
  const organization = await getOrganization(id);
  await db.delete(organizations).where(eq(organizations.id, id));
  await writeAudit({
    action: "PLATFORM_ORGANIZATION_DELETED",
    entityType: "Organization",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: { name: organization.name, code: organization.code },
  });
}
