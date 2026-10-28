import { BillingIntervalEnum, SubscriptionTierEnum } from "@repo/db";
import { dodoConfig, getDodoProductId, isBillingConfigured } from "../dodo.config";

const REQUEST_TIMEOUT_MS = 20_000;

export class BillingProviderError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "BillingProviderError";
  }
}

export interface DodoCheckoutSession {
  session_id: string;
  checkout_url: string | null;
}

export interface DodoCustomerPortalSession {
  link: string;
}

export interface DodoCustomer {
  customer_id: string;
  email: string;
  name: string;
}

export interface DodoSubscription {
  subscription_id: string;
  status: string;
  product_id: string;
  customer: DodoCustomer;
  metadata: Record<string, unknown> | null;
  previous_billing_date: string;
  next_billing_date: string;
  cancel_at_next_billing_date: boolean;
  cancelled_at: string | null;
  created_at: string;
  recurring_pre_tax_amount: number;
  currency: string;
  quantity: number;
  payment_frequency_interval: string;
  payment_frequency_count: number;
}

interface CreateCheckoutSessionInput {
  userId: string;
  email: string;
  name?: string | null;
  tier: SubscriptionTierEnum;
  interval: BillingIntervalEnum;
  customerId?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

interface DodoRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
}

function assertConfigured(): void {
  if (!isBillingConfigured()) {
    throw new BillingProviderError("Billing is not configured", 503, "BILLING_NOT_CONFIGURED");
  }
}

async function dodoRequest<T>(path: string, options: DodoRequestOptions = {}): Promise<T> {
  assertConfigured();

  let response: Response;
  try {
    response = await fetch(`${dodoConfig.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${dodoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    throw new BillingProviderError(
      err instanceof Error
        ? `Unable to reach Dodo Payments: ${err.message}`
        : "Unable to reach Dodo Payments",
      502,
      "BILLING_PROVIDER_UNAVAILABLE",
    );
  }

  const text = await response.text();
  let payload: unknown = null;

  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorPayload = payload as { message?: string; code?: string } | null;
    throw new BillingProviderError(
      errorPayload?.message ?? "Dodo Payments request failed",
      response.status,
      errorPayload?.code,
    );
  }

  return payload as T;
}

export const DodoPaymentsService = {
  isConfigured: isBillingConfigured,

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<DodoCheckoutSession> {
    const productId = getDodoProductId(input.tier, input.interval);

    if (!productId) {
      throw new BillingProviderError(
        `No Dodo Payments product configured for ${input.tier}/${input.interval}`,
        503,
        "BILLING_PLAN_NOT_CONFIGURED",
      );
    }

    return dodoRequest<DodoCheckoutSession>("/checkouts", {
      method: "POST",
      body: {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: input.customerId
          ? { customer_id: input.customerId }
          : {
              email: input.email,
              ...(input.name ? { name: input.name } : {}),
            },
        return_url: input.successUrl ?? dodoConfig.returnUrl,
        cancel_url: input.cancelUrl ?? dodoConfig.cancelUrl,
        metadata: {
          user_id: input.userId,
          tier: input.tier,
          billing_interval: input.interval,
        },
        show_saved_payment_methods: true,
        feature_flags: {
          allow_discount_code: true,
        },
      },
    });
  },

  async createCustomerPortalSession(
    customerId: string,
    returnUrl?: string,
  ): Promise<DodoCustomerPortalSession> {
    const query = new URLSearchParams();
    query.set("return_url", returnUrl ?? `${dodoConfig.returnUrl}&from=portal`);

    return dodoRequest<DodoCustomerPortalSession>(
      `/customers/${encodeURIComponent(customerId)}/customer-portal/session?${query.toString()}`,
      { method: "POST" },
    );
  },

  async retrieveSubscription(subscriptionId: string): Promise<DodoSubscription> {
    return dodoRequest<DodoSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  },

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<DodoSubscription> {
    return dodoRequest<DodoSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: "PATCH",
      body: {
        status: "cancelled",
        cancel_at_next_billing_date: atPeriodEnd,
        cancel_reason: "cancelled_by_customer",
      },
    });
  },

  async resumeSubscription(subscriptionId: string): Promise<DodoSubscription> {
    return dodoRequest<DodoSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: "PATCH",
      body: { status: "active" },
    });
  },

  async clearScheduledCancellation(subscriptionId: string): Promise<DodoSubscription> {
    return dodoRequest<DodoSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: "PATCH",
      body: { cancel_at_next_billing_date: false },
    });
  },
};
