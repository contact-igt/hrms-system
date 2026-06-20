import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../database/client.js";
import {
  membershipRoles,
  permissions,
  platformUserRoles,
  rolePermissions,
  roles,
} from "../../database/schema/index.js";

async function loadRoleDetails(roleIds: string[]) {
  if (roleIds.length === 0) {
    return { roles: [] as string[], permissions: [] as string[] };
  }

  const roleRows = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(inArray(roles.id, roleIds));

  const permissionRows = await db
    .select({ code: permissions.code })
    .from(rolePermissions)
    .innerJoin(
      permissions,
      eq(rolePermissions.permissionId, permissions.id),
    )
    .where(inArray(rolePermissions.roleId, roleIds));

  return {
    roles: [...new Set(roleRows.map((row) => row.name))],
    permissions: [...new Set(permissionRows.map((row) => row.code))],
  };
}

export async function getPlatformAccess(userId: string) {
  const rows = await db
    .select({ roleId: platformUserRoles.roleId })
    .from(platformUserRoles)
    .where(eq(platformUserRoles.userId, userId));

  return loadRoleDetails(rows.map((row) => row.roleId));
}

export async function getMembershipAccess(membershipId: string) {
  const rows = await db
    .select({ roleId: membershipRoles.roleId })
    .from(membershipRoles)
    .where(eq(membershipRoles.membershipId, membershipId));

  return loadRoleDetails(rows.map((row) => row.roleId));
}

export async function findRoleId(name: string, scope: "PLATFORM" | "ORGANIZATION") {
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.name, name), eq(roles.scope, scope)))
    .limit(1);

  return role?.id;
}
