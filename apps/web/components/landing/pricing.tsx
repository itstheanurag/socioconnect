"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";

export function LandingPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  const handleAction = () => {
    if (isAuthenticated) {
      router.push("/app");
    } else {
      openAuthModal("/app");
    }
  };

  return (
    <section
      id="pricing"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lowercase">
          <div className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md mb-4">
            <Sparkles className="h-3.5 w-3.5 text-stone-800" />
            <span>transparent creator pricing</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Simple, honest plans for every stage.
          </h2>
          <p className="mt-3 text-base text-stone-600">
            Start for free, then upgrade as your audience and publishing channels grow.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center border border-[#ede8df] bg-white p-1 rounded-md shadow-2xs font-mono text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#F4DCB4] text-stone-900 font-bold shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              monthly billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-[#F4DCB4] text-stone-900 font-bold shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>annual billing</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.5 rounded-xs">
                save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch lowercase">
          {/* Free Starter Tier */}
          <div className="border border-[#ede8df] bg-white p-6 sm:p-8 rounded-md shadow-xs flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-stone-500 mb-2">for casual creators</div>
              <h3 className="text-xl font-bold text-stone-900 font-sans">starter</h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                perfect for hobby creators getting started with cross-posting.
              </p>

              <div className="mt-6 mb-6 font-mono">
                <span className="text-4xl font-extrabold text-stone-900">$0</span>
                <span className="text-xs text-stone-500 ml-1">/ forever</span>
              </div>

              <div className="space-y-3 font-sans text-xs text-stone-700 border-t border-dashed border-[#ede8df] pt-6">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>3 connected channels (youtube, x, instagram)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>20 scheduled posts per month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>simultaneous instant publishing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>basic character limit warnings</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% private account safety</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAction}
              className="mt-8 w-full border border-[#ede8df] bg-[#faf8f5] py-2.5 font-mono text-xs font-bold text-stone-800 hover:border-stone-400 hover:bg-white transition-colors rounded-md cursor-pointer"
            >
              get started free
            </button>
          </div>

          {/* Pro Creator Tier (Highlighted) */}
          <div className="relative border-2 border-[#dfc39a] bg-white p-6 sm:p-8 rounded-md shadow-md flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 border border-[#dfc39a] bg-[#F4DCB4] px-3 py-0.5 text-[10px] font-mono font-bold text-stone-900 rounded-md shadow-2xs">
              popular
            </div>

            <div>
              <div className="font-mono text-xs text-stone-500 mb-2">for active creators</div>
              <h3 className="text-xl font-bold text-stone-900 font-sans">pro creator</h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                for growing creators publishing weekly videos, streams, reels, and stories.
              </p>

              <div className="mt-6 mb-6 font-mono">
                <span className="text-4xl font-extrabold text-stone-900">
                  {billingCycle === "annual" ? "$15" : "$19"}
                </span>
                <span className="text-xs text-stone-500 ml-1">/ month</span>
                {billingCycle === "annual" && (
                  <span className="block text-[10px] text-stone-400 font-normal">
                    billed annually ($180/yr)
                  </span>
                )}
              </div>

              <div className="space-y-3 font-sans text-xs text-stone-700 border-t border-dashed border-[#ede8df] pt-6">
                <div className="flex items-center gap-2.5 font-semibold text-stone-900">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>unlimited connected creator channels</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-stone-900">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>unlimited scheduled posts &amp; drafts</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-stone-900">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>staggered peak hour drops</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>visual 7-day audience calendar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>automatic thread splitters for x &amp; bluesky</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>instant retry backup for network hiccups</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAction}
              className="mt-8 w-full border border-[#dfc39a] bg-[#F4DCB4] py-2.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-md shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>start 14-day pro trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Studio / Agency Tier */}
          <div className="border border-[#ede8df] bg-white p-6 sm:p-8 rounded-md shadow-xs flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-stone-500 mb-2">for teams &amp; studios</div>
              <h3 className="text-xl font-bold text-stone-900 font-sans">studio team</h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                for creator agencies, podcasts, and collaborative production teams.
              </p>

              <div className="mt-6 mb-6 font-mono">
                <span className="text-4xl font-extrabold text-stone-900">
                  {billingCycle === "annual" ? "$39" : "$49"}
                </span>
                <span className="text-xs text-stone-500 ml-1">/ month</span>
                {billingCycle === "annual" && (
                  <span className="block text-[10px] text-stone-400 font-normal">
                    billed annually ($468/yr)
                  </span>
                )}
              </div>

              <div className="space-y-3 font-sans text-xs text-stone-700 border-t border-dashed border-[#ede8df] pt-6">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>everything in pro creator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>multiple creator workspace brands</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>team draft review &amp; approval workflows</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>custom release queues per brand</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>priority 24/7 creator support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAction}
              className="mt-8 w-full border border-[#ede8df] bg-[#faf8f5] py-2.5 font-mono text-xs font-bold text-stone-800 hover:border-stone-400 hover:bg-white transition-colors rounded-md cursor-pointer"
            >
              contact studio sales
            </button>
          </div>
        </div>

        {/* Security Guarantee Note */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 font-mono text-xs text-stone-500 lowercase">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>all plans include 100% private accounts with zero password storage</span>
        </div>
      </div>
    </section>
  );
}
