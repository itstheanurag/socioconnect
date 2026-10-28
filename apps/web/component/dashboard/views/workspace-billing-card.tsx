"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useNotification } from "@/context/notification-context";
import {
  cancelSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  getBillingInvoices,
  getSubscription,
  getSubscriptionPlans,
  resumeSubscription,
  type BillingInvoice,
  type SubscriptionPlan,
  type SubscriptionSummary,
} from "@/lib/api-client";

interface WorkspaceBillingCardProps {
  workspaceName: string;
  role: string;
}

const TIER_LABELS: Record<string, string> = {
  free: "Starter Free",
  solo: "Solo Creator",
  creator_pro: "Creator Pro",
  studio: "Studio",
  agency: "Agency",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function UsageBar({
  label,
  used,
  max,
  tone,
}: {
  label: string;
  used: number;
  max: number;
  tone: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
        <span>{label}</span>
        <span className="signal-tabular text-neutral-400">
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-800">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WorkspaceBillingCard({ workspaceName, role }: WorkspaceBillingCardProps) {
  const { toast } = useNotification();
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const canManage = role === "owner" || role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextSubscription, nextPlans] = await Promise.all([
        getSubscription(),
        getSubscriptionPlans().catch(() => []),
      ]);
      setSubscription(nextSubscription);
      setPlans(nextPlans);
      setInterval(nextSubscription.billingInterval);

      if (nextSubscription.hasBillingAccount && (role === "owner" || role === "admin")) {
        setInvoices(await getBillingInvoices().catch(() => []));
      }
    } catch (err) {
      toast.error("Could not load billing", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [role, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCheckout = async (plan: SubscriptionPlan) => {
    setBusy(plan.tier);
    try {
      const session = await createCheckoutSession({ tier: plan.tier, interval });
      window.location.href = session.checkoutUrl;
    } catch (err) {
      toast.error("Checkout unavailable", err instanceof Error ? err.message : undefined);
      setBusy(null);
    }
  };

  const handlePortal = async () => {
    setBusy("portal");
    try {
      const url = await createBillingPortalSession(window.location.href);
      window.location.href = url;
    } catch (err) {
      toast.error("Could not open billing portal", err instanceof Error ? err.message : undefined);
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    setBusy("cancel");
    try {
      await cancelSubscription();
      toast.success("Cancellation scheduled", "The workspace keeps access until the period ends.");
      await load();
    } catch (err) {
      toast.error("Could not cancel", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleResume = async () => {
    setBusy("resume");
    try {
      await resumeSubscription();
      toast.success("Plan resumed", "The workspace subscription will renew automatically.");
      await load();
    } catch (err) {
      toast.error("Could not resume", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="signal-card flex items-center justify-center rounded-3xl py-16">
        <Loader2 className="h-5 w-5 animate-spin text-rose-400" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="signal-card rounded-3xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <CreditCard className="h-4 w-4 text-rose-300" />
          Workspace plan
        </h2>
        <p className="mt-2 text-xs text-neutral-400">
          Billing is unavailable for this workspace right now.
        </p>
      </div>
    );
  }

  const activeTier = subscription.tier;
  const paidPlans = plans.filter((plan) => plan.tier !== "free");

  return (
    <div className="signal-card overflow-hidden rounded-3xl shadow-xl">
      <div className="flex flex-col gap-3 border-b border-neutral-800/80 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-rose-300" />
            <h2 className="text-sm font-semibold text-neutral-100">Workspace plan</h2>
            <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              {workspaceName}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Plan, usage allowances, and billing apply to everyone in this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            {subscription.status}
          </span>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-sky-300">
            {TIER_LABELS[activeTier] ?? activeTier}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold tracking-tight text-neutral-100">
                {TIER_LABELS[activeTier] ?? activeTier}
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                {subscription.billingInterval}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              {subscription.cancelAtPeriodEnd
                ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
            </p>

            <div className="mt-4 space-y-3">
              <UsageBar
                label="Monthly drops"
                used={subscription.usage.monthlyDropsUsed}
                max={subscription.limits.maxMonthlyDrops}
                tone="bg-linear-to-r from-rose-500 to-rose-300"
              />
              <UsageBar
                label="AI credits"
                used={subscription.usage.aiCreditsUsed}
                max={subscription.limits.maxAiCredits}
                tone="bg-linear-to-r from-sky-400 to-sky-300"
              />
              <UsageBar
                label="Channels"
                used={subscription.usage.channelsUsed}
                max={subscription.limits.maxChannels}
                tone="bg-linear-to-r from-emerald-400 to-emerald-300"
              />
            </div>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handlePortal()}
                disabled={busy !== null || !subscription.hasBillingAccount}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-[11px] font-semibold text-neutral-300 transition-colors hover:border-neutral-700 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === "portal" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                Manage billing
              </button>

              {subscription.hasBillingAccount &&
                (subscription.cancelAtPeriodEnd ? (
                  <button
                    type="button"
                    onClick={() => void handleResume()}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15 disabled:opacity-40"
                  >
                    {busy === "resume" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Resume plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleCancel()}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-[11px] font-semibold text-neutral-400 transition-colors hover:border-rose-500/30 hover:text-rose-200 disabled:opacity-40"
                  >
                    {busy === "cancel" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Cancel at period end
                  </button>
                ))}
            </div>
          )}

          {canManage && invoices.length > 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                <Receipt className="h-3 w-3" /> Recent invoices
              </div>
              <div className="mt-2 space-y-1.5">
                {invoices.slice(0, 3).map((invoice) => (
                  <a
                    key={invoice.id}
                    href={invoice.hostedInvoiceUrl ?? invoice.invoicePdfUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 text-[11px] text-neutral-400 transition-colors hover:text-neutral-100"
                  >
                    <span className="truncate font-mono text-[10px]">{invoice.invoiceNumber}</span>
                    <span className="signal-tabular shrink-0">
                      {formatMoney(invoice.amountPaidDollars)}{" "}
                      <span className="text-neutral-600">· {invoice.status}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
              <Sparkles className="h-3 w-3 text-rose-300" /> Available plans
            </div>
            <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
              {(["monthly", "yearly"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInterval(option)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
                    interval === option
                      ? "bg-neutral-800 text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {paidPlans.map((plan) => {
              const isCurrent = plan.tier === activeTier;
              const price =
                interval === "yearly" ? plan.yearlyPriceDollars : plan.monthlyPriceDollars;
              return (
                <div
                  key={plan.tier}
                  className={`rounded-2xl border p-3 transition-colors ${
                    isCurrent
                      ? "border-rose-500/30 bg-rose-500/10"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-neutral-100">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-rose-200">
                            popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-neutral-500">
                        {plan.description}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[9px] text-neutral-500">
                        <span>{plan.limits.maxMonthlyDrops.toLocaleString()} drops</span>
                        <span>{plan.limits.maxAiCredits.toLocaleString()} AI</span>
                        <span>{plan.limits.maxTeamMembers} seats</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="signal-tabular text-sm font-semibold text-neutral-100">
                        {formatMoney(price)}
                        <span className="font-mono text-[9px] font-normal text-neutral-500">
                          /{interval === "yearly" ? "yr" : "mo"}
                        </span>
                      </div>
                      {canManage ? (
                        isCurrent ? (
                          <span className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] uppercase text-rose-200">
                            <Check className="h-3 w-3" /> current
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleCheckout(plan)}
                            disabled={busy !== null}
                            className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1 text-[10px] font-semibold text-[#1b0b08] transition-colors hover:bg-rose-400 disabled:opacity-40"
                          >
                            {busy === plan.tier ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            Choose
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!canManage && (
            <p className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-[10px] text-neutral-500">
              Only workspace owners and admins can change the plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
