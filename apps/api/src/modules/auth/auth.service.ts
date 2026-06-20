import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../database/client.js";
import {
  employees,
  membershipRoles,
  organizationInvitations,
  organizationMemberships,
  organizations,
  passwordResetTokens,
  sessions,
  users,
} from "../../database/schema/index.js";
import { AppError } from "../../common/errors/app-error.js";
import {
  createId,
  createRandomToken,
  sha256,
} from "../../common/utils/crypto.js";
import { addMinutes } from "../../common/utils/date.js";
import { writeAudit } from "../audit/audit.service.js";
import { passwordService } from "./password.service.js";
import {
  createOtpChallenge,
  resendOtpChallenge,
  verifyOtpChallenge,
  type OtpPurpose,
} from "./otp.service.js";
import {
  findRoleId,
  getMembershipAccess,
  getPlatformAccess,
} from "./role.service.js";
import {
  createSession,
  revokeAllUserSessions,
  revokeSession,
  rotateRefreshToken,
  verifyRefreshToken,
  type SessionScope,
} from "./token.service.js";

function setRefreshCookie(response: Response, token: string, expiresAt: Date) {
  response.cookie(env.REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    expires: expiresAt,
  });
}

function clearRefreshCookie(response: Response) {
  response.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
  });
}

async function buildSessionResponse(
  userId: string,
  accessToken: string,
  scope: SessionScope,
) {
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError(401, "User account was not found.", "AUTH_ACCOUNT_UNAVAILABLE");
  }

  if (scope.scopeType === "PLATFORM") {
    const access = await getPlatformAccess(userId);
    return {
      accessToken,
      user: {
        ...user,
        scopeType: "PLATFORM" as const,
        ...access,
      },
    };
  }

  if (!scope.organizationId || !scope.membershipId) {
    throw new AppError(401, "Organization session scope is invalid.", "AUTH_TOKEN_INVALID");
  }

  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      code: organizations.code,
    })
    .from(organizations)
    .where(eq(organizations.id, scope.organizationId))
    .limit(1);

  const access = await getMembershipAccess(scope.membershipId);
  return {
    accessToken,
    user: {
      ...user,
      scopeType: "ORGANIZATION" as const,
      organization,
      ...access,
    },
  };
}

async function createAuthenticatedSession(input: {
  userId: string;
  scope: SessionScope;
  request: Request;
  response: Response;
}) {
  const tokenPair = await createSession({
    userId: input.userId,
    scope: input.scope,
    userAgent: input.request.header("user-agent"),
    ipAddress: input.request.ip,
  });
  setRefreshCookie(input.response, tokenPair.refreshToken, tokenPair.expiresAt);
  return buildSessionResponse(input.userId, tokenPair.accessToken, input.scope);
}

async function ensureActiveUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const genericError = new AppError(
    401,
    "Email or password is incorrect.",
    "AUTH_INVALID_CREDENTIALS",
  );

  if (!user?.passwordHash) {
    throw genericError;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, "Account is temporarily locked.", "AUTH_ACCOUNT_LOCKED");
  }

  const valid = await passwordService.verify(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        ...(attempts >= 5
          ? { lockedUntil: new Date(Date.now() + 15 * 60_000) }
          : {}),
      })
      .where(eq(users.id, user.id));
    throw genericError;
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(403, "Account is not active.", "AUTH_ACCOUNT_UNAVAILABLE");
  }

  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return user;
}

export async function platformLogin(
  body: { email: string; password: string },
  request: Request,
  response: Response,
) {
  const user = await ensureActiveUser(body.email, body.password);
  const access = await getPlatformAccess(user.id);
  if (!access.roles.includes("PLATFORM_SUPER_ADMIN")) {
    throw new AppError(403, "This account does not have platform access.", "AUTH_SCOPE_DENIED");
  }

  const result = await createAuthenticatedSession({
    userId: user.id,
    scope: { scopeType: "PLATFORM" },
    request,
    response,
  });
  await writeAudit({
    action: "AUTH_PLATFORM_LOGIN_SUCCEEDED",
    actorUserId: user.id,
    request,
  });
  return result;
}

export async function organizationLogin(
  body: { email: string; password: string; organizationCode: string },
  request: Request,
  response: Response,
) {
  const user = await ensureActiveUser(body.email, body.password);
  const [membership] = await db
    .select({
      id: organizationMemberships.id,
      organizationId: organizations.id,
      membershipStatus: organizationMemberships.status,
      organizationStatus: organizations.status,
    })
    .from(organizationMemberships)
    .innerJoin(
      organizations,
      eq(organizationMemberships.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMemberships.userId, user.id),
        eq(organizations.code, body.organizationCode),
      ),
    )
    .limit(1);

  if (
    !membership ||
    membership.membershipStatus !== "ACTIVE" ||
    membership.organizationStatus !== "ACTIVE"
  ) {
    throw new AppError(
      403,
      "Organization membership is not active.",
      "AUTH_ACCOUNT_UNAVAILABLE",
    );
  }

  const result = await createAuthenticatedSession({
    userId: user.id,
    scope: {
      scopeType: "ORGANIZATION",
      organizationId: membership.organizationId,
      membershipId: membership.id,
    },
    request,
    response,
  });
  await writeAudit({
    action: "AUTH_ORGANIZATION_LOGIN_SUCCEEDED",
    organizationId: membership.organizationId,
    actorUserId: user.id,
    request,
  });
  return result;
}

export async function registerFromInvitation(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  invitationToken: string;
}) {
  const tokenHash = sha256(body.invitationToken);
  const [invitation] = await db
    .select({
      id: organizationInvitations.id,
      organizationId: organizationInvitations.organizationId,
      email: organizationInvitations.email,
      roleName: organizationInvitations.roleName,
      employeeCode: organizationInvitations.employeeCode,
      departmentId: organizationInvitations.departmentId,
      designationId: organizationInvitations.designationId,
      expiresAt: organizationInvitations.expiresAt,
      acceptedAt: organizationInvitations.acceptedAt,
      organizationStatus: organizations.status,
    })
    .from(organizationInvitations)
    .innerJoin(
      organizations,
      eq(organizationInvitations.organizationId, organizations.id),
    )
    .where(eq(organizationInvitations.tokenHash, tokenHash))
    .limit(1);

  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.expiresAt <= new Date() ||
    !["PENDING", "ACTIVE"].includes(invitation.organizationStatus) ||
    invitation.email !== body.email
  ) {
    throw new AppError(400, "Invitation is invalid or expired.", "AUTH_INVITATION_INVALID");
  }

  const passwordHash = await passwordService.hash(body.password);
  const roleId = await findRoleId(invitation.roleName, "ORGANIZATION");
  if (!roleId) {
    throw new AppError(500, "Invitation role is not configured.");
  }

  let userId = "";
  await db.transaction(async (transaction) => {
    const [existingUser] = await transaction
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser?.status === "ACTIVE") {
      throw new AppError(409, "An active account already exists.", "AUTH_ACCOUNT_EXISTS");
    }

    userId = existingUser?.id ?? createId();
    if (existingUser) {
      await transaction
        .update(users)
        .set({
          firstName: body.firstName,
          lastName: body.lastName,
          passwordHash,
          status: "PENDING_VERIFICATION",
        })
        .where(eq(users.id, existingUser.id));
    } else {
      await transaction.insert(users).values({
        id: userId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        passwordHash,
        status: "PENDING_VERIFICATION",
      });
    }

    const membershipId = createId();
    await transaction.insert(organizationMemberships).values({
      id: membershipId,
      organizationId: invitation.organizationId,
      userId,
      status: "INVITED",
    });
    await transaction.insert(membershipRoles).values({ membershipId, roleId });

    if (invitation.employeeCode) {
      const [employee] = await transaction
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.organizationId, invitation.organizationId),
            eq(employees.employeeCode, invitation.employeeCode),
          ),
        )
        .limit(1);

      if (employee) {
        await transaction
          .update(employees)
          .set({ userId })
          .where(eq(employees.id, employee.id));
      }
    }
  });

  return createOtpChallenge({
    userId,
    destination: body.email,
    purpose: "EMAIL_VERIFICATION",
  });
}

export async function verifyEmailOtp(
  body: { challengeId: string; otp: string },
  request: Request,
  response: Response,
) {
  const challenge = await verifyOtpChallenge({
    challengeId: body.challengeId,
    otp: body.otp,
    purpose: "EMAIL_VERIFICATION",
  });

  if (!challenge.userId) {
    throw new AppError(400, "OTP is not linked to an account.", "AUTH_OTP_INVALID");
  }

  const [membership] = await db
    .select()
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.userId, challenge.userId),
        eq(organizationMemberships.status, "INVITED"),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new AppError(400, "No pending organization membership was found.");
  }

  const access = await getMembershipAccess(membership.id);
  await db.transaction(async (transaction) => {
    await transaction
      .update(users)
      .set({ status: "ACTIVE", emailVerifiedAt: new Date() })
      .where(eq(users.id, challenge.userId!));
    await transaction
      .update(organizationMemberships)
      .set({ status: "ACTIVE" })
      .where(eq(organizationMemberships.id, membership.id));
    await transaction
      .update(employees)
      .set({ status: "ACTIVE" })
      .where(
        and(
          eq(employees.organizationId, membership.organizationId),
          eq(employees.userId, challenge.userId!),
        ),
      );
    await transaction
      .update(organizationInvitations)
      .set({ acceptedAt: new Date() })
      .where(
        and(
          eq(organizationInvitations.organizationId, membership.organizationId),
          eq(organizationInvitations.email, challenge.destination),
          isNull(organizationInvitations.acceptedAt),
        ),
      );
    if (access.roles.includes("ORGANIZATION_ADMIN")) {
      await transaction
        .update(organizations)
        .set({ status: "ACTIVE" })
        .where(eq(organizations.id, membership.organizationId));
    }
  });

  return createAuthenticatedSession({
    userId: challenge.userId,
    scope: {
      scopeType: "ORGANIZATION",
      organizationId: membership.organizationId,
      membershipId: membership.id,
    },
    request,
    response,
  });
}

export async function requestPasswordReset(email: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, status: users.status })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.status !== "ACTIVE") {
    return {
      challengeId: createId(),
      purpose: "PASSWORD_RESET" as const,
      maskedDestination: "your registered email",
      expiresInSeconds: env.OTP_EXPIRES_IN_MINUTES * 60,
    };
  }

  return createOtpChallenge({
    userId: user.id,
    destination: user.email,
    purpose: "PASSWORD_RESET",
  });
}

export async function requestOtpLogin(
  email: string,
  organizationCode: string,
) {
  const [account] = await db
    .select({
      userId: users.id,
      email: users.email,
      userStatus: users.status,
      membershipStatus: organizationMemberships.status,
      organizationStatus: organizations.status,
    })
    .from(users)
    .innerJoin(
      organizationMemberships,
      eq(organizationMemberships.userId, users.id),
    )
    .innerJoin(
      organizations,
      eq(organizationMemberships.organizationId, organizations.id),
    )
    .where(and(eq(users.email, email), eq(organizations.code, organizationCode)))
    .limit(1);

  if (
    !account ||
    account.userStatus !== "ACTIVE" ||
    account.membershipStatus !== "ACTIVE" ||
    account.organizationStatus !== "ACTIVE"
  ) {
    return {
      challengeId: createId(),
      purpose: "LOGIN" as const,
      maskedDestination: "your registered email",
      expiresInSeconds: env.OTP_EXPIRES_IN_MINUTES * 60,
    };
  }

  return createOtpChallenge({
    userId: account.userId,
    destination: account.email,
    purpose: "LOGIN",
  });
}

export async function verifyOtpLogin(
  body: { challengeId: string; otp: string; organizationCode: string },
  request: Request,
  response: Response,
) {
  const challenge = await verifyOtpChallenge({
    challengeId: body.challengeId,
    otp: body.otp,
    purpose: "LOGIN",
  });
  if (!challenge.userId) {
    throw new AppError(400, "OTP is not linked to an account.", "AUTH_OTP_INVALID");
  }

  const [membership] = await db
    .select({
      id: organizationMemberships.id,
      organizationId: organizationMemberships.organizationId,
      membershipStatus: organizationMemberships.status,
      organizationStatus: organizations.status,
      userStatus: users.status,
    })
    .from(organizationMemberships)
    .innerJoin(users, eq(organizationMemberships.userId, users.id))
    .innerJoin(
      organizations,
      eq(organizationMemberships.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMemberships.userId, challenge.userId),
        eq(organizations.code, body.organizationCode),
      ),
    )
    .limit(1);

  if (
    !membership ||
    membership.membershipStatus !== "ACTIVE" ||
    membership.organizationStatus !== "ACTIVE" ||
    membership.userStatus !== "ACTIVE"
  ) {
    throw new AppError(403, "Organization access is not active.");
  }

  return createAuthenticatedSession({
    userId: challenge.userId,
    scope: {
      scopeType: "ORGANIZATION",
      organizationId: membership.organizationId,
      membershipId: membership.id,
    },
    request,
    response,
  });
}

export async function verifyPasswordResetOtp(challengeId: string, otp: string) {
  const challenge = await verifyOtpChallenge({
    challengeId,
    otp,
    purpose: "PASSWORD_RESET",
  });
  if (!challenge.userId) {
    throw new AppError(400, "OTP is not linked to an account.", "AUTH_OTP_INVALID");
  }

  const resetTicket = createRandomToken();
  await db.insert(passwordResetTokens).values({
    id: createId(),
    userId: challenge.userId,
    tokenHash: sha256(resetTicket),
    expiresAt: addMinutes(new Date(), env.RESET_TICKET_EXPIRES_IN_MINUTES),
  });

  return { resetTicket };
}

export async function resetPassword(resetTicket: string, password: string) {
  const [ticket] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, sha256(resetTicket)))
    .limit(1);

  if (!ticket || ticket.usedAt || ticket.expiresAt <= new Date()) {
    throw new AppError(
      400,
      "Reset ticket is invalid or expired.",
      "AUTH_RESET_TOKEN_INVALID",
    );
  }

  const passwordHash = await passwordService.hash(password);
  await db.transaction(async (transaction) => {
    await transaction
      .update(users)
      .set({ passwordHash, passwordChangedAt: new Date() })
      .where(eq(users.id, ticket.userId));
    await transaction
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, ticket.id));
    await transaction
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, ticket.userId), isNull(sessions.revokedAt)));
  });

  return { completed: true as const };
}

export async function refreshSession(
  rawRefreshToken: string | undefined,
  response: Response,
) {
  if (!rawRefreshToken) {
    throw new AppError(401, "Refresh cookie is missing.", "AUTH_REQUIRED");
  }

  const rotated = await rotateRefreshToken(rawRefreshToken);
  const scope: SessionScope = {
    scopeType: rotated.session.scopeType,
    ...(rotated.session.organizationId
      ? { organizationId: rotated.session.organizationId }
      : {}),
    ...(rotated.session.membershipId
      ? { membershipId: rotated.session.membershipId }
      : {}),
  };

  const [user] = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, rotated.session.userId))
    .limit(1);
  if (!user || user.status !== "ACTIVE") {
    await revokeSession(rotated.session.id);
    throw new AppError(403, "Account is not active.", "AUTH_ACCOUNT_UNAVAILABLE");
  }

  if (scope.scopeType === "ORGANIZATION") {
    const [membership] = await db
      .select({
        membershipStatus: organizationMemberships.status,
        organizationStatus: organizations.status,
      })
      .from(organizationMemberships)
      .innerJoin(
        organizations,
        eq(organizationMemberships.organizationId, organizations.id),
      )
      .where(eq(organizationMemberships.id, scope.membershipId!))
      .limit(1);
    if (
      !membership ||
      membership.membershipStatus !== "ACTIVE" ||
      membership.organizationStatus !== "ACTIVE"
    ) {
      await revokeSession(rotated.session.id);
      throw new AppError(403, "Organization access is not active.");
    }
  }

  setRefreshCookie(response, rotated.refreshToken, rotated.expiresAt);
  return buildSessionResponse(
    rotated.session.userId,
    rotated.accessToken,
    scope,
  );
}

export async function logout(
  rawRefreshToken: string | undefined,
  response: Response,
) {
  if (rawRefreshToken) {
    try {
      const claims = verifyRefreshToken(rawRefreshToken);
      await revokeSession(claims.sid);
    } catch {
      // Logout remains idempotent for invalid or expired cookies.
    }
  }
  clearRefreshCookie(response);
  return { completed: true as const };
}

export async function logoutAll(userId: string, response: Response) {
  await revokeAllUserSessions(userId);
  clearRefreshCookie(response);
  return { completed: true as const };
}

export { resendOtpChallenge };
export type { OtpPurpose };
