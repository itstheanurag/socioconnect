import { desc, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  subscriptionsTable,
  invoicesTable,
  type Subscription,
  type NewSubscription,
  type SubscriptionLimits,
  type SubscriptionUsage,
  type Invoice,
  type NewInvoice,
  SubscriptionTierEnum,
  SubscriptionStatusEnum,
  BillingIntervalEnum,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export const DEFAULT_PLAN_LIMITS: Record<SubscriptionTierEnum, SubscriptionLimits> = {
  [SubscriptionTierEnum.FREE]: {
    maxChannels: 2,
    maxMonthlyDrops: 15,
    maxAiCredits: 10,
    maxCdnStorageBytes: 1_000_000_000, // 1 GB
    maxTeamMembers: 1,
    hasDedicatedScheduler: false,
    hasPrioritySupport: false,
    hasCustomBranding: false,
  },
  [SubscriptionTierEnum.SOLO]: {
    maxChannels: 5,
    maxMonthlyDrops: 75,
    maxAiCredits: 100,
    maxCdnStorageBytes: 10_000_000_000, // 10 GB
    maxTeamMembers: 1,
    hasDedicatedScheduler: true,
    hasPrioritySupport: false,
    hasCustomBranding: false,
  },
  [SubscriptionTierEnum.CREATOR_PRO]: {
    maxChannels: 15,
    maxMonthlyDrops: 300,
    maxAiCredits: 500,
    maxCdnStorageBytes: 50_000_000_000, // 50 GB
    maxTeamMembers: 3,
    hasDedicatedScheduler: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
  },
  [SubscriptionTierEnum.STUDIO]: {
    maxChannels: 50,
    maxMonthlyDrops: 1500,
    maxAiCredits: 2500,
    maxCdnStorageBytes: 250_000_000_000, // 250 GB
    maxTeamMembers: 10,
    hasDedicatedScheduler: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
  },
  [SubscriptionTierEnum.AGENCY]: {
    maxChannels: 200,
    maxMonthlyDrops: 10000,
    maxAiCredits: 10000,
    maxCdnStorageBytes: 1_000_000_000_000, // 1 TB
    maxTeamMembers: 30,
    hasDedicatedScheduler: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
  },
};

export const INITIAL_USAGE: SubscriptionUsage = {
  channelsUsed: 0,
  monthlyDropsUsed: 0,
  aiCreditsUsed: 0,
  cdnStorageUsedBytes: 0,
  teamMembersUsed: 1,
};

export namespace SubscriptionsRepository {
  /**
   * Retrieves or initializes a creator's active subscription with live limits & usage
   */
  export async function getOrCreate(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    try {
      const existing = await queryClient.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.userId, userId),
      });

      if (existing) {
        // Automatic billing cycle rollover check
        const now = new Date();
        if (now > new Date(existing.currentPeriodEnd)) {
          const nextPeriodStart = new Date(existing.currentPeriodEnd);
          const nextPeriodEnd = new Date(nextPeriodStart);

          if (existing.billingInterval === BillingIntervalEnum.YEARLY) {
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
          } else {
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
          }

          const [refreshed] = await queryClient
            .update(subscriptionsTable)
            .set({
              currentPeriodStart: nextPeriodStart,
              currentPeriodEnd: nextPeriodEnd,
              usage: {
                ...existing.usage,
                monthlyDropsUsed: 0,
                aiCreditsUsed: 0,
              },
              updatedAt: new Date(),
            })
            .where(eq(subscriptionsTable.id, existing.id))
            .returning();

          return refreshed;
        }

        return existing;
      }

      // Initialize default Creator Pro trial / Solo subscription
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const [created] = await queryClient
        .insert(subscriptionsTable)
        .values({
          userId,
          tier: SubscriptionTierEnum.SOLO,
          status: SubscriptionStatusEnum.ACTIVE,
          billingInterval: BillingIntervalEnum.MONTHLY,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.SOLO],
          usage: INITIAL_USAGE,
        })
        .returning();

      logger.audit("subscription initialized for creator", {
        module: "subscriptions",
        action: "repository:getOrCreate",
        userId,
        tier: created.tier,
      });

      return created;
    } catch (err) {
      logger.error("error getting or creating subscription", {
        module: "subscriptions",
        action: "repository:getOrCreate",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Updates plan tier, interval, and updates corresponding limits
   */
  export async function updateTier(
    userId: string,
    tier: SubscriptionTierEnum,
    billingInterval: BillingIntervalEnum,
    externalData?: {
      customerId?: string;
      subscriptionId?: string;
    },
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreate(userId, options);
    const newLimits = DEFAULT_PLAN_LIMITS[tier];

    const [updated] = await queryClient
      .update(subscriptionsTable)
      .set({
        tier,
        status: SubscriptionStatusEnum.ACTIVE,
        billingInterval,
        limits: newLimits,
        externalCustomerId: externalData?.customerId || current.externalCustomerId,
        externalSubscriptionId: externalData?.subscriptionId || current.externalSubscriptionId,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, current.id))
      .returning();

    logger.audit("subscription tier upgraded", {
      module: "subscriptions",
      action: "repository:updateTier",
      userId,
      oldTier: current.tier,
      newTier: tier,
      interval: billingInterval,
    });

    return updated;
  }

  /**
   * Increments real-time usage meters (monthly drops, AI credits, channels)
   */
  export async function incrementUsage(
    userId: string,
    deltas: {
      monthlyDrops?: number;
      aiCredits?: number;
      channels?: number;
      cdnStorageBytes?: number;
    },
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreate(userId, options);

    const newUsage: SubscriptionUsage = {
      ...current.usage,
      monthlyDropsUsed: current.usage.monthlyDropsUsed + (deltas.monthlyDrops || 0),
      aiCreditsUsed: current.usage.aiCreditsUsed + (deltas.aiCredits || 0),
      channelsUsed: Math.max(0, current.usage.channelsUsed + (deltas.channels || 0)),
      cdnStorageUsedBytes: Math.max(
        0,
        current.usage.cdnStorageUsedBytes + (deltas.cdnStorageBytes || 0),
      ),
    };

    const [updated] = await queryClient
      .update(subscriptionsTable)
      .set({
        usage: newUsage,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, current.id))
      .returning();

    return updated;
  }

  /**
   * Schedules subscription cancellation at the end of the billing period
   */
  export async function cancelAtPeriodEnd(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreate(userId, options);

    const [updated] = await queryClient
      .update(subscriptionsTable)
      .set({
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, current.id))
      .returning();

    return updated;
  }

  /**
   * Resumes a canceled subscription before the billing period lapses
   */
  export async function resume(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreate(userId, options);

    const [updated] = await queryClient
      .update(subscriptionsTable)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        status: SubscriptionStatusEnum.ACTIVE,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, current.id))
      .returning();

    return updated;
  }

  /**
   * Records a billing invoice from payment gateway
   */
  export async function createInvoice(
    payload: NewInvoice,
    options?: { tx?: DBTransaction },
  ): Promise<Invoice> {
    const queryClient = options?.tx || db;
    const [invoice] = await queryClient.insert(invoicesTable).values(payload).returning();
    return invoice;
  }

  /**
   * Lists all invoices for a user
   */
  export async function listInvoices(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Invoice[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "invoices", async () =>
      queryClient.query.invoicesTable.findMany({
        where: eq(invoicesTable.userId, userId),
        orderBy: [desc(invoicesTable.createdAt)],
      }),
    );
  }
}

// Backward-compatibility alias
export const SubscriptionsService = SubscriptionsRepository;
