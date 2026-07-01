import { db } from './src/database/client.js';
import { users } from './src/database/index.js';
import { eq } from 'drizzle-orm';
import { getMembershipAccess } from './src/modules/auth/role.service.js';
import { organizationMemberships } from './src/database/index.js';

async function debug() {
  // Find an org admin or HR admin
  const admins = await db.select().from(organizationMemberships).where(eq(organizationMemberships.status, 'ACTIVE'));
  for (const m of admins) {
    const access = await getMembershipAccess(m.id);
    console.log('Membership:', m.id, 'User:', m.userId);
    console.log('Roles:', access.roles);
    console.log('Permissions:', access.permissions);
  }
  process.exit(0);
}
debug().catch(console.error);
