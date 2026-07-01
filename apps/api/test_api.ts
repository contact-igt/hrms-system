import { db } from './src/database/client.js';
import { users, sessions, organizationMemberships, roles } from './src/database/index.js';
import { eq } from 'drizzle-orm';
import { createAccessToken } from './src/modules/auth/token.service.js';

async function testApi() {
  // 1. Get an organization admin
  const admins = await db.select().from(organizationMemberships).where(eq(organizationMemberships.status, 'ACTIVE'));
  if (admins.length === 0) return console.log('No org admins found');
  const admin = admins[0];
  
  // 2. Create a session for them
  const sessionId = 'test-session-' + Date.now();
  await db.insert(sessions).values({
    id: sessionId,
    userId: admin.userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    userAgent: 'test',
    ipAddress: '127.0.0.1'
  });
  
  // 3. Create a token
  const token = createAccessToken(admin.userId, sessionId, {
    scopeType: 'ORGANIZATION',
    organizationId: admin.organizationId,
    membershipId: admin.id
  });
  
  console.log('Token created. Making request...');
  
  // 4. Make request to the local API
  const response = await fetch('http://localhost:3000/api/v1/organization/members', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${text}`);
  
  process.exit(0);
}

testApi().catch(console.error);
