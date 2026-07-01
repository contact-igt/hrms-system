import { db } from './src/database/client.js';
import { users, sessions, organizationMemberships, roles } from './src/database/index.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from './src/config/env.js';

async function testApi() {
  const admins = await db.select().from(organizationMemberships).where(eq(organizationMemberships.status, 'ACTIVE'));
  if (admins.length === 0) return console.log('No org admins found');
  const admin = admins[0];
  
  const sessionId = 'test-session-' + Date.now();
  await db.insert(sessions).values({
    id: sessionId,
    userId: admin.userId,
    scopeType: 'ORGANIZATION',
    organizationId: admin.organizationId,
    membershipId: admin.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    userAgent: 'test',
    ipAddress: '127.0.0.1'
  });
  
  const token = jwt.sign(
    {
      scopeType: 'ORGANIZATION',
      organizationId: admin.organizationId,
      membershipId: admin.id,
      sid: sessionId,
      type: "access",
      jti: randomUUID(),
    },
    env.JWT_ACCESS_SECRET,
    { 
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithm: "HS256", 
      subject: admin.userId 
    },
  );
  
  console.log('Token created. Making request...');
  
  const response = await fetch('http://localhost:5050/api/v1/organization/members', {
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
