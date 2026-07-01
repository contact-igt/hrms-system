import { db } from './src/database/client.js';
import { membershipRoles, organizationMemberships } from './src/database/index.js';
import { eq } from 'drizzle-orm';

async function check() {
  const allMembers = await db.select().from(organizationMemberships);
  for (const m of allMembers) {
    const r = await db.select().from(membershipRoles).where(eq(membershipRoles.membershipId, m.id));
    console.log(`Member ${m.id} has ${r.length} roles.`);
  }
  process.exit(0);
}
check().catch(console.error);
