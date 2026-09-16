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
  statusText: string;
}

const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: "notif-yt-1",
    platform: "youtube",
    platformName: "youtube",
    actionText: "scheduled premiere & community post",
    postTitle: "new architecture deep dive is premiering this thursday at 10 am pst!",
    timeAgo: "2s ago",
    statusText: "scheduled",
  },
  {
    id: "notif-tw-1",
    platform: "twitch",
    platformName: "twitch",
    actionText: "sent go-live stream alert",
    postTitle: "🔴 live now: building a distributed queuing engine in rust & typescript!",
    timeAgo: "5s ago",
    statusText: "live now",
  },
  {
    id: "notif-ig-1",
    platform: "instagram",
    platformName: "instagram",
    actionText: "published reel & caption",
    postTitle: "5 production architecture lessons we learned while scaling to 1m requests 💡",
    timeAgo: "9s ago",
    statusText: "published",
  },
  {
    id: "notif-1",
    platform: "peerlist",
    platformName: "peerlist",
    actionText: "shared to maker community",
    postTitle: "introducing our atomic multi-network publishing queue for creators 🚀",
    timeAgo: "14s ago",
    statusText: "published",
  },
  {
    id: "notif-2",
    platform: "x",
    platformName: "x (twitter)",
    actionText: "published thread (1/4)",
    postTitle: "why we killed manual copy-pasting across 8 tabs: an engineering breakdown...",
    timeAgo: "21s ago",
    statusText: "published",
  },
  {
    id: "notif-3",
    platform: "linkedin",
    platformName: "linkedin",
    actionText: "published story post",
    postTitle:
      "how solo creators scale brand reach without burning 10 hours a week on social media.",
    timeAgo: "28s ago",
    statusText: "published",
  },
  {
    id: "notif-4",
    platform: "reddit",
    platformName: "reddit",
    actionText: "posted in r/sideproject",
    postTitle: "we built an open-source calm multi-channel distribution studio.",
    timeAgo: "35s ago",
    statusText: "published",
  },
  {
    id: "notif-5",
    platform: "bluesky",
    platformName: "bluesky",
    actionText: "published open post",
    postTitle: "federated cross-posting is now live with zero password storage 🌐",
    timeAgo: "42s ago",
    statusText: "published",
  },
];

const POOL_OF_UPDATES = [
  {
    platform: "youtube" as const,
    platformName: "youtube",
    actionText: "scheduled video premiere",
    postTitle: "episode 14 is rendering: behind the scenes building socioconnect.",
    statusText: "scheduled",
  },
  {
    platform: "twitch" as const,
    platformName: "twitch",
    actionText: "stream alert sent",
    postTitle: "twitch stream live in 10 mins: live code review with community!",
    statusText: "live now",
  },
  {
    platform: "instagram" as const,
    platformName: "instagram",
    actionText: "reel caption published",
    postTitle: "check out the new design system dark mode preview on our reel! ✨",
    statusText: "published",
  },
  {
    platform: "peerlist" as const,
    platformName: "peerlist",
    actionText: "maker update published",
    postTitle: "shipped v1.2 with automated character meter validations across 8 platforms.",
    statusText: "published",
  },
  {
    platform: "x" as const,
    platformName: "x (twitter)",
    actionText: "new post published",
    postTitle: "single-point-of-failure distribution is officially obsolete.",
    statusText: "published",
  },
  {
    platform: "linkedin" as const,
    platformName: "linkedin",
    actionText: "founder article posted",
    postTitle: "why asynchronous worker queues make social distribution uncrashable.",
    statusText: "published",
  },
  {
    platform: "reddit" as const,
    platformName: "reddit",
    actionText: "community discussion started",
    postTitle: "show r/webdev: how we built decoupled retry backoff into oauth webhooks.",
    statusText: "published",
  },
  {
    platform: "bluesky" as const,
    platformName: "bluesky",
    actionText: "open feed post published",
    postTitle: "open protocols are winning the distribution wars. build open.",
    statusText: "published",
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

      const newNotif: LiveNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        platform: randomUpdate.platform,
        platformName: randomUpdate.platformName,
        actionText: randomUpdate.actionText,
        postTitle: randomUpdate.postTitle,
        timeAgo: "just now",
        statusText: randomUpdate.statusText,
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
    { id: "all", name: "all channels" },
    { id: "youtube", name: "youtube" },
    { id: "twitch", name: "twitch" },
    { id: "instagram", name: "instagram" },
    { id: "x", name: "x" },
    { id: "linkedin", name: "linkedin" },
    { id: "peerlist", name: "peerlist" },
    { id: "reddit", name: "reddit" },
    { id: "bluesky", name: "bluesky" },
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
      statusText: randomUpdate.statusText,
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lowercase">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>real-time publishing stream</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              watch your posts go live in real-time.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              publish your video drops, live stream alerts, carousel captions, and threads
              effortlessly across every audience — without ever juggling multiple browser windows.
            </p>
          </div>

          {/* Stream Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 border border-[#ede8df] bg-[#faf8f5] px-3.5 py-1.5 text-stone-700 hover:text-stone-900 hover:border-stone-400 transition-colors rounded-md shadow-2xs cursor-pointer"
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                  <span>resume stream</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 text-stone-500" />
                  <span>pause stream</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={triggerManualSimulate}
              className="inline-flex items-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] px-3.5 py-1.5 font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-md shadow-2xs cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>test simulated post</span>
            </button>
          </div>
        </div>

        {/* Channel Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none font-mono text-xs lowercase">
          <span className="text-stone-400 text-[10px] mr-1 shrink-0">filter:</span>
          {PLATFORMS_FILTER.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1 border transition-all rounded-md shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeFilter === filter.id
                  ? "border-stone-900 bg-stone-900 text-white font-bold shadow-2xs"
                  : "border-[#ede8df] bg-[#faf8f5] text-stone-600 hover:border-stone-400"
              }`}
            >
              {filter.id !== "all" && <PlatformIcon platform={filter.id} size={12} />}
              <span>{filter.name}</span>
            </button>
          ))}
        </div>

        {/* Live Notification Cards Stream Container */}
        <div className="relative border border-[#ede8df] bg-[#faf8f5] p-4 sm:p-6 rounded-md shadow-xs min-h-[460px] overflow-hidden lowercase">
          {/* Top Bar inside Stream Terminal */}
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3 mb-4 font-mono text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-800">live posting activity</span>
              <span className="text-stone-400 hidden sm:inline">
                · {filteredNotifications.length} posts active
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% private · no reading your private dms</span>
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
                  className="group relative border border-[#ede8df] bg-white p-3.5 sm:p-4 rounded-md shadow-2xs hover:border-[#dfc39a] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Platform Logo & Action Title */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#ede8df] bg-[#faf8f5] shrink-0 shadow-2xs">
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

                    {/* Right: Status & Timestamp */}
                    <div className="flex flex-col items-end shrink-0 font-mono text-[11px] text-stone-400">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{item.statusText}</span>
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
