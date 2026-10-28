import { and, desc, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
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
} from "@/schema";
import { WorkspacesRepository } from "./workspaces.repository";
import { withMetrics } from "@/utils/metrics-wrapper";
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

export interface ProviderSubscriptionState {
  /**
   * The user that completed checkout. Subscriptions are billed per workspace,
   * so this is only used to resolve the personal workspace when the webhook
   * does not carry a workspace id.
   */
  userId: string;
  workspaceId?: string | null;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
  tier: SubscriptionTierEnum;
  status: SubscriptionStatusEnum;
  billingInterval: BillingIntervalEnum;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
  metadata?: Record<string, unknown>;
}

function addBillingInterval(date: Date, interval: BillingIntervalEnum): Date {
  const next = new Date(date);
  if (interval === BillingIntervalEnum.YEARLY) {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Rolls the usage meters over when a new billing period has started.
 */
function rollUsageForward(
  existing: Subscription,
  now: Date,
): { currentPeriodStart: Date; currentPeriodEnd: Date; usage: SubscriptionUsage } | null {
  if (now <= new Date(existing.currentPeriodEnd)) return null;

  const currentPeriodStart = new Date(existing.currentPeriodEnd);
  const currentPeriodEnd = addBillingInterval(currentPeriodStart, existing.billingInterval);

  return {
    currentPeriodStart,
    currentPeriodEnd,
    usage: {
      ...existing.usage,
      monthlyDropsUsed: 0,
      aiCreditsUsed: 0,
    },
  };
}

async function resolveWorkspace(
  workspaceId: string,
  options?: { tx?: DBTransaction },
): Promise<{ id: string; ownerUserId: string }> {
  const workspace = await WorkspacesRepository.findById(workspaceId, options);
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} not found`);
  }
  return workspace;
}

export namespace SubscriptionsRepository {
  /**
   * Retrieves or initializes the billing subscription for a workspace.
   *
   * Every workspace (personal or team) owns exactly one subscription, so team
   * members share the workspace plan instead of the owner's personal plan.
   */
  export async function getOrCreateForWorkspace(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    try {
      const existing = await queryClient.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.workspaceId, workspaceId),
      });

      if (existing) {
        const rollover = rollUsageForward(existing, new Date());
        if (!rollover) return existing;

        const [refreshed] = await queryClient
          .update(subscriptionsTable)
          .set({
            currentPeriodStart: rollover.currentPeriodStart,
            currentPeriodEnd: rollover.currentPeriodEnd,
            usage: rollover.usage,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionsTable.id, existing.id))
          .returning();

        return refreshed;
      }

      const workspace = await resolveWorkspace(workspaceId, options);

      // Initialize a free subscription. Paid entitlements are only granted by
      // the billing provider webhook after a successful checkout.
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const [created] = await queryClient
        .insert(subscriptionsTable)
        .values({
          userId: workspace.ownerUserId,
          workspaceId: workspace.id,
          tier: SubscriptionTierEnum.FREE,
          status: SubscriptionStatusEnum.ACTIVE,
          billingInterval: BillingIntervalEnum.MONTHLY,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.FREE],
          usage: INITIAL_USAGE,
        })
        .returning();

      logger.audit("workspace subscription initialized", {
        module: "subscriptions",
        action: "repository:getOrCreateForWorkspace",
        userId: workspace.ownerUserId,
        workspaceId: workspace.id,
        tier: created.tier,
      });

      return created;
    } catch (err) {
      logger.error("error getting or creating workspace subscription", {
        module: "subscriptions",
        action: "repository:getOrCreateForWorkspace",
        workspaceId,
        error: err,
      });
      throw err;
    }
  }

  /**
   * Retrieves the subscription for a user's personal workspace.
   *
   * @deprecated Pass an explicit workspace id to the workspace-scoped methods.
   */
  export async function getOrCreate(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return getOrCreateForWorkspace(workspace.id, options);
  }

  /**
   * Updates plan tier, interval, and the corresponding limits for a workspace.
   */
  export async function updateTierForWorkspace(
    workspaceId: string,
    tier: SubscriptionTierEnum,
    billingInterval: BillingIntervalEnum,
    externalData?: {
      customerId?: string;
      subscriptionId?: string;
    },
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreateForWorkspace(workspaceId, options);
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

    logger.audit("workspace subscription tier updated", {
      module: "subscriptions",
      action: "repository:updateTierForWorkspace",
      workspaceId,
      oldTier: current.tier,
      newTier: tier,
      interval: billingInterval,
    });

    return updated;
  }

  /**
   * @deprecated Pass an explicit workspace id to `updateTierForWorkspace`.
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
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return updateTierForWorkspace(workspace.id, tier, billingInterval, externalData, options);
  }

  /**
   * Increments real-time usage meters for a workspace.
   */
  export async function incrementUsageForWorkspace(
    workspaceId: string,
    deltas: {
      monthlyDrops?: number;
      aiCredits?: number;
      channels?: number;
      cdnStorageBytes?: number;
    },
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreateForWorkspace(workspaceId, options);

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
   * @deprecated Pass an explicit workspace id to `incrementUsageForWorkspace`.
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
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return incrementUsageForWorkspace(workspace.id, deltas, options);
  }

  /**
   * Schedules workspace subscription cancellation at the end of the period.
   */
  export async function cancelAtPeriodEndForWorkspace(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreateForWorkspace(workspaceId, options);

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
   * @deprecated Pass an explicit workspace id to `cancelAtPeriodEndForWorkspace`.
   */
  export async function cancelAtPeriodEnd(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return cancelAtPeriodEndForWorkspace(workspace.id, options);
  }

  /**
   * Resumes a canceled workspace subscription before the period lapses.
   */
  export async function resumeForWorkspace(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;
    const current = await getOrCreateForWorkspace(workspaceId, options);

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
   * @deprecated Pass an explicit workspace id to `resumeForWorkspace`.
   */
  export async function resume(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return resumeForWorkspace(workspace.id, options);
  }

  /**
   * Records a billing invoice from payment gateway.
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
   * Finds a workspace subscription without creating one.
   */
  export async function findByWorkspaceId(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription | null> {
    const queryClient = options?.tx || db;
    const existing = await queryClient.query.subscriptionsTable.findFirst({
      where: eq(subscriptionsTable.workspaceId, workspaceId),
    });
    return existing ?? null;
  }

  /**
   * Finds the subscription for a user's personal workspace.
   *
   * @deprecated Pass an explicit workspace id to `findByWorkspaceId`.
   */
  export async function findByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription | null> {
    const personal = await WorkspacesRepository.findByOwnerId(userId, options);
    return personal ? findByWorkspaceId(personal.id, options) : null;
  }

  /**
   * Finds a subscription by its provider identifiers.
   */
  export async function findByExternalIds(
    identifiers: { externalSubscriptionId?: string | null; externalCustomerId?: string | null },
    options?: { tx?: DBTransaction },
  ): Promise<Subscription | null> {
    const queryClient = options?.tx || db;

    if (identifiers.externalSubscriptionId) {
      const bySubscription = await queryClient.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.externalSubscriptionId, identifiers.externalSubscriptionId),
      });
      if (bySubscription) return bySubscription;
    }

    if (identifiers.externalCustomerId) {
      const byCustomer = await queryClient.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.externalCustomerId, identifiers.externalCustomerId),
      });
      if (byCustomer) return byCustomer;
    }

    return null;
  }

  /**
   * Applies the authoritative state from the payment provider.
   *
   * The provider webhook is the source of truth: checkout never grants a plan,
   * only an activated/renewed subscription does.
   */
  export async function syncFromProvider(
    state: ProviderSubscriptionState,
    options?: { tx?: DBTransaction },
  ): Promise<Subscription> {
    const queryClient = options?.tx || db;

    let existing = await findByExternalIds(
      {
        externalSubscriptionId: state.externalSubscriptionId,
        externalCustomerId: state.externalCustomerId,
      },
      options,
    );

    if (!existing && state.workspaceId) {
      existing = await findByWorkspaceId(state.workspaceId, options);
    }

    if (!existing) {
      existing = await findByUserId(state.userId, options);
    }

    // A provider subscription is bound to the workspace that created the
    // checkout. Ignore a conflicting workspace hint rather than moving billing
    // to a different tenant.
    let workspaceId = existing?.workspaceId ?? state.workspaceId ?? null;
    if (!workspaceId) {
      workspaceId = (
        await WorkspacesRepository.ensurePersonalWorkspace(state.userId, undefined, options)
      ).id;
    }

    if (existing?.workspaceId && state.workspaceId && existing.workspaceId !== state.workspaceId) {
      logger.warn("billing webhook workspace does not match subscription", {
        module: "billing",
        action: "webhook:subscription:workspaceMismatch",
        subscriptionId: state.externalSubscriptionId,
        subscriptionWorkspaceId: existing.workspaceId,
        webhookWorkspaceId: state.workspaceId,
      });
    }

    const workspace = await resolveWorkspace(workspaceId, options);

    const periodStart = state.currentPeriodStart ?? existing?.currentPeriodStart ?? new Date();
    const periodEnd =
      state.currentPeriodEnd ??
      existing?.currentPeriodEnd ??
      addBillingInterval(periodStart, state.billingInterval);

    const periodRolledOver =
      !!existing && periodStart.getTime() > new Date(existing.currentPeriodStart).getTime();

    const usage: SubscriptionUsage = existing
      ? {
          ...existing.usage,
          monthlyDropsUsed: periodRolledOver ? 0 : existing.usage.monthlyDropsUsed,
          aiCreditsUsed: periodRolledOver ? 0 : existing.usage.aiCreditsUsed,
        }
      : INITIAL_USAGE;

    const metadata = {
      ...(existing?.metadata ?? {}),
      ...(state.metadata ?? {}),
    };

    if (existing) {
      const [updated] = await queryClient
        .update(subscriptionsTable)
        .set({
          workspaceId: workspace.id,
          userId: existing.userId ?? workspace.ownerUserId,
          tier: state.tier,
          status: state.status,
          billingInterval: state.billingInterval,
          externalCustomerId: state.externalCustomerId ?? existing.externalCustomerId,
          externalSubscriptionId: state.externalSubscriptionId ?? existing.externalSubscriptionId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: state.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
          canceledAt: state.canceledAt ?? null,
          limits: DEFAULT_PLAN_LIMITS[state.tier],
          usage,
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.id, existing.id))
        .returning();

      logger.audit("subscription synced from billing provider", {
        module: "subscriptions",
        action: "repository:syncFromProvider",
        userId: updated.userId,
        workspaceId: updated.workspaceId,
        tier: updated.tier,
        status: updated.status,
        externalSubscriptionId: updated.externalSubscriptionId,
      });

      return updated;
    }

    const [created] = await queryClient
      .insert(subscriptionsTable)
      .values({
        userId: workspace.ownerUserId ?? state.userId,
        workspaceId: workspace.id,
        tier: state.tier,
        status: state.status,
        billingInterval: state.billingInterval,
        externalCustomerId: state.externalCustomerId ?? null,
        externalSubscriptionId: state.externalSubscriptionId ?? null,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: state.cancelAtPeriodEnd ?? false,
        canceledAt: state.canceledAt ?? null,
        limits: DEFAULT_PLAN_LIMITS[state.tier],
        usage,
        metadata,
      })
      .returning();

    logger.audit("subscription created from billing provider", {
      module: "subscriptions",
      action: "repository:syncFromProvider",
      userId: created.userId,
      workspaceId: created.workspaceId,
      tier: created.tier,
      status: created.status,
      externalSubscriptionId: created.externalSubscriptionId,
    });

    return created;
  }

  /**
   * Records or updates an invoice by its provider invoice/payment ID.
   */
  export async function upsertInvoice(
    payload: NewInvoice & { externalInvoiceId: string },
    options?: { tx?: DBTransaction },
  ): Promise<Invoice> {
    const queryClient = options?.tx || db;

    const [invoice] = await queryClient
      .insert(invoicesTable)
      .values(payload)
      .onConflictDoUpdate({
        target: invoicesTable.externalInvoiceId,
        set: {
          workspaceId: payload.workspaceId,
          amountDue: payload.amountDue,
          amountPaid: payload.amountPaid,
          currency: payload.currency,
          status: payload.status,
          hostedInvoiceUrl: payload.hostedInvoiceUrl,
          invoicePdfUrl: payload.invoicePdfUrl,
          periodStart: payload.periodStart,
          periodEnd: payload.periodEnd,
          paidAt: payload.paidAt,
          updatedAt: new Date(),
        },
      })
      .returning();

    return invoice;
  }

  /**
   * Lists all invoices for a workspace, including invoices recorded before
   * invoices were scoped to workspaces.
   */
  export async function listInvoicesForWorkspace(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Invoice[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "invoices", async () => {
      const subscription = await findByWorkspaceId(workspaceId, options);
      const workspaceInvoices = await queryClient.query.invoicesTable.findMany({
        where: eq(invoicesTable.workspaceId, workspaceId),
        orderBy: [desc(invoicesTable.createdAt)],
      });

      if (!subscription || subscription.workspaceId !== workspaceId) {
        return workspaceInvoices;
      }

      const legacyInvoices = await queryClient
        .select()
        .from(invoicesTable)
        .where(
          and(eq(invoicesTable.subscriptionId, subscription.id), isNull(invoicesTable.workspaceId)),
        )
        .orderBy(desc(invoicesTable.createdAt));

      const byId = new Map(workspaceInvoices.map((invoice) => [invoice.id, invoice]));
      for (const invoice of legacyInvoices) {
        byId.set(invoice.id, invoice);
      }

      return [...byId.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }

  /**
   * Lists all invoices for a user's personal workspace.
   *
   * @deprecated Pass an explicit workspace id to `listInvoicesForWorkspace`.
   */
  export async function listInvoices(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Invoice[]> {
    const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
      userId,
      undefined,
      options,
    );
    return listInvoicesForWorkspace(workspace.id, options);
  }
}

// Backward-compatibility alias
export const SubscriptionsService = SubscriptionsRepository;
