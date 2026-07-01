import { db } from './src/database/client.js';
import { employees, organizationInvitations, organizations } from './src/database/index.js';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

async function seedInvitedEmployee() {
  const orgs = await db.select().from(organizations).limit(1);
  if (!orgs.length) return console.log('No orgs found');
  const org = orgs[0];

  const employeeCode = 'INV-123';
  
  await db.insert(employees).values({
    id: randomUUID(),
    organizationId: org.id,
    employeeCode: employeeCode,
    status: 'INVITED'
  });
  
  await db.insert(organizationInvitations).values({
    id: randomUUID(),
    organizationId: org.id,
    email: 'test_invite@example.com',
    firstName: 'Test',
    lastName: 'Invited',
    roleName: 'EMPLOYEE',
    employeeCode: employeeCode,
    tokenHash: 'xyz',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });
  
  console.log('Seeded invited employee');
  process.exit(0);
}
seedInvitedEmployee().catch(console.error);
