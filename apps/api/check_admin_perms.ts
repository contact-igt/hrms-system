import { db } from './src/database/client.js';
import { rolePermissions, permissions, roles } from './src/database/index.js';
import { eq } from 'drizzle-orm';

async function check() {
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'HR_ADMIN'));
  if (adminRole.length === 0) return console.log('No admin role');
  
  const mapped = await db.select({
      code: permissions.code
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, adminRole[0].id));
    
  console.log('ORGANIZATION_ADMIN permissions:', mapped.map(m => m.code));
  process.exit(0);
}
check();
