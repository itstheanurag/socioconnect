import { z } from "zod";
import {
  BillingIntervalEnum,
  InvoiceStatusEnum,
  SubscriptionsRepository,
  SubscriptionStatusEnum,
  SubscriptionTierEnum,
} from "@repo/db";
import { logger } from "@repo/shared";
import { resolveDodoPlan } from "../dodo.config";

export const dodoWebhookEventSchema = z.object({
  business_id: z.string().optional(),
  type: z.string().min(1),
  timestamp: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

export type DodoWebhookEvent = z.infer<typeof dodoWebhookEventSchema>;

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.active",
  "subscription.updated",
  "subscription.renewed",
  "subscription.plan_changed",
  "subscription.on_hold",
  "subscription.past_due",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
]);

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asDate(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapProviderStatus(rawStatus: string): SubscriptionStatusEnum {
  switch (rawStatus) {
    case "active":
      return SubscriptionStatusEnum.ACTIVE;
    case "past_due":
      return SubscriptionStatusEnum.PAST_DUE;
    case "paused":
    case "on_hold":
    case "pending":
      return SubscriptionStatusEnum.PAUSED;
    case "cancelled":
      return SubscriptionStatusEnum.CANCELED;
    case "failed":
    case "expired":
      return SubscriptionStatusEnum.CANCELED;
    default:
      return SubscriptionStatusEnum.PAUSED;
  }
}

function resolveInterval(
  data: Record<string, unknown>,
  fallback: BillingIntervalEnum,
): BillingIntervalEnum {
  const metadata = asRecord(data.metadata);
  const candidates = [
    asString(data.payment_frequency_interval),
    asString(data.billing_interval),
    asString(metadata?.billing_interval),
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.toLowerCase();
    if (normalized === "year" || normalized === "yearly") return BillingIntervalEnum.YEARLY;
    if (normalized === "month" || normalized === "monthly") return BillingIntervalEnum.MONTHLY;
  }

  return fallback;
}

function resolveTier(
  data: Record<string, unknown>,
  productId: string | null,
): SubscriptionTierEnum | null {
  const plan = resolveDodoPlan(productId);
  if (plan) return plan.tier;

  const metadata = asRecord(data.metadata);
  const metadataTier = asString(metadata?.tier);
  if (
    metadataTier &&
    Object.values(SubscriptionTierEnum).includes(metadataTier as SubscriptionTierEnum)
  ) {
    return metadataTier as SubscriptionTierEnum;
  }

  return null;
}

function losesEntitlements(rawStatus: string, cancelAtPeriodEnd: boolean): boolean {
  if (rawStatus === "past_due") return false;
  if (rawStatus === "cancelled") return !cancelAtPeriodEnd;
  return ["expired", "failed", "on_hold", "paused", "pending"].includes(rawStatus);
}

async function syncSubscription(data: Record<string, unknown>): Promise<void> {
  const subscriptionId = asString(data.subscription_id);
  const customer = asRecord(data.customer);
  const customerId = asString(customer?.customer_id);
  const metadata = asRecord(data.metadata);
  const metadataUserId = asString(metadata?.user_id);
  const metadataWorkspaceId = asString(metadata?.workspace_id);
  const productId = asString(data.product_id);

  const existing = await SubscriptionsRepository.findByExternalIds({
    externalSubscriptionId: subscriptionId,
    externalCustomerId: customerId,
  });

  const userId = metadataUserId ?? existing?.userId;
  if (!userId) {
    logger.warn("billing webhook could not be mapped to a user", {
      module: "billing",
      action: "webhook:subscription:unmapped",
      subscriptionId,
      customerId,
    });
    return;
  }

  const rawStatus = asString(data.status) ?? "active";
  const cancelAtPeriodEnd = data.cancel_at_next_billing_date === true;
  const resolvedTier = resolveTier(data, productId) ?? existing?.tier ?? SubscriptionTierEnum.FREE;
  const tier = losesEntitlements(rawStatus, cancelAtPeriodEnd)
    ? SubscriptionTierEnum.FREE
    : resolvedTier;

  const billingInterval = resolveInterval(
    data,
    existing?.billingInterval ?? BillingIntervalEnum.MONTHLY,
  );
  const status = mapProviderStatus(rawStatus);

  await SubscriptionsRepository.syncFromProvider({
    userId,
    workspaceId: metadataWorkspaceId ?? existing?.workspaceId ?? null,
    externalCustomerId: customerId,
    externalSubscriptionId: subscriptionId,
    tier,
    status,
    billingInterval,
    currentPeriodStart: asDate(data.previous_billing_date) ?? asDate(data.created_at),
    currentPeriodEnd: asDate(data.next_billing_date),
    cancelAtPeriodEnd,
    canceledAt: asDate(data.cancelled_at),
    metadata: {
      dodoProductId: productId,
      dodoStatus: rawStatus,
      dodoCustomerId: customerId,
    },
  });
}

async function recordPayment(data: Record<string, unknown>): Promise<void> {
  if (asString(data.status) !== "succeeded") {
    return;
  }

  const paymentId = asString(data.payment_id);
  const subscriptionId = asString(data.subscription_id);
  const customer = asRecord(data.customer);
  const customerId = asString(customer?.customer_id);

  if (!paymentId) {
    logger.warn("payment webhook is missing a payment id", {
      module: "billing",
      action: "webhook:payment:missingId",
    });
    return;
  }

  const subscription = await SubscriptionsRepository.findByExternalIds({
    externalSubscriptionId: subscriptionId,
    externalCustomerId: customerId,
  });

  if (!subscription) {
    logger.warn("payment webhook could not be mapped to a subscription", {
      module: "billing",
      action: "webhook:payment:unmapped",
      paymentId,
      subscriptionId,
      customerId,
    });
    return;
  }

  const amount = asNumber(data.total_amount) ?? 0;

  await SubscriptionsRepository.upsertInvoice({
    subscriptionId: subscription.id,
    userId: subscription.userId,
    workspaceId: subscription.workspaceId,
    externalInvoiceId: asString(data.invoice_id) ?? paymentId,
    invoiceNumber: asString(data.invoice_number) ?? `DODO-${paymentId}`,
    amountDue: amount,
    amountPaid: amount,
    currency: (asString(data.currency) ?? "usd").toLowerCase(),
    status: InvoiceStatusEnum.PAID,
    hostedInvoiceUrl: asString(data.invoice_url) ?? null,
    invoicePdfUrl: asString(data.invoice_pdf_url) ?? null,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    paidAt: asDate(data.created_at) ?? new Date(),
  });
}

export async function processDodoWebhook(event: DodoWebhookEvent): Promise<void> {
  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    await syncSubscription(event.data);
    return;
  }

  if (event.type === "payment.succeeded") {
    await recordPayment(event.data);
    return;
  }

  logger.info(`ignoring billing webhook event: ${event.type}`, {
    module: "billing",
    action: "webhook:ignored",
    eventType: event.type,
  });
}
