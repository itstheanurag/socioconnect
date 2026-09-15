"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, Pause, Play, Zap } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface LiveNotification {
  id: string;
  platform:
    | "youtube"
    | "twitch"
    | "instagram"
    | "x"
    | "linkedin"
    | "peerlist"
    | "reddit"
    | "bluesky";
  platformName: string;
  actionText: string;
  postTitle: string;
  timeAgo: string;
  latency: string;
  status: "success" | "queued";
}

const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: "notif-yt-1",
    platform: "youtube",
    platformName: "YouTube",
    actionText: "Scheduled YouTube Premiere & Community Drop",
    postTitle: "New Architecture Deep Dive is premiering this Thursday at 10 AM PST!",
    timeAgo: "2s ago",
    latency: "94ms",
    status: "success",
  },
  {
    id: "notif-tw-1",
    platform: "twitch",
    platformName: "Twitch",
    actionText: "Dispatched Go-Live Stream Notification",
    postTitle: "🔴 Live now: Building a distributed queuing engine in Rust & TypeScript!",
    timeAgo: "5s ago",
    latency: "82ms",
    status: "success",
  },
  {
    id: "notif-ig-1",
    platform: "instagram",
    platformName: "Instagram",
    actionText: "Published Reel & Caption to Instagram",
    postTitle: "5 production architecture lessons we learned while scaling to 1M requests 💡",
    timeAgo: "9s ago",
    latency: "115ms",
    status: "success",
  },
  {
    id: "notif-1",
    platform: "peerlist",
    platformName: "Peerlist",
    actionText: "Posted to Peerlist Maker Feed",
    postTitle: "Introducing our atomic multi-network publishing queue for creators 🚀",
    timeAgo: "14s ago",
    latency: "84ms",
    status: "success",
  },
  {
    id: "notif-2",
    platform: "x",
    platformName: "X (Twitter)",
    actionText: "Thread (1/4) Dispatched to X",
    postTitle: "Why we killed manual copy-pasting across 8 tabs: an engineering breakdown...",
    timeAgo: "21s ago",
    latency: "112ms",
    status: "success",
  },
  {
    id: "notif-3",
    platform: "linkedin",
    platformName: "LinkedIn",
    actionText: "Published to LinkedIn Professional",
    postTitle:
      "How solo creators scale brand reach without burning 10 hours a week on social media.",
    timeAgo: "28s ago",
    latency: "96ms",
    status: "success",
  },
  {
    id: "notif-4",
    platform: "reddit",
    platformName: "Reddit",
    actionText: "Submitted to r/SideProject",
    postTitle: "We built an open-source calm multi-channel distribution studio.",
    timeAgo: "35s ago",
    latency: "148ms",
    status: "success",
  },
  {
    id: "notif-5",
    platform: "bluesky",
    platformName: "Bluesky",
    actionText: "Posted to Bluesky AT Protocol",
    postTitle: "Federated cross-posting is now live with zero password storage 🌐",
    timeAgo: "42s ago",
    latency: "76ms",
    status: "success",
  },
];

const POOL_OF_UPDATES = [
  {
    platform: "youtube" as const,
    platformName: "YouTube",
    actionText: "Scheduled YouTube Premiere",
    postTitle: "Episode 14 is rendering: Behind the scenes building SocioConnect.",
  },
  {
    platform: "twitch" as const,
    platformName: "Twitch",
    actionText: "Stream Alert Dispatched",
    postTitle: "Twitch stream live in 10 mins: Live code review with community!",
  },
  {
    platform: "instagram" as const,
    platformName: "Instagram",
    actionText: "Instagram Reel Caption Live",
    postTitle: "Check out the new design system dark mode preview on our reel! ✨",
  },
  {
    platform: "peerlist" as const,
    platformName: "Peerlist",
    actionText: "Maker Update Dispatched",
    postTitle: "Shipped v1.2 with automated character meter validations across 8 platforms.",
  },
  {
    platform: "x" as const,
    platformName: "X (Twitter)",
    actionText: "New Post Published",
    postTitle: "Single-point-of-failure distribution is officially obsolete.",
  },
  {
    platform: "linkedin" as const,
    platformName: "LinkedIn",
    actionText: "Founder Article Posted",
    postTitle: "Why asynchronous worker queues make social distribution uncrashable.",
  },
  {
    platform: "reddit" as const,
    platformName: "Reddit",
    actionText: "Community Discussion Started",
    postTitle: "Show r/webdev: How we built decoupled retry backoff into OAuth webhooks.",
  },
  {
    platform: "bluesky" as const,
    platformName: "Bluesky",
    actionText: "Signed Skeet Emitted",
    postTitle: "Open protocols are winning the distribution wars. Build open.",
  },
];

export function LiveNotificationsStream() {
  const [notifications, setNotifications] = useState<LiveNotification[]>(INITIAL_NOTIFICATIONS);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Automatically inject a simulated new notification every few seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const randomUpdate = POOL_OF_UPDATES[Math.floor(Math.random() * POOL_OF_UPDATES.length)];
      const randomLatency = `${Math.floor(Math.random() * 60) + 65}ms`;

      const newNotif: LiveNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        platform: randomUpdate.platform,
        platformName: randomUpdate.platformName,
        actionText: randomUpdate.actionText,
        postTitle: randomUpdate.postTitle,
        timeAgo: "just now",
        latency: randomLatency,
        status: "success",
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 11)]);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.platform === activeFilter);

  const PLATFORMS_FILTER = [
    { id: "all", name: "All Channels" },
    { id: "youtube", name: "YouTube" },
    { id: "twitch", name: "Twitch" },
    { id: "instagram", name: "Instagram" },
    { id: "x", name: "X" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "peerlist", name: "Peerlist" },
    { id: "reddit", name: "Reddit" },
    { id: "bluesky", name: "Bluesky" },
  ];

  function triggerManualSimulate() {
    const randomUpdate = POOL_OF_UPDATES[Math.floor(Math.random() * POOL_OF_UPDATES.length)];
    const newNotif: LiveNotification = {
      id: `notif-manual-${Date.now()}`,
      platform: randomUpdate.platform,
      platformName: randomUpdate.platformName,
      actionText: randomUpdate.actionText,
      postTitle: randomUpdate.postTitle,
      timeAgo: "just now",
      latency: "72ms",
      status: "success",
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 11)]);
  }

  return (
    <section
      id="live-stream"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REAL-TIME OUTBOUND STREAM
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Zero feed reading. Instant API delivery.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              SocioConnect never reads your personal feed or scrapes follower timelines. We only
              execute outbound developer API dispatches with atomic retry backoff.
            </p>
          </div>

          {/* Stream Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 border border-[#ede8df] bg-[#faf8f5] px-3 py-2 text-stone-700 hover:text-stone-900 hover:border-stone-400 transition-colors rounded-xs shadow-2xs"
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                  <span>RESUME STREAM</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 text-stone-500" />
                  <span>PAUSE STREAM</span>
                </>
              )}
            </button>

            <button
              onClick={triggerManualSimulate}
              className="inline-flex items-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] px-3 py-2 font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-xs shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>SIMULATE BROADCAST</span>
            </button>
          </div>
        </div>

        {/* Channel Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none font-mono text-xs">
          <span className="text-stone-400 uppercase text-[10px] mr-1 shrink-0">FILTER:</span>
          {PLATFORMS_FILTER.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1 border transition-all rounded-xs shrink-0 flex items-center gap-1.5 ${
                activeFilter === filter.id
                  ? "border-stone-900 bg-stone-900 text-white font-bold"
                  : "border-[#ede8df] bg-[#faf8f5] text-stone-600 hover:border-stone-400"
              }`}
            >
              {filter.id !== "all" && <PlatformIcon platform={filter.id} size={12} />}
              <span>{filter.name}</span>
            </button>
          ))}
        </div>

        {/* Live Notification Cards Stream Container */}
        <div className="relative border border-[#ede8df] bg-[#faf8f5] p-4 sm:p-6 rounded-xs shadow-xs min-h-[460px] overflow-hidden">
          {/* Top Bar inside Stream Terminal */}
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3 mb-4 font-mono text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-800 uppercase">ACTIVE BROADCAST TELEMETRY</span>
              <span className="text-stone-400 hidden sm:inline">
                · {filteredNotifications.length} Events Logged
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero Feed Reading · Outbound Write API Only</span>
            </div>
          </div>

          {/* The Animated Notification Stream */}
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="group relative border border-[#ede8df] bg-white p-3.5 sm:p-4 rounded-xs shadow-2xs hover:border-[#dfc39a] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Platform Logo & Action Title */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xs border border-[#ede8df] bg-[#faf8f5] shrink-0 shadow-2xs">
                        <PlatformIcon platform={item.platform} size={16} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {item.platformName}
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="font-mono text-[11px] text-stone-500">
                            {item.actionText}
                          </span>
                        </div>

                        <p className="mt-1 text-xs sm:text-sm text-stone-800 font-sans leading-snug line-clamp-1">
                          {item.postTitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Latency & Timestamp */}
                    <div className="flex flex-col items-end shrink-0 font-mono text-[11px] text-stone-400">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{item.latency}</span>
                      </div>
                      <span className="mt-1 text-[10px] text-stone-400">{item.timeAgo}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
