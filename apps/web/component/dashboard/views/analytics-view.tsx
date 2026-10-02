"use client";

import React, { useState } from "react";
import { TrendingUp, Eye, Heart, Share2, Sparkles } from "lucide-react";
import { PlatformIcon } from "@/component/dashboard/ui/platform-icon";
import { PlatformId } from "@/component/dashboard/types";

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const platformPerformance = [
    {
      platformId: "instagram" as PlatformId,
      name: "Instagram",
      impressions: "142.8k",
      engagement: "5.4%",
      growth: "+18%",
    },
    {
      platformId: "twitter" as PlatformId,
      name: "X (Twitter)",
      impressions: "289.4k",
      engagement: "3.8%",
      growth: "+24%",
    },
    {
      platformId: "linkedin" as PlatformId,
      name: "LinkedIn",
      impressions: "94.2k",
      engagement: "7.1%",
      growth: "+12%",
    },
    {
      platformId: "reddit" as PlatformId,
      name: "Reddit",
      impressions: "68.5k",
      engagement: "8.9%",
      growth: "+31%",
    },
    {
      platformId: "telegram" as PlatformId,
      name: "Telegram",
      impressions: "112.0k",
      engagement: "14.2%",
      growth: "+19%",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Publishing Intelligence
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Analytics &amp; Network Reach
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track cross-platform audience engagement, peak distribution windows, and content
            conversions.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium uppercase transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-rose-500/20 text-neutral-100 font-semibold border border-rose-500/30"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top High-level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold font-display text-neutral-100">706.9k</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +22.4% vs previous period
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Cross-Network Engagement</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-display text-neutral-100">6.2%</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +1.8% benchmark
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Dispatched Campaigns</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-display text-neutral-100">38</div>
          <div className="text-[11px] font-mono text-neutral-400">100% broadcast delivery</div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Peak Broadcast Hour</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-display text-neutral-100">14:00</div>
          <div className="text-[11px] font-mono text-amber-400">Best global intersection</div>
        </div>
      </div>

      {/* Platform Level Breakdown Table */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h3 className="font-display text-lg font-bold text-neutral-100">
          Channel Velocity Breakdown
        </h3>

        <div className="divide-y divide-neutral-800/80">
          {platformPerformance.map((p) => (
            <div
              key={p.platformId}
              className="py-3.5 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <PlatformIcon platformId={p.platformId} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-100">{p.name}</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {p.growth} monthly growth
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <div className="font-mono text-neutral-200 font-semibold">{p.impressions}</div>
                  <div className="text-[10px] text-neutral-500">Impressions</div>
                </div>
                <div>
                  <div className="font-mono text-emerald-400 font-semibold">{p.engagement}</div>
                  <div className="text-[10px] text-neutral-500">Engagement</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
