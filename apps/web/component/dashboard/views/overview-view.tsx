"use client";

import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Radio,
  Sparkles,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Bot,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { PlatformId } from "../types";

export function OverviewView() {
  const { user } = useAuth();
  const { posts, connectors, bots, navigateToCompose, openContextualPanel, setCurrentSection } =
    useDashboard();

  const [avatarErr, setAvatarErr] = useState(false);

  const userName = user?.firstName || "Gaurav";
  const userAvatar = user?.avatar;
  const userInitial = user?.firstName ? user.firstName[0]?.toUpperCase() : "G";

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const connectedConnectors = connectors.filter((c) => c.status === "connected");

  // Platform activity statistics
  const platformActivity: {
    platformId: PlatformId;
    name: string;
    publishedCount: number;
    activityPercent: number;
    color: string;
  }[] = [
    {
      platformId: "instagram",
      name: "Instagram",
      publishedCount: 48,
      activityPercent: 88,
      color: "bg-pink-500",
    },
    {
      platformId: "twitter",
      name: "X (Twitter)",
      publishedCount: 64,
      activityPercent: 94,
      color: "bg-neutral-200",
    },
    {
      platformId: "linkedin",
      name: "LinkedIn",
      publishedCount: 32,
      activityPercent: 72,
      color: "bg-sky-500",
    },
    {
      platformId: "reddit",
      name: "Reddit",
      publishedCount: 28,
      activityPercent: 65,
      color: "bg-orange-500",
    },
    {
      platformId: "telegram",
      name: "Telegram",
      publishedCount: 52,
      activityPercent: 82,
      color: "bg-cyan-500",
    },
    {
      platformId: "threads",
      name: "Threads",
      publishedCount: 19,
      activityPercent: 44,
      color: "bg-neutral-400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          {userAvatar && !avatarErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userAvatar}
              alt={userName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarErr(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-rose-500/30 shadow-xl shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center font-display text-2xl font-bold ring-2 ring-rose-500/30 shadow-xl shrink-0">
              {userInitial}
            </div>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-1.5">
              <Sparkles className="w-3 h-3" />
              Social Operating System
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Good morning, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Here&apos;s what&apos;s happening across your connected social network.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateToCompose()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-3 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Scheduled Queue</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white">
              {scheduledPosts.length}
            </span>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
              Next in 2h
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">Across 6 destinations</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-3 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Published Content</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white">
              {publishedPosts.length > 0 ? publishedPosts.length : 138}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">99.8% dispatch success</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-3 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Connected Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white">
              {connectedConnectors.length}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              All Synced
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">Tokens valid &amp; active</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-3 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Telegram Bots</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white">{bots.length} active</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              Webhooks OK
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">18 queued broadcasts</p>
        </motion.div>
      </div>

      {/* Two-Column Core Layout: Upcoming Feed + Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Upcoming Scheduled Posts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <h2 className="font-display text-base font-semibold text-white">Upcoming Queue</h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentSection("calendar")}
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4">
            {/* Today Group */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Today</span>
              </div>

              {scheduledPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => openContextualPanel("post_preview", post)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/12 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "10:30"}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                        {post.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{post.baseContent}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {post.targetPlatforms.map((p) => {
                        const brand = getPlatformBrandColor(p);
                        return (
                          <div
                            key={p}
                            className={`p-1.5 rounded-lg border ${brand.bg} ${brand.border} ${brand.text}`}
                            title={p}
                          >
                            <PlatformIcon platformId={p} className="w-3 h-3" />
                          </div>
                        );
                      })}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tomorrow Group */}
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                <span>Tomorrow</span>
              </div>

              {scheduledPosts.slice(2, 4).map((post) => (
                <div
                  key={post.id}
                  onClick={() => openContextualPanel("post_preview", post)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/12 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "09:00"}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                        {post.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{post.baseContent}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {post.targetPlatforms.map((p) => {
                        const brand = getPlatformBrandColor(p);
                        return (
                          <div
                            key={p}
                            className={`p-1.5 rounded-lg border ${brand.bg} ${brand.border} ${brand.text}`}
                            title={p}
                          >
                            <PlatformIcon platformId={p} className="w-3 h-3" />
                          </div>
                        );
                      })}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Platform Activity Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h2 className="font-display text-base font-semibold text-white">Platform Activity</h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentSection("connectors")}
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Manage ({connectors.length})
            </button>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4">
            <div className="space-y-3.5">
              {platformActivity.map((plat) => (
                <div key={plat.platformId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PlatformIcon
                        platformId={plat.platformId}
                        className="w-3.5 h-3.5 text-white"
                      />
                      <span className="font-semibold text-neutral-200">{plat.name}</span>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {plat.publishedCount} posts ({plat.activityPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${plat.color} transition-all duration-500`}
                      style={{ width: `${plat.activityPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Automation Highlight Banner */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">3 Rules Active</div>
                  <div className="text-[10px] text-neutral-400">
                    Cross-posting to Reddit &amp; Telegram
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentSection("automations")}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
