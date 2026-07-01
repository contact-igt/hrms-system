import { and, eq } from "drizzle-orm";
import {
  ORGANIZATION_ROLES,
  PERMISSIONS,
  PLATFORM_ROLES,
  ROLE_PERMISSIONS,
} from "../common/constants/roles.js";
import { createId } from "../common/utils/crypto.js";
import { db } from "./client.js";
import {
  permissions,
  rolePermissions,
  roles,
} from "./index.js";

export async function seedRbac() {
  const permissionIds = new Map<string, string>();

  for (const code of PERMISSIONS) {
    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.code, code))
      .limit(1);
    const permissionId = existing?.id ?? createId();
    if (!existing) {
      await db.insert(permissions).values({ id: permissionId, code });
    }
    permissionIds.set(code, permissionId);
  }

  const roleScopes = [
    ...PLATFORM_ROLES.map((name) => ({ name, scope: "PLATFORM" as const })),
    ...ORGANIZATION_ROLES.map((name) => ({
      name,
      scope: "ORGANIZATION" as const,
    })),
  ];

  for (const definition of roleScopes) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(
        and(
          eq(roles.name, definition.name),
          eq(roles.scope, definition.scope),
        ),
      )
      .limit(1);
    const roleId = existing?.id ?? createId();
    if (!existing) {
      await db.insert(roles).values({
        id: roleId,
        name: definition.name,
        scope: definition.scope,
      });
    }

    for (const permissionCode of ROLE_PERMISSIONS[definition.name] ?? []) {
      const permissionId = permissionIds.get(permissionCode);
      if (!permissionId) continue;
      const [link] = await db
        .select({ roleId: rolePermissions.roleId })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId),
          ),
        )
        .limit(1);
      if (!link) {
        await db.insert(rolePermissions).values({ roleId, permissionId });
      }
    }
  }
}
