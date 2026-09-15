"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            TRANSPARENT CREATOR PRICING
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Simple plans for creators at any stage.
          </h2>
          <p className="mt-3 text-base text-stone-600">
            Start free, connect your favorite platforms without sharing passwords, and upgrade
            whenever you need unlimited scheduled queue slots.
          </p>

          {/* Billing Switch */}
          <div className="mt-6 inline-flex items-center border border-dashed border-[#dcd5c8] bg-white p-1 font-mono text-xs rounded-xs shadow-xs">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 transition-colors rounded-xs ${
                !annual
                  ? "bg-stone-900 text-white font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 transition-colors rounded-xs ${
                annual ? "bg-stone-900 text-white font-bold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>ANNUAL</span>
              <span className="border border-dashed border-[#dfc39a] bg-[#F4DCB4] px-1.5 py-0.2 text-[10px] text-stone-900 font-bold rounded-full">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan 1: Free Starter */}
          <div className="relative border border-dashed border-[#dfc39a] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="font-mono text-xs text-stone-500 uppercase tracking-wider mb-2">
                FOR EXPLORERS
              </div>
              <h3 className="text-xl font-bold text-stone-900">Free Starter</h3>
              <p className="mt-2 text-xs text-stone-600">
                Perfect for indie makers and writers testing out multi-app cross-posting.
              </p>

              <div className="mt-6 flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-stone-900">$0</span>
                <span className="text-xs text-stone-500">/ forever</span>
              </div>

              <ul className="mt-8 space-y-3 font-mono text-xs text-stone-700 border-t border-dashed border-[#f0ede6] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Up to 3 connected apps (X, LinkedIn, Peerlist)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Zero passwords stored (Official OAuth)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>15 scheduled queue posts per month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Character budget guardrails</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-[#f0ede6]">
              <Link
                href="/app"
                className="w-full inline-flex items-center justify-center gap-2 border border-dashed border-[#dcd5c8] bg-white py-3 font-mono text-xs font-bold text-stone-800 hover:border-stone-500 hover:bg-[#faf8f5] transition-colors rounded-sm"
              >
                <span>GET STARTED FREE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Plan 2: Creator Pro (Featured) */}
          <div className="relative border-2 border-stone-900 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-stone-900/5">
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-2">
                <span className="text-stone-500 uppercase tracking-wider">FOR ACTIVE CREATORS</span>
                <span className="border border-[#dfc39a] bg-[#F4DCB4] px-2 py-0.5 text-[10px] text-stone-900 font-bold rounded-full">
                  POPULAR
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">Creator Pro</h3>
              <p className="mt-2 text-xs text-stone-600">
                For solo founders, writers, and developers distributing across all platforms.
              </p>

              <div className="mt-6 flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-stone-900">${annual ? "15" : "19"}</span>
                <span className="text-xs text-stone-500">/ month</span>
              </div>

              <ul className="mt-8 space-y-3 font-mono text-xs text-stone-800 border-t border-dashed border-[#f0ede6] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>All apps (X, LinkedIn, Peerlist, Reddit, Bluesky)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>Unlimited scheduled posts &amp; queues</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>Interactive multi-timezone calendar</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>Auto-thread splitting for long thoughts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>AES-256-GCM zero-credential vault</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-900 shrink-0" />
                  <span>Fault-isolated broadcast guarantee</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-[#f0ede6]">
              <Link
                href="/app"
                className="w-full inline-flex items-center justify-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] py-3.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-sm shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-stone-800" />
                <span>START 14-DAY PRO TRIAL</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Plan 3: Studio / Agency */}
          <div className="relative border border-[#ede8df] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="font-mono text-xs text-stone-500 uppercase tracking-wider mb-2">
                FOR TEAMS &amp; STUDIOS
              </div>
              <h3 className="text-xl font-bold text-stone-900">Studio Team</h3>
              <p className="mt-2 text-xs text-stone-600">
                For dev shops and studios distributing multiple client product updates.
              </p>

              <div className="mt-6 flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-stone-900">${annual ? "39" : "49"}</span>
                <span className="text-xs text-stone-500">/ month</span>
              </div>

              <ul className="mt-8 space-y-3 font-mono text-xs text-stone-700 border-t border-dashed border-[#f0ede6] pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Everything in Creator Pro</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Multi-account workspaces &amp; client vaults</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Team draft reviews &amp; approvals</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Webhook API dispatch endpoints</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Priority creator concierge support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-[#f0ede6]">
              <Link
                href="/app"
                className="w-full inline-flex items-center justify-center gap-2 border border-[#dcd5c8] bg-white py-3 font-mono text-xs font-bold text-stone-800 hover:border-stone-400 hover:bg-[#faf8f5] transition-colors rounded-sm"
              >
                <span>CHOOSE STUDIO TEAM</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
