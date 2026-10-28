import { SubscriptionsRepository, type Subscription } from "@repo/db";
import {
  evaluateAiEntitlement,
  evaluatePublishEntitlement,
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
  async getSubscription(userId: string): Promise<Subscription> {
    return SubscriptionsRepository.getOrCreate(userId);
  },

  async assertCanPublish(userId: string, destinationCount: number): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(userId);
    assertDecision(evaluatePublishEntitlement(subscription, destinationCount));
    return subscription;
  },

  async assertCanUseAiCredits(userId: string, creditCount = 1): Promise<Subscription> {
    const subscription = await EntitlementsService.getSubscription(userId);
    assertDecision(evaluateAiEntitlement(subscription, creditCount));
    return subscription;
  },

  async recordPublishUsage(userId: string, destinationCount: number): Promise<void> {
    if (destinationCount <= 0) return;
    await SubscriptionsRepository.incrementUsage(userId, {
      monthlyDrops: destinationCount,
    });
  },

  async recordAiCreditUsage(userId: string, creditCount = 1): Promise<void> {
    if (creditCount <= 0) return;
    await SubscriptionsRepository.incrementUsage(userId, {
      aiCredits: creditCount,
    });
  },

  async getRateLimitForUser(userId: string): Promise<number> {
    const subscription = await EntitlementsService.getSubscription(userId);
    return planRateLimit(subscription.tier);
  },
};
