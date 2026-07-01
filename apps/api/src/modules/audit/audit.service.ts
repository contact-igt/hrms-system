import type { Request } from "express";
import { db } from "../../database/client.js";
import { auditLogs } from "../../database/index.js";
import { createId } from "../../common/utils/crypto.js";

type AuditInput = {
  action: string;
  entityType?: string;
  entityId?: string;
  organizationId?: string | null;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
  request?: Request;
};

export async function writeAudit(input: AuditInput) {
  await db.insert(auditLogs).values({
    id: createId(),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    organizationId: input.organizationId ?? null,
    actorUserId: input.actorUserId ?? null,
    requestId: input.request?.requestId,
    ipAddress: input.request?.ip,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}
