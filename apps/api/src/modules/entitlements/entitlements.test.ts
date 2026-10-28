import { describe, expect, it } from "bun:test";
import type { Subscription } from "@repo/db";
import {
  evaluateAiEntitlement,
  evaluatePublishEntitlement,
  evaluateSubscriptionStatus,
  planRateLimit,
  type EntitlementDecision,
} from "./entitlements.rules";

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    userId: "22222222-2222-2222-2222-222222222222",
    workspaceId: null,
    tier: "free",
    status: "active",
    billingInterval: "monthly",
    externalCustomerId: null,
    externalSubscriptionId: null,
    currentPeriodStart: new Date("2026-10-01T00:00:00Z"),
    currentPeriodEnd: new Date("2026-11-01T00:00:00Z"),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    trialEndsAt: null,
    limits: {
      maxChannels: 2,
      maxMonthlyDrops: 10,
      maxAiCredits: 5,
      maxCdnStorageBytes: 1_000_000,
      maxTeamMembers: 1,
      hasDedicatedScheduler: false,
      hasPrioritySupport: false,
      hasCustomBranding: false,
    },
    usage: {
      channelsUsed: 0,
      monthlyDropsUsed: 0,
      aiCreditsUsed: 0,
      cdnStorageUsedBytes: 0,
      teamMembersUsed: 1,
    },
    metadata: {},
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-01T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  } as Subscription;
}

function withUsage(usage: Partial<Subscription["usage"]>): Subscription {
  const base = makeSubscription();
  return makeSubscription({ usage: { ...base.usage, ...usage } });
}

describe("entitlements", () => {
  it("allows publishing within the monthly limit", () => {
    const subscription = withUsage({ monthlyDropsUsed: 8 });
    const decision = evaluatePublishEntitlement(subscription, 2);

    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(2);
  });

  it("rejects publishing over the monthly limit", () => {
    const subscription = withUsage({ monthlyDropsUsed: 9 });
    const decision = evaluatePublishEntitlement(subscription, 2);

    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("QUOTA_EXCEEDED");
    expect(decision.limit).toBe(10);
    expect(decision.used).toBe(9);
    expect(decision.remaining).toBe(1);
  });

  it("blocks canceled, paused, and unpaid subscriptions", () => {
    for (const status of ["canceled", "paused", "unpaid"] as Subscription["status"][]) {
      const decision = evaluateSubscriptionStatus(makeSubscription({ status }));
      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe("SUBSCRIPTION_INACTIVE");
    }
  });

  it("allows past_due subscriptions during grace", () => {
    const decision = evaluateSubscriptionStatus(
      makeSubscription({ status: "past_due" as Subscription["status"] }),
    );
    expect(decision.allowed).toBe(true);
  });

  it("enforces AI credits separately", () => {
    const subscription = withUsage({ aiCreditsUsed: 5 });
    const decision = evaluateAiEntitlement(subscription, 1);

    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("QUOTA_EXCEEDED");
  });

  it("maps plan tiers to per-key rate limits", () => {
    expect(planRateLimit("free")).toBe(10);
    expect(planRateLimit("solo")).toBe(30);
    expect(planRateLimit("creator_pro")).toBe(60);
    expect(planRateLimit("studio")).toBe(180);
    expect(planRateLimit("agency")).toBe(600);
  });

  it("returns a stable decision shape", () => {
    const decision: EntitlementDecision = evaluatePublishEntitlement(makeSubscription(), 0);
    expect(decision.allowed).toBe(true);
  });
});
