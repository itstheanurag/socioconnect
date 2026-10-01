"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { PlatformId } from "../types";

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const platformPerformance = [
    { platformId: "instagram" as PlatformId, name: "Instagram", impressions: "142.8k", engagement: "5.4%", growth: "+18%" },
    { platformId: "twitter" as PlatformId, name: "X (Twitter)", impressions: "289.4k", engagement: "3.8%", growth: "+24%" },
    { platformId: "linkedin" as PlatformId, name: "LinkedIn", impressions: "94.2k", engagement: "7.1%", growth: "+12%" },
    { platformId: "reddit" as PlatformId, name: "Reddit", impressions: "68.5k", engagement: "8.9%", growth: "+31%" },
    { platformId: "telegram" as PlatformId, name: "Telegram", impressions: "112.0k", engagement: "14.2%", growth: "+19%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Publishing Intelligence
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Analytics &amp; Network Reach
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track cross-platform audience engagement, peak distribution windows, and content conversions.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/6">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium uppercase transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-rose-500/20 text-white font-semibold border border-rose-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top High-level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold font-display text-white">706.9k</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +22.4% vs previous period
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Cross-Network Engagement</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-display text-white">6.2%</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +1.8% benchmark
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Dispatched Shares &amp; Reposts</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-display text-white">18.4k</div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +34% virality
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Telegram Bot Broadcasts</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-display text-white">100%</div>
          <div className="text-[11px] font-mono text-cyan-400">Zero dropped webhooks</div>
        </div>
      </div>

      {/* Platform Breakdown Table */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
        <h3 className="font-display text-base font-bold text-white">
          Platform Performance &amp; Conversion
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-neutral-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Network</th>
                <th className="pb-3 font-semibold">Impressions</th>
                <th className="pb-3 font-semibold">Engagement Rate</th>
                <th className="pb-3 font-semibold">Audience Growth</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {platformPerformance.map((item) => (
                <tr key={item.platformId} className="group hover:bg-white/[0.02]">
                  <td className="py-3.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <PlatformIcon platformId={item.platformId} className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-white">{item.name}</span>
                  </td>
                  <td className="py-3.5 font-mono text-neutral-300">{item.impressions}</td>
                  <td className="py-3.5 font-mono text-rose-300 font-semibold">{item.engagement}</td>
                  <td className="py-3.5 font-mono text-emerald-400">{item.growth}</td>
                  <td className="py-3.5 text-right">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Posting Times Heatmap */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Optimal Publishing Windows
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Based on historical engagement rates across your audience timezones.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Peak: Tue &amp; Thu @ 10:00 - 14:00
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
            <div
              key={day}
              className={`p-3 rounded-2xl border text-center space-y-1.5 ${
                idx === 1 || idx === 3
                  ? "bg-rose-500/15 border-rose-500/30 text-white"
                  : "bg-white/[0.02] border-white/5 text-neutral-400"
              }`}
            >
              <div className="font-mono text-xs font-bold uppercase">{day}</div>
              <div className="text-[10px] font-mono opacity-80">
                {idx === 1 || idx === 3 ? "🔥 10:30 AM" : "09:00 AM"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
