import { and, eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { createId } from "../common/utils/crypto.js";
import { db, pool } from "../database/client.js";
import { seedRbac } from "../database/seed.js";
import {
  platformUserRoles,
  roles,
  users,
} from "../database/index.js";
import { passwordService } from "../modules/auth/password.service.js";

if (!env.PLATFORM_ADMIN_EMAIL || !env.PLATFORM_ADMIN_PASSWORD) {
  throw new Error(
    "PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD are required.",
  );
}

await seedRbac();

const [platformRole] = await db
  .select({ id: roles.id })
  .from(roles)
  .where(
    and(
      eq(roles.name, "PLATFORM_SUPER_ADMIN"),
      eq(roles.scope, "PLATFORM"),
    ),
  )
  .limit(1);

if (!platformRole) {
  throw new Error("PLATFORM_SUPER_ADMIN role was not seeded.");
}

const email = env.PLATFORM_ADMIN_EMAIL.toLowerCase();
const passwordHash = await passwordService.hash(env.PLATFORM_ADMIN_PASSWORD);
const [existing] = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
const userId = existing?.id ?? createId();

if (existing) {
  await db
    .update(users)
    .set({
      firstName: env.PLATFORM_ADMIN_FIRST_NAME,
      lastName: env.PLATFORM_ADMIN_LAST_NAME,
      passwordHash,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    })
    .where(eq(users.id, userId));
} else {
  await db.insert(users).values({
    id: userId,
    firstName: env.PLATFORM_ADMIN_FIRST_NAME,
    lastName: env.PLATFORM_ADMIN_LAST_NAME,
    email,
    passwordHash,
    status: "ACTIVE",
    emailVerifiedAt: new Date(),
  });
}

const [roleLink] = await db
  .select({ userId: platformUserRoles.userId })
  .from(platformUserRoles)
  .where(
    and(
      eq(platformUserRoles.userId, userId),
      eq(platformUserRoles.roleId, platformRole.id),
    ),
  )
  .limit(1);

if (!roleLink) {
  await db
    .insert(platformUserRoles)
    .values({ userId, roleId: platformRole.id });
}

console.log(`Platform Super Admin is ready: ${email}`);
await pool.end();
