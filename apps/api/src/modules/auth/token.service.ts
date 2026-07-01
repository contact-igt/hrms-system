import { randomUUID } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { and, eq, isNull } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../database/client.js";
import { sessions } from "../../database/index.js";
import { AppError } from "../../common/errors/app-error.js";
import { createId, sha256 } from "../../common/utils/crypto.js";
import { durationToMilliseconds } from "../../common/utils/date.js";

export type SessionScope = {
  scopeType: "PLATFORM" | "ORGANIZATION";
  organizationId?: string;
  membershipId?: string;
};

export type AccessClaims = JwtPayload &
  SessionScope & {
    sub: string;
    sid: string;
    type: "access";
    jti: string;
  };

type RefreshClaims = JwtPayload &
  SessionScope & {
    sub: string;
    sid: string;
    type: "refresh";
    jti: string;
  };

const accessOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  algorithm: "HS256",
};

const refreshOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  algorithm: "HS256",
};

function signAccessToken(userId: string, sessionId: string, scope: SessionScope) {
  return jwt.sign(
    {
      ...scope,
      sid: sessionId,
      type: "access",
      jti: randomUUID(),
    },
    env.JWT_ACCESS_SECRET,
    { ...accessOptions, subject: userId },
  );
}

function signRefreshToken(
  userId: string,
  sessionId: string,
  scope: SessionScope,
  jti: string,
) {
  return jwt.sign(
    {
      ...scope,
      sid: sessionId,
      type: "refresh",
      jti,
    },
    env.JWT_REFRESH_SECRET,
    { ...refreshOptions, subject: userId },
  );
}

export async function createSession(input: {
  userId: string;
  scope: SessionScope;
  userAgent?: string;
  ipAddress?: string;
}) {
  const sessionId = createId();
  const refreshJti = createId();
  const refreshToken = signRefreshToken(
    input.userId,
    sessionId,
    input.scope,
    refreshJti,
  );
  const expiresAt = new Date(
    Date.now() + durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN),
  );

  await db.insert(sessions).values({
    id: sessionId,
    userId: input.userId,
    scopeType: input.scope.scopeType,
    organizationId: input.scope.organizationId,
    membershipId: input.scope.membershipId,
    refreshTokenHash: sha256(refreshToken),
    refreshJti,
    userAgent: input.userAgent?.slice(0, 500),
    ipAddress: input.ipAddress,
    expiresAt,
  });

  return {
    accessToken: signAccessToken(input.userId, sessionId, input.scope),
    refreshToken,
    expiresAt,
  };
}

export function verifyAccessToken(token: string): AccessClaims {
  try {
    const claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: ["HS256"],
    }) as AccessClaims;

    if (claims.type !== "access" || !claims.sub || !claims.sid) {
      throw new Error("Invalid access token claims.");
    }

    return claims;
  } catch {
    throw new AppError(401, "Access token is invalid or expired.", "AUTH_TOKEN_INVALID");
  }
}

export function verifyRefreshToken(token: string): RefreshClaims {
  try {
    const claims = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: ["HS256"],
    }) as RefreshClaims;

    if (claims.type !== "refresh" || !claims.sub || !claims.sid || !claims.jti) {
      throw new Error("Invalid refresh token claims.");
    }

    return claims;
  } catch {
    throw new AppError(401, "Refresh token is invalid or expired.", "AUTH_TOKEN_INVALID");
  }
}

export async function rotateRefreshToken(rawToken: string) {
  const claims = verifyRefreshToken(rawToken);
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, claims.sid), isNull(sessions.revokedAt)))
    .limit(1);

  if (!session || session.expiresAt <= new Date()) {
    throw new AppError(401, "Session is no longer active.", "AUTH_SESSION_REVOKED");
  }

  if (
    session.refreshTokenHash !== sha256(rawToken) ||
    session.refreshJti !== claims.jti
  ) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, claims.sid));
    throw new AppError(
      401,
      "Refresh token reuse was detected.",
      "AUTH_REFRESH_REUSE_DETECTED",
    );
  }

  const scope: SessionScope = {
    scopeType: session.scopeType,
    ...(session.organizationId
      ? { organizationId: session.organizationId }
      : {}),
    ...(session.membershipId ? { membershipId: session.membershipId } : {}),
  };
  const refreshJti = createId();
  const refreshToken = signRefreshToken(
    session.userId,
    session.id,
    scope,
    refreshJti,
  );
  const expiresAt = new Date(
    Date.now() + durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN),
  );

  await db
    .update(sessions)
    .set({
      refreshTokenHash: sha256(refreshToken),
      refreshJti,
      expiresAt,
      lastUsedAt: new Date(),
    })
    .where(eq(sessions.id, session.id));

  return {
    claims,
    session,
    accessToken: signAccessToken(session.userId, session.id, scope),
    refreshToken,
    expiresAt,
  };
}

export async function revokeSession(sessionId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function revokeAllUserSessions(userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}
