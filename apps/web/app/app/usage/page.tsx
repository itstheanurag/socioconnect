"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, Sparkles, CreditCard, Download, TrendingUp } from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  isCurrent: boolean;
  isPopular?: boolean;
  features: string[];
}

const TIERS: PlanTier[] = [
  {
    id: "solo",
    name: "solo creator",
    price: "$0",
    cadence: "free forever",
    description: "essential publishing for solo builders getting started.",
    isCurrent: false,
    features: [
      "up to 3 connected social channels",
      "30 scheduled posts per month",
      "basic character budget meters",
      "community support",
    ],
  },
  {
    id: "pro",
    name: "creator pro",
    price: "$19",
    cadence: "per month &middot; billed annually",
    description: "the complete creative operating system for active multi-platform creators.",
    isCurrent: true,
    isPopular: true,
    features: [
      "up to 12 connected social channels",
      "unlimited scheduled posts",
      "ai format adaptation & tone bot",
      "smart audience peak time scheduling",
      "autonomous queue retry engine",
      "priority token refresh",
    ],
  },
  {
    id: "studio",
    name: "studio & team",
    price: "$49",
    cadence: "per month &middot; billed annually",
    description: "for production studios, agencies, and creator collectives.",
    isCurrent: false,
    features: [
      "unlimited social channels & brands",
      "multi-user workspace & editor approvals",
      "custom webhook integrations & zapier keys",
      "dedicated queue worker instance",
      "24/7 priority creator support",
    ],
  },
];

const INVOICES = [
  { id: "INV-2026-09", date: "sep 01, 2026", amount: "$19.00", status: "paid" },
  { id: "INV-2026-08", date: "aug 01, 2026", amount: "$19.00", status: "paid" },
  { id: "INV-2026-07", date: "jul 01, 2026", amount: "$19.00", status: "paid" },
];

export default function UsagePlanPage() {
  const [activeTab, setActiveTab] = useState<"usage" | "plans" | "billing">("usage");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8 lowercase">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white font-mono text-xs px-4 py-2.5 rounded-md shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5 text-[#F4DCB4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ede8df] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2">
            <BarChart3 className="h-3 w-3 text-stone-800" />
            <span>subscription &middot; creator pro tier</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-emerald-700 font-bold">active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
            plan, quotas &amp; usage meters
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-2xl">
            monitor your channel limits, monthly dispatch volumes, and ai generation quotas in real
            time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {(["usage", "plans", "billing"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                activeTab === tab
                  ? "border-stone-900 bg-white font-bold text-stone-900 shadow-2xs"
                  : "border-[#ede8df] bg-white/60 text-stone-600 hover:border-stone-400"
              }`}
            >
              {tab === "usage"
                ? "current usage"
                : tab === "plans"
                  ? "compare plans"
                  : "billing history"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "usage" && (
        <div className="space-y-6">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* Metric 1: Connected Accounts */}
            <div className="border border-[#ede8df] bg-white p-5 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>connected accounts</span>
                <span className="font-bold text-stone-800">6 / 12</span>
              </div>
              <div className="w-full bg-[#faf8f5] border border-[#ede8df] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-stone-900 h-full rounded-full transition-all"
                  style={{ width: "50%" }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-sans">
                6 additional account slots available on Pro
              </p>
            </div>

            {/* Metric 2: Monthly Posts */}
            <div className="border border-[#ede8df] bg-white p-5 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>monthly drops</span>
                <span className="font-bold text-stone-800">78 / 250</span>
              </div>
              <div className="w-full bg-[#faf8f5] border border-[#ede8df] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#dfc39a] h-full rounded-full transition-all"
                  style={{ width: "31%" }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-sans">
                resets in 9 days (oct 01, 2026)
              </p>
            </div>

            {/* Metric 3: AI Adaptations */}
            <div className="border border-[#ede8df] bg-white p-5 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>ai adaptations</span>
                <span className="font-bold text-stone-800">34 / 150</span>
              </div>
              <div className="w-full bg-[#faf8f5] border border-[#ede8df] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: "23%" }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-sans">
                116 format morphs remaining this cycle
              </p>
            </div>

            {/* Metric 4: CDN Storage */}
            <div className="border border-[#ede8df] bg-white p-5 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>video cdn storage</span>
                <span className="font-bold text-stone-800">14.8 / 50 GB</span>
              </div>
              <div className="w-full bg-[#faf8f5] border border-[#ede8df] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-stone-800 h-full rounded-full transition-all"
                  style={{ width: "29%" }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-sans">
                ultra-fast 4k video transcode enabled
              </p>
            </div>
          </div>

          {/* Detailed Resource Breakdown Card */}
          <div className="border border-[#ede8df] bg-white p-6 rounded-md shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <TrendingUp className="h-4 w-4 text-[#dfc39a]" />
                <span>active features &amp; capabilities overview</span>
              </div>
              <span className="text-stone-400 text-[11px]">all systems nominal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#faf8f5] p-4 border border-[#ede8df] rounded-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>autonomous peak timing</span>
                </div>
                <p className="text-stone-600 font-sans text-xs">
                  enabled across all 6 active social destinations.
                </p>
              </div>

              <div className="bg-[#faf8f5] p-4 border border-[#ede8df] rounded-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>hardware-token encryption</span>
                </div>
                <p className="text-stone-600 font-sans text-xs">
                  oauth 2.0 pkce delegation with zero password exposure.
                </p>
              </div>

              <div className="bg-[#faf8f5] p-4 border border-[#ede8df] rounded-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>unlimited queue workers</span>
                </div>
                <p className="text-stone-600 font-sans text-xs">
                  automatic retry backoff and rate limit isolation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`border p-6 rounded-md transition-all flex flex-col justify-between space-y-6 ${
                tier.isCurrent
                  ? "border-stone-900 bg-white shadow-md ring-1 ring-stone-900/10"
                  : "border-[#ede8df] bg-white/70 hover:bg-white"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-stone-900">{tier.name}</span>
                  {tier.isCurrent ? (
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                      current plan
                    </span>
                  ) : tier.isPopular ? (
                    <span className="font-mono text-[10px] font-bold text-stone-900 bg-secondary border border-secondary-border px-2 py-0.5 rounded-xs">
                      most popular
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-3xl font-extrabold text-stone-900">{tier.price}</span>
                  <span className="text-xs text-stone-500">{tier.cadence}</span>
                </div>

                <p className="mt-2 text-xs text-stone-600 font-sans leading-relaxed">
                  {tier.description}
                </p>

                {/* Features list */}
                <div className="mt-6 pt-4 border-t border-dashed border-[#ede8df] space-y-2.5 font-mono text-xs">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-stone-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  showToast(
                    tier.isCurrent
                      ? "You are already on this plan."
                      : `Switched subscription to ${tier.name}!`,
                  )
                }
                className={`w-full py-2.5 px-4 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                  tier.isCurrent
                    ? "bg-stone-100 text-stone-600 border border-stone-300"
                    : "bg-secondary text-stone-900 border border-secondary-border hover:bg-[#ebd0a3]"
                }`}
              >
                {tier.isCurrent ? "current plan active" : `upgrade to ${tier.name} →`}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Card & Payment Method Details */}
          <div className="border border-[#ede8df] bg-white p-6 rounded-md shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-800">
                <CreditCard className="h-4 w-4 text-[#dfc39a]" />
                <span>active payment method</span>
              </div>
              <button
                type="button"
                onClick={() => showToast("Opened secure card update modal.")}
                className="font-mono text-xs text-stone-700 hover:text-stone-900 underline cursor-pointer"
              >
                update card
              </button>
            </div>

            <div className="flex items-center justify-between font-mono text-xs bg-[#faf8f5] p-3.5 border border-[#ede8df] rounded-md">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-white border border-[#ede8df] rounded-sm font-bold text-[10px]">
                  VISA
                </div>
                <div>
                  <span className="font-bold text-stone-900">Visa ending in 4242</span>
                  <span className="text-stone-400 text-[10px] block">expires 12/2028</span>
                </div>
              </div>
              <span className="text-emerald-700 font-semibold text-[11px]">&bull; default</span>
            </div>
          </div>

          {/* Invoice History Table */}
          <div className="border border-[#ede8df] bg-white p-6 rounded-md shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3">
              <div className="font-bold text-stone-800">billing &amp; invoice history</div>
              <span className="text-stone-400 text-[10px]">3 invoices total</span>
            </div>

            <div className="space-y-2">
              {INVOICES.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 border border-[#ede8df] bg-[#faf8f5] rounded-md"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-stone-900">{inv.id}</span>
                    <span className="text-stone-500 text-[11px]">{inv.date}</span>
                    <span className="text-stone-800 font-semibold">{inv.amount}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs text-[10px] font-bold">
                      {inv.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Downloaded invoice ${inv.id} PDF.`)}
                      className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
