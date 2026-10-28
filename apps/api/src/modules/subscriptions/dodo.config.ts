import { BillingIntervalEnum, SubscriptionTierEnum } from "@repo/db";
import { env } from "@/env";

export interface DodoPlan {
  tier: SubscriptionTierEnum;
  interval: BillingIntervalEnum;
  productId: string;
}

const planDefinitions: Array<{
  tier: SubscriptionTierEnum;
  interval: BillingIntervalEnum;
  productId: string;
}> = [
  {
    tier: SubscriptionTierEnum.SOLO,
    interval: BillingIntervalEnum.MONTHLY,
    productId: env.DODO_PRODUCT_SOLO_MONTHLY,
  },
  {
    tier: SubscriptionTierEnum.SOLO,
    interval: BillingIntervalEnum.YEARLY,
    productId: env.DODO_PRODUCT_SOLO_YEARLY,
  },
  {
    tier: SubscriptionTierEnum.CREATOR_PRO,
    interval: BillingIntervalEnum.MONTHLY,
    productId: env.DODO_PRODUCT_CREATOR_PRO_MONTHLY,
  },
  {
    tier: SubscriptionTierEnum.CREATOR_PRO,
    interval: BillingIntervalEnum.YEARLY,
    productId: env.DODO_PRODUCT_CREATOR_PRO_YEARLY,
  },
  {
    tier: SubscriptionTierEnum.STUDIO,
    interval: BillingIntervalEnum.MONTHLY,
    productId: env.DODO_PRODUCT_STUDIO_MONTHLY,
  },
  {
    tier: SubscriptionTierEnum.STUDIO,
    interval: BillingIntervalEnum.YEARLY,
    productId: env.DODO_PRODUCT_STUDIO_YEARLY,
  },
  {
    tier: SubscriptionTierEnum.AGENCY,
    interval: BillingIntervalEnum.MONTHLY,
    productId: env.DODO_PRODUCT_AGENCY_MONTHLY,
  },
  {
    tier: SubscriptionTierEnum.AGENCY,
    interval: BillingIntervalEnum.YEARLY,
    productId: env.DODO_PRODUCT_AGENCY_YEARLY,
  },
];

const plans = planDefinitions.filter((plan) => plan.productId.trim().length > 0);

const productToPlan = new Map<string, DodoPlan>(plans.map((plan) => [plan.productId, plan]));

export const dodoConfig = {
  apiKey: env.DODO_PAYMENTS_API_KEY,
  webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY,
  environment: env.DODO_PAYMENTS_ENVIRONMENT,
  baseUrl:
    env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com",
  returnUrl: env.DODO_PAYMENTS_RETURN_URL ?? `${env.FRONTEND_URL}/dashboard?checkout=success`,
  cancelUrl: env.DODO_PAYMENTS_CANCEL_URL ?? `${env.FRONTEND_URL}/dashboard?checkout=cancelled`,
  skipWebhookVerification:
    env.NODE_ENV !== "production" && env.DODO_PAYMENTS_SKIP_WEBHOOK_VERIFICATION,
};

export function isBillingConfigured(): boolean {
  return dodoConfig.apiKey.trim().length > 0;
}

export function getDodoProductId(
  tier: SubscriptionTierEnum,
  interval: BillingIntervalEnum,
): string | null {
  const plan = plans.find(
    (candidate) => candidate.tier === tier && candidate.interval === interval,
  );
  return plan?.productId ?? null;
}

export function resolveDodoPlan(productId: string | null | undefined): DodoPlan | null {
  if (!productId) return null;
  return productToPlan.get(productId) ?? null;
}
