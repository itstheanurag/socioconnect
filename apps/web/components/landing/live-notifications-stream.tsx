"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, Pause, Play, Zap } from "lucide-react";

interface LiveNotification {
  id: string;
  platform: "x" | "linkedin" | "peerlist" | "reddit" | "bluesky";
  platformName: string;
  iconText: string;
  iconBg: string;
  iconColor: string;
  actionText: string;
  postTitle: string;
  timeAgo: string;
  latency: string;
  status: "success" | "queued";
}

const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: "notif-1",
    platform: "peerlist",
    platformName: "Peerlist",
    iconText: "P",
    iconBg: "bg-[#00AA45]",
    iconColor: "text-white",
    actionText: "Posted to Peerlist Maker Feed",
    postTitle: "Introducing our atomic multi-network publishing queue for creators 🚀",
    timeAgo: "2s ago",
    latency: "84ms",
    status: "success",
  },
  {
    id: "notif-2",
    platform: "x",
    platformName: "X (Twitter)",
    iconText: "𝕏",
    iconBg: "bg-stone-900",
    iconColor: "text-white",
    actionText: "Thread (1/4) Dispatched to X",
    postTitle: "Why we killed manual copy-pasting across 5 tabs: an engineering breakdown...",
    timeAgo: "6s ago",
    latency: "112ms",
    status: "success",
  },
  {
    id: "notif-3",
    platform: "linkedin",
    platformName: "LinkedIn",
    iconText: "in",
    iconBg: "bg-[#0a66c2]",
    iconColor: "text-white",
    actionText: "Published to LinkedIn Professional",
    postTitle:
      "How solo founders scale brand reach without burning 10 hours a week on social media.",
    timeAgo: "14s ago",
    latency: "96ms",
    status: "success",
  },
  {
    id: "notif-4",
    platform: "reddit",
    platformName: "Reddit",
    iconText: "rd",
    iconBg: "bg-[#ff4500]",
    iconColor: "text-white",
    actionText: "Submitted to r/SideProject",
    postTitle: "We built an open-source calm multi-channel distribution studio.",
    timeAgo: "22s ago",
    latency: "148ms",
    status: "success",
  },
  {
    id: "notif-5",
    platform: "bluesky",
    platformName: "Bluesky",
    iconText: "bs",
    iconBg: "bg-[#0285ff]",
    iconColor: "text-white",
    actionText: "Posted to Bluesky AT Protocol",
    postTitle: "Federated cross-posting is now live with zero password storage 🌐",
    timeAgo: "31s ago",
    latency: "76ms",
    status: "success",
  },
];

const POOL_OF_UPDATES = [
  {
    platform: "peerlist" as const,
    platformName: "Peerlist",
    iconText: "P",
    iconBg: "bg-[#00AA45]",
    iconColor: "text-white",
    actionText: "Posted to Peerlist Projects",
    postTitle: "SocioConnect v1.2 is trending on Peerlist Spotlight today!",
  },
  {
    platform: "x" as const,
    platformName: "X (Twitter)",
    iconText: "𝕏",
    iconBg: "bg-stone-900",
    iconColor: "text-white",
    actionText: "Posted to X (Twitter)",
    postTitle: "3 rules for sustainable writing as an engineer: 1. Keep a draft inbox...",
  },
  {
    platform: "linkedin" as const,
    platformName: "LinkedIn",
    iconText: "in",
    iconBg: "bg-[#0a66c2]",
    iconColor: "text-white",
    actionText: "Published to LinkedIn Feed",
    postTitle: "The quiet revolution in creator distribution: Write once, publish cleanly.",
  },
  {
    platform: "reddit" as const,
    platformName: "Reddit",
    iconText: "rd",
    iconBg: "bg-[#ff4500]",
    iconColor: "text-white",
    actionText: "Submitted to r/webdev",
    postTitle: "Show r/webdev: Clean React 19 architecture for multi-platform webhooks.",
  },
  {
    platform: "bluesky" as const,
    platformName: "Bluesky",
    iconText: "bs",
    iconBg: "bg-[#0285ff]",
    iconColor: "text-white",
    actionText: "Posted to Bluesky",
    postTitle: "Never share passwords with tools. Demand OAuth 2.0 PKCE with hardware vault keys.",
  },
];

export function LiveNotificationsStream() {
  const [notifications, setNotifications] = useState<LiveNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLive, setIsLive] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [totalDispatchedCount, setTotalDispatchedCount] = useState(14820);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const randomUpdate = POOL_OF_UPDATES[Math.floor(Math.random() * POOL_OF_UPDATES.length)];
      const randomLatency = `${Math.floor(Math.random() * 50) + 70}ms`;

      const newNotification: LiveNotification = {
        id: `notif-${Date.now()}`,
        platform: randomUpdate.platform,
        platformName: randomUpdate.platformName,
        iconText: randomUpdate.iconText,
        iconBg: randomUpdate.iconBg,
        iconColor: randomUpdate.iconColor,
        actionText: randomUpdate.actionText,
        postTitle: randomUpdate.postTitle,
        timeAgo: "just now",
        latency: randomLatency,
        status: "success",
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 7)]);
      setTotalDispatchedCount((c) => c + 1);
    }, 3800);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredNotifications =
    selectedFilter === "all"
      ? notifications
      : notifications.filter((n) => n.platform === selectedFilter);

  function handleTriggerManualBlast() {
    const platforms: Array<"x" | "linkedin" | "peerlist" | "reddit" | "bluesky"> = [
      "peerlist",
      "x",
      "linkedin",
      "reddit",
      "bluesky",
    ];

    const newItems: LiveNotification[] = platforms.map((p, i) => {
      const match = POOL_OF_UPDATES.find((item) => item.platform === p)!;
      return {
        id: `blast-${Date.now()}-${i}`,
        platform: p,
        platformName: match.platformName,
        iconText: match.iconText,
        iconBg: match.iconBg,
        iconColor: match.iconColor,
        actionText: `Simultaneous Broadcast to ${match.platformName}`,
        postTitle: "Multi-network launch confirmed across all active channels.",
        timeAgo: "just now",
        latency: `${Math.floor(Math.random() * 40) + 65}ms`,
        status: "success",
      };
    });

    setNotifications((prev) => [...newItems, ...prev.slice(0, 4)]);
    setTotalDispatchedCount((c) => c + platforms.length);
  }

  return (
    <section
      id="live-stream"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME OUTBOUND STREAM
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Watch posts dispatch across all apps in real-time.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              When you hit broadcast or your scheduled queue triggers, SocioConnect pushes out
              instant, decoupled API requests. Zero feed reading, pure high-speed delivery.
            </p>
          </div>

          {/* Real-time telemetry badge & controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className="inline-flex items-center gap-2 border border-[#ede8df] bg-[#faf8f5] px-3.5 py-2 font-mono text-xs text-stone-700 hover:bg-stone-100 transition-colors rounded-xs shadow-2xs"
            >
              {isLive ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-stone-600" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                  <span>RESUME STREAM</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerManualBlast}
              className="inline-flex items-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] px-4 py-2 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-xs shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 text-stone-800" />
              <span>TEST 5-APP BROADCAST</span>
            </button>
          </div>
        </div>

        {/* Live Stream Board Frame */}
        <div className="border border-[#ede8df] bg-[#faf8f5] p-5 sm:p-8 rounded-xs shadow-xs">
          {/* Top Bar with Filter Chips & Counters */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-[#ede8df] pb-4 mb-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400 uppercase text-[10px]">FILTER:</span>
              {(["all", "x", "linkedin", "peerlist", "reddit", "bluesky"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-2.5 py-1 rounded-xs uppercase text-[11px] font-semibold transition-colors ${
                      selectedFilter === filter
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-600 border border-[#ede8df] hover:border-stone-400"
                    }`}
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>

            <div className="flex items-center gap-4 text-stone-500 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-stone-900">
                  {totalDispatchedCount.toLocaleString()}
                </span>{" "}
                dispatched today
              </span>
              <span className="text-stone-300">/</span>
              <span>Avg Latency: 92ms</span>
            </div>
          </div>

          {/* Animated Notification Stream Feed */}
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredNotifications.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="group relative border border-[#ede8df] bg-white p-4 sm:p-5 rounded-xs transition-all hover:border-[#dfc39a] hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Platform Icon Badge + Details */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`h-9 w-9 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs`}
                      >
                        {item.iconText}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="font-bold text-stone-900">{item.actionText}</span>
                          <span className="text-stone-300">·</span>
                          <span className="text-stone-400 text-[11px]">{item.timeAgo}</span>
                        </div>

                        <p className="font-sans text-xs sm:text-sm text-stone-700 font-normal leading-relaxed max-w-3xl">
                          &ldquo;{item.postTitle}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Right: Telemetry Chips */}
                    <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>200 OK</span>
                      </span>
                      <span className="text-stone-400 text-[10px]">Socket {item.latency}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Stream Guarantee Tag */}
          <div className="mt-6 pt-4 border-t border-dashed border-[#ede8df] flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 font-mono text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Outbound Write-Only Dispatch Architecture · Zero Feed Scraping</span>
            </div>
            <div className="text-[11px] text-stone-400">
              Payloads sent via official developer REST &amp; Webhook APIs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
