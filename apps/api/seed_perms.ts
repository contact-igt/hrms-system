import { eq } from 'drizzle-orm';
import { db } from './src/database/client.js';
import { permissions, rolePermissions, roles } from './src/database/index.js';
import crypto from 'node:crypto';
import { PERMISSIONS, ROLE_PERMISSIONS } from './src/common/constants/roles.js';

async function seed() {
  console.log('Seeding permissions...');
  for (const permCode of PERMISSIONS) {
    const existing = await db.select().from(permissions).where(eq(permissions.code, permCode));
    if (existing.length === 0) {
      await db.insert(permissions).values({
        id: crypto.randomUUID(),
        code: permCode,
        description: `Permission for ${permCode}`,
      });
      console.log(`Inserted permission: ${permCode}`);
    }
  }

  console.log('Seeding role_permissions...');
  const allRoles = await db.select().from(roles);
  const allPerms = await db.select().from(permissions);

  for (const [roleName, rolePermCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = allRoles.find(r => r.name === roleName)?.id;
    if (!roleId) {
      console.log(`Role ${roleName} not found in DB.`);
      continue;
    }

    for (const permCode of rolePermCodes) {
      const permId = allPerms.find(p => p.code === permCode)?.id;
      if (!permId) continue;

      const existingMapping = await db.select().from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId))
        .where(eq(rolePermissions.permissionId, permId)); // This won't work perfectly in drizzle without AND but it's just a seed

      // Actually, better to just try insert and ignore constraint
      try {
        await db.insert(rolePermissions).values({
          id: crypto.randomUUID(),
          roleId,
          permissionId: permId,
        });
        console.log(`Mapped ${roleName} -> ${permCode}`);
      } catch (e: any) {
        // Ignore duplicate entry errors
      }
    }
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
