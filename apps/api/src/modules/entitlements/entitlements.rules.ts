import type { Subscription } from "@repo/db";

export interface EntitlementDecision {
  allowed: boolean;
  code?: "SUBSCRIPTION_INACTIVE" | "QUOTA_EXCEEDED";
  message?: string;
  limit?: number;
  used?: number;
  requested?: number;
  remaining?: number;
}

const BLOCKED_STATUSES = new Set(["paused", "canceled", "unpaid"]);

export function evaluateSubscriptionStatus(subscription: Subscription): EntitlementDecision {
  if (BLOCKED_STATUSES.has(subscription.status)) {
    return {
      allowed: false,
      code: "SUBSCRIPTION_INACTIVE",
      message: `Subscription is ${subscription.status}. Reactivate the workspace to publish.`,
    };
  }

  return { allowed: true };
}

export function evaluateMonthlyLimit(input: {
  used: number;
  limit: number;
  requested: number;
  label: string;
}): EntitlementDecision {
  const requested = Math.max(0, input.requested);
  const remaining = Math.max(0, input.limit - input.used);

  if (input.used + requested > input.limit) {
    return {
      allowed: false,
      code: "QUOTA_EXCEEDED",
      message: `${input.label} limit reached: ${input.used}/${input.limit} used, ${requested} requested.`,
      limit: input.limit,
      used: input.used,
      requested,
      remaining,
    };
  }

  return { allowed: true, limit: input.limit, used: input.used, requested, remaining };
}

export function evaluatePublishEntitlement(
  subscription: Subscription,
  destinationCount: number,
): EntitlementDecision {
  const status = evaluateSubscriptionStatus(subscription);
  if (!status.allowed) return status;

  return evaluateMonthlyLimit({
    used: subscription.usage.monthlyDropsUsed,
    limit: subscription.limits.maxMonthlyDrops,
    requested: destinationCount,
    label: "Monthly publish",
  });
}

export function evaluateAiEntitlement(
  subscription: Subscription,
  creditCount: number,
): EntitlementDecision {
  const status = evaluateSubscriptionStatus(subscription);
  if (!status.allowed) return status;

  return evaluateMonthlyLimit({
    used: subscription.usage.aiCreditsUsed,
    limit: subscription.limits.maxAiCredits,
    requested: creditCount,
    label: "AI credit",
  });
}

export function evaluateChannelEntitlement(
  subscription: Subscription,
  channelCount = 1,
): EntitlementDecision {
  const status = evaluateSubscriptionStatus(subscription);
  if (!status.allowed) return status;

  return evaluateMonthlyLimit({
    used: subscription.usage.channelsUsed,
    limit: subscription.limits.maxChannels,
    requested: channelCount,
    label: "Connected channel",
  });
}

export function evaluateSeatEntitlement(
  subscription: Subscription,
  pendingInvites = 0,
  seatCount = 1,
): EntitlementDecision {
  const status = evaluateSubscriptionStatus(subscription);
  if (!status.allowed) return status;

  return evaluateMonthlyLimit({
    used: subscription.usage.teamMembersUsed + Math.max(0, pendingInvites),
    limit: subscription.limits.maxTeamMembers,
    requested: seatCount,
    label: "Team seat",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function evaluateStorageEntitlement(
  subscription: Subscription,
  requestedBytes: number,
): EntitlementDecision {
  const status = evaluateSubscriptionStatus(subscription);
  if (!status.allowed) return status;

  const used = subscription.usage.cdnStorageUsedBytes;
  const limit = subscription.limits.maxCdnStorageBytes;
  const requested = Math.max(0, requestedBytes);
  const remaining = Math.max(0, limit - used);

  if (used + requested > limit) {
    return {
      allowed: false,
      code: "QUOTA_EXCEEDED",
      message: `Media storage limit reached: ${formatBytes(used)} of ${formatBytes(limit)} used, ${formatBytes(requested)} requested.`,
      limit,
      used,
      requested,
      remaining,
    };
  }

  return { allowed: true, limit, used, requested, remaining };
}

export function planRateLimit(tier: string): number {
  switch (tier) {
    case "agency":
      return 600;
    case "studio":
      return 180;
    case "creator_pro":
      return 60;
    case "solo":
      return 30;
    case "free":
    default:
      return 10;
  }
}
