import { db } from './src/database/client.js';
import { rolePermissions, permissions } from './src/database/index.js';

async function check() {
  const perms = await db.select().from(permissions);
  console.log('Total perms:', perms.length);
  const deptPerm = perms.find(p => p.code === 'department.read');
  console.log('Department Read Perm:', deptPerm);
  process.exit(0);
}
check();
