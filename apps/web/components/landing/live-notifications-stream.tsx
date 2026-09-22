"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  Heart,
  MessageCircle,
  Play,
  Film,
  Zap,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface CreatorDrop {
  id: string;
  creatorName: string;
  creatorHandle: string;
  avatar: string;
  platform: "youtube" | "instagram" | "tiktok" | "linkedin" | "x" | "threads";
  platformName: string;
  formatType: string;
  contentType: "video" | "reel" | "thread" | "story" | "short";
  title: string;
  timeSlot: string;
  status: "live" | "scheduled" | "delivering";
  stats: {
    views?: string;
    likes?: string;
    comments?: string;
    shares?: string;
  };
  accentBg: string;
}

const CREATOR_DROPS: CreatorDrop[] = [
  {
    id: "drop-yt-1",
    creatorName: "Maya Rao",
    creatorHandle: "@maya.builds",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    platform: "youtube",
    platformName: "YouTube",
    formatType: "4K Episode Premiere",
    contentType: "video",
    title: "Behind the Studio: How I write once & reach 500k subscribers",
    timeSlot: "04:00 PM (peak audience)",
    status: "live",
    stats: { views: "4.8k", likes: "612", comments: "94" },
    accentBg: "from-red-50 to-white",
  },
  {
    id: "drop-ig-1",
    creatorName: "Leo Vance",
    creatorHandle: "@leovance_art",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    platform: "instagram",
    platformName: "Instagram",
    formatType: "Reel + Sound Tag",
    contentType: "reel",
    title: "3 lighting setups every solo video creator needs to try ✨",
    timeSlot: "12:30 PM (lunch peak)",
    status: "live",
    stats: { views: "12.4k", likes: "1.8k", comments: "142" },
    accentBg: "from-pink-50 to-white",
  },
  {
    id: "drop-x-1",
    creatorName: "Sarah Chen",
    creatorHandle: "@sarahchen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    platform: "x",
    platformName: "X (Twitter)",
    formatType: "4-Part Insight Thread",
    contentType: "thread",
    title: "The creator operating system: how to post daily without burning out 🧵👇",
    timeSlot: "01:30 PM (midday thread)",
    status: "live",
    stats: { views: "28.5k", likes: "840", shares: "210" },
    accentBg: "from-stone-100 to-white",
  },
  {
    id: "drop-li-1",
    creatorName: "Alex Rivers",
    creatorHandle: "Alex Rivers",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    platform: "linkedin",
    platformName: "LinkedIn",
    formatType: "Creator Takeaway Story",
    contentType: "story",
    title: "Why we stopped cross-posting manually and freed up 12 hours every week.",
    timeSlot: "08:30 AM (commute read)",
    status: "live",
    stats: { views: "9.2k", likes: "482", comments: "67" },
    accentBg: "from-blue-50 to-white",
  },
  {
    id: "drop-tt-1",
    creatorName: "Jordan Blake",
    creatorHandle: "@jordan_creates",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    platform: "tiktok",
    platformName: "TikTok",
    formatType: "High-Paced Short",
    contentType: "short",
    title: "Stop copy-pasting your content across 6 apps in 2026 🤯",
    timeSlot: "06:30 PM (evening peak)",
    status: "live",
    stats: { views: "34.1k", likes: "4.2k", comments: "318" },
    accentBg: "from-emerald-50 to-white",
  },
  {
    id: "drop-th-1",
    creatorName: "Elena Scott",
    creatorHandle: "@elena.scott",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    platform: "threads",
    platformName: "Threads",
    formatType: "Micro Discussion",
    contentType: "story",
    title: "Quick question for creators: what is your biggest time sink in publishing?",
    timeSlot: "03:00 PM (afternoon chat)",
    status: "live",
    stats: { views: "3.1k", likes: "194", comments: "58" },
    accentBg: "from-stone-100 to-white",
  },
];

export function LiveNotificationsStream() {
  const [activePlatform, setActivePlatform] = useState<string>("all");
  const [activeDropIndex, setActiveDropIndex] = useState(0);

  const filteredDrops =
    activePlatform === "all"
      ? CREATOR_DROPS
      : CREATOR_DROPS.filter((d) => d.platform === activePlatform);

  // Gentle auto-cycling of the featured drop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDropIndex((prev) => (prev + 1) % filteredDrops.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [filteredDrops.length]);

  const currentFeatured = filteredDrops[activeDropIndex] || filteredDrops[0];

  return (
    <section
      id="live-stream"
      className="relative py-14 lg:py-20 border-t border-line bg-cream-soft overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact, Creator-Focused Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lowercase">
          <div>
            <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2.5">
              <Sparkles className="h-3 w-3 text-stone-800" />
              <span>live creator dispatch radar</span>
              <span className="text-stone-400">&middot;</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                publishing now
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
              your content going live,{" "}
              <span className="font-serif italic font-normal text-stone-800">
                effortlessly everywhere.
              </span>
            </h2>
          </div>

          {/* Quick Platform Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
            {[
              { id: "all", label: "all drops" },
              { id: "youtube", label: "youtube" },
              { id: "instagram", label: "instagram" },
              { id: "tiktok", label: "tiktok" },
              { id: "linkedin", label: "linkedin" },
              { id: "x", label: "x" },
              { id: "threads", label: "threads" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActivePlatform(tab.id);
                  setActiveDropIndex(0);
                }}
                className={`px-3 py-1 rounded-md border transition-all cursor-pointer text-[11px] shrink-0 ${
                  activePlatform === tab.id
                    ? "border-stone-900 bg-white font-bold text-stone-900 shadow-2xs"
                    : "border-[#ede8df] bg-white/60 text-stone-500 hover:border-stone-400 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Two-Pane Creator Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lowercase">
          {/* Left: Featured Active Drop Spotlight */}
          <div className="lg:col-span-6 border border-[#ede8df] bg-white p-5 sm:p-6 rounded-md shadow-xs flex flex-col justify-between relative overflow-hidden">
            {/* Soft Warm Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeatured.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Creator Profile & Platform Strip */}
                <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentFeatured.avatar}
                      alt={currentFeatured.creatorName}
                      className="h-10 w-10 rounded-full object-cover border border-[#ede8df] shadow-2xs"
                    />
                    <div>
                      <div className="font-bold text-sm text-stone-900 font-sans">
                        {currentFeatured.creatorName}
                      </div>
                      <div className="font-mono text-xs text-stone-400">
                        {currentFeatured.creatorHandle}
                      </div>
                    </div>
                  </div>

                  {/* Platform & Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#faf8f5] border border-[#ede8df]">
                      <PlatformIcon platform={currentFeatured.platform} size={15} />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>published</span>
                    </span>
                  </div>
                </div>

                {/* Post Preview Headline */}
                <div className="space-y-2 bg-[#faf8f5] p-4 rounded-md border border-[#ede8df]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      {currentFeatured.contentType === "video" && <Film className="h-3.5 w-3.5" />}
                      {currentFeatured.contentType === "reel" && <Play className="h-3.5 w-3.5" />}
                      {currentFeatured.formatType}
                    </span>
                    <span className="flex items-center gap-1 text-[#b58b4c] font-semibold">
                      <Clock className="h-3 w-3" />
                      {currentFeatured.timeSlot}
                    </span>
                  </div>

                  <p className="font-serif italic text-base sm:text-lg text-stone-900 leading-snug">
                    &ldquo;{currentFeatured.title}&rdquo;
                  </p>
                </div>

                {/* Real-time Engagement Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                  <div className="bg-white border border-[#ede8df] p-2.5 rounded-md flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-stone-400" />
                    <div>
                      <span className="text-[10px] text-stone-400 block">impressions</span>
                      <span className="font-bold text-stone-800">
                        {currentFeatured.stats.views || "1.2k"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white border border-[#ede8df] p-2.5 rounded-md flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <div>
                      <span className="text-[10px] text-stone-400 block">applauds</span>
                      <span className="font-bold text-stone-800">
                        {currentFeatured.stats.likes || "240"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white border border-[#ede8df] p-2.5 rounded-md flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-sky-500" />
                    <div>
                      <span className="text-[10px] text-stone-400 block">replies</span>
                      <span className="font-bold text-stone-800">
                        {currentFeatured.stats.comments || "32"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Insight */}
            <div className="mt-5 pt-3 border-t border-dashed border-[#ede8df] flex items-center justify-between font-mono text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-stone-700" />
                <span>zero manual copying &middot; 100% on-time peak delivery</span>
              </span>
              <span className="text-emerald-700 font-semibold">&bull; active</span>
            </div>
          </div>

          {/* Right: Quick Multi-Platform Drop Stream List */}
          <div className="lg:col-span-6 space-y-2 flex flex-col justify-between">
            {filteredDrops.slice(0, 4).map((drop, idx) => {
              const isSelected = currentFeatured.id === drop.id;
              return (
                <button
                  key={drop.id}
                  type="button"
                  onClick={() => setActiveDropIndex(idx)}
                  className={`w-full text-left p-3 sm:p-3.5 border rounded-md transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "border-stone-900 bg-white shadow-xs"
                      : "border-[#ede8df] bg-white/70 hover:bg-white hover:border-secondary-border"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#faf8f5] border border-[#ede8df] shrink-0">
                      <PlatformIcon platform={drop.platform} size={15} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {drop.platformName}
                        </span>
                        <span className="text-stone-300">&middot;</span>
                        <span className="font-mono text-[11px] text-stone-500 truncate">
                          {drop.formatType}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-stone-700 truncate font-medium mt-0.5">
                        {drop.title}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs block">
                      live
                    </span>
                    <span className="text-[9px] text-stone-400 block mt-1">
                      {drop.timeSlot.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quick Guarantees Pill Bar */}
            <div className="p-2.5 rounded-md border border-dashed border-secondary-border bg-secondary/20 flex items-center justify-between font-mono text-[11px] text-stone-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-stone-900" />
                <span>each channel executes independently</span>
              </span>
              <span className="text-stone-500">6 connected destinations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
