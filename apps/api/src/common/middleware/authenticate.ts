import type { NextFunction, Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { AppError } from "../errors/app-error.js";
import { db } from "../../database/client.js";
import {
  organizationMemberships,
  organizations,
  sessions,
  users,
} from "../../database/index.js";
import { getMembershipAccess, getPlatformAccess } from "../../modules/auth/role.service.js";
import { verifyAccessToken } from "../../modules/auth/token.service.js";

export type AuthContext = {
  userId: string;
  sessionId: string;
  scopeType: "PLATFORM" | "ORGANIZATION";
  organizationId?: string;
  membershipId?: string;
  roles: string[];
  permissions: string[];
};

export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication is required.", "AUTH_REQUIRED");
    }

    const claims = verifyAccessToken(authorization.slice(7));
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, claims.sid), isNull(sessions.revokedAt)))
      .limit(1);

    if (!session || session.userId !== claims.sub || session.expiresAt <= new Date()) {
      throw new AppError(401, "Session is no longer active.", "AUTH_SESSION_REVOKED");
    }

    const [user] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError(403, "Account is not active.", "AUTH_ACCOUNT_UNAVAILABLE");
    }

    if (claims.scopeType === "PLATFORM") {
      const access = await getPlatformAccess(user.id);
      request.auth = {
        userId: user.id,
        sessionId: session.id,
        scopeType: "PLATFORM",
        ...access,
      };
      next();
      return;
    }

    if (!claims.organizationId || !claims.membershipId) {
      throw new AppError(401, "Organization token scope is invalid.", "AUTH_TOKEN_INVALID");
    }

    const [membership] = await db
      .select({
        id: organizationMemberships.id,
        status: organizationMemberships.status,
        organizationStatus: organizations.status,
      })
      .from(organizationMemberships)
      .innerJoin(
        organizations,
        eq(organizationMemberships.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationMemberships.id, claims.membershipId),
          eq(organizationMemberships.userId, user.id),
          eq(organizationMemberships.organizationId, claims.organizationId),
        ),
      )
      .limit(1);

    if (
      !membership ||
      membership.status !== "ACTIVE" ||
      membership.organizationStatus !== "ACTIVE"
    ) {
      throw new AppError(403, "Organization access is not active.", "AUTH_ACCOUNT_UNAVAILABLE");
    }

    const access = await getMembershipAccess(membership.id);
    request.auth = {
      userId: user.id,
      sessionId: session.id,
      scopeType: "ORGANIZATION",
      organizationId: claims.organizationId,
      membershipId: membership.id,
      ...access,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireScope(scope: "PLATFORM" | "ORGANIZATION") {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (request.auth?.scopeType !== scope) {
      next(new AppError(403, "This route is outside the active access scope.", "AUTH_SCOPE_DENIED"));
      return;
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth?.permissions.includes(permission)) {
      next(new AppError(403, "You do not have permission for this action.", "AUTH_PERMISSION_DENIED"));
      return;
    }
    next();
  };
}
