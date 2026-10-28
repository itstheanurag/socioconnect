import { AuditActorTypeEnum, AuditRepository, UsageRepository, UsageSourceEnum } from "@repo/db";
import { logger } from "@repo/shared";
import type { AppBindings } from "@/types";
import type { Context } from "hono";
import { resolveWorkspaceId } from "./workspace";

function requestMetadata(c: Context<AppBindings>) {
  return {
    ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip") ?? null,
    userAgent: c.req.header("user-agent") ?? null,
    requestId: c.var.requestId ?? null,
  };
}

export async function recordAuditEvent(
  c: Context<AppBindings>,
  input: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const user = c.var.user;
  if (!user) return;

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const auth = c.var.auth;

    await AuditRepository.record({
      workspaceId,
      actorType: auth?.type === "api_key" ? AuditActorTypeEnum.API_KEY : AuditActorTypeEnum.USER,
      actorId: auth?.apiKeyId ?? user.id,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? {},
      ...requestMetadata(c),
    });
  } catch (err) {
    logger.error("failed to record audit event", {
      module: "security",
      action: "audit:record",
      error: err,
      auditAction: input.action,
    });
  }
}

export async function recordUsageEvent(
  c: Context<AppBindings>,
  input: {
    operation: string;
    quantity?: number;
    postId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const user = c.var.user;
  if (!user) return;

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const auth = c.var.auth;

    await UsageRepository.record({
      workspaceId,
      apiKeyId: auth?.apiKeyId ?? null,
      source: auth?.type === "api_key" ? UsageSourceEnum.API : UsageSourceEnum.WEB,
      operation: input.operation,
      quantity: input.quantity ?? 1,
      postId: input.postId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    logger.error("failed to record usage event", {
      module: "quotas",
      action: "usage:record",
      error: err,
      operation: input.operation,
    });
  }
}
