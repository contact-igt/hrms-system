import { db } from './src/database/client.js';
import { rolePermissions, permissions, roles } from './src/database/index.js';
import { eq } from 'drizzle-orm';

async function check() {
  for (const roleName of ['ORGANIZATION_ADMIN', 'HR_ADMIN', 'EMPLOYEE', 'MANAGER']) {
      const roleRow = await db.select().from(roles).where(eq(roles.name, roleName));
      if (roleRow.length === 0) continue;
      
      const mapped = await db.select({
          code: permissions.code
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(rolePermissions.roleId, roleRow[0].id));
        
      console.log(`${roleName} permissions:`, mapped.map(m => m.code));
  }
  process.exit(0);
}
check();
