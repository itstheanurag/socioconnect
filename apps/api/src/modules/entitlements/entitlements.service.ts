import { SubscriptionsRepository, type Subscription } from "@repo/db";
import {
  evaluateAiEntitlement,
  evaluateChannelEntitlement,
  evaluatePublishEntitlement,
  evaluateSeatEntitlement,
  evaluateStorageEntitlement,
  planRateLimit,
  type EntitlementDecision,
} from "./entitlements.rules";

export type { EntitlementDecision } from "./entitlements.rules";

export class EntitlementError extends Error {
  constructor(
    readonly decision: EntitlementDecision,
    readonly statusCode: number,
  ) {
    super(decision.message ?? "Entitlement denied");
    this.name = "EntitlementError";
  }
}

function assertDecision(decision: EntitlementDecision): void {
  if (decision.allowed) return;
  throw new EntitlementError(decision, decision.code === "QUOTA_EXCEEDED" ? 402 : 403);
}

export const EntitlementsService = {
  /**
   * Subscriptions are billed per workspace: every member of a team consumes
   * the workspace plan, not the workspace owner's personal plan.
   */
  async getSubscription(workspaceId: string): Promise<Subscription> {
    return SubscriptionsRepository.refreshResourceUsageForWorkspace(workspaceId);
  },

  async assertCanPublish(workspaceId: string, destinationCount: number): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    assertDecision(evaluatePublishEntitlement(subscription, destinationCount));
    return subscription;
  },

  async assertCanUseAiCredits(workspaceId: string, creditCount = 1): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    assertDecision(evaluateAiEntitlement(subscription, creditCount));
    return subscription;
  },

  async assertCanAddChannel(workspaceId: string, channelCount = 1): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    assertDecision(evaluateChannelEntitlement(subscription, channelCount));
    return subscription;
  },

  async assertCanAddTeamMember(
    workspaceId: string,
    pendingInvites = 0,
    seatCount = 1,
  ): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    assertDecision(evaluateSeatEntitlement(subscription, pendingInvites, seatCount));
    return subscription;
  },

  async assertCanStoreMedia(workspaceId: string, sizeBytes: number): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    assertDecision(evaluateStorageEntitlement(subscription, sizeBytes));
    return subscription;
  },

  async recordPublishUsage(workspaceId: string, destinationCount: number): Promise<void> {
    if (destinationCount <= 0) return;
    await SubscriptionsRepository.incrementUsageForWorkspace(workspaceId, {
      monthlyDrops: destinationCount,
    });
  },

  async recordAiCreditUsage(workspaceId: string, creditCount = 1): Promise<void> {
    if (creditCount <= 0) return;
    await SubscriptionsRepository.incrementUsageForWorkspace(workspaceId, {
      aiCredits: creditCount,
    });
  },

  async getRateLimitForWorkspace(workspaceId: string): Promise<number> {
    const subscription = await EntitlementsService.getSubscription(workspaceId);
    return planRateLimit(subscription.tier);
  },
};
