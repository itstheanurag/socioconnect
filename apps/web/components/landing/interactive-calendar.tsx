"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  Film,
  Play,
  Share2,
  ArrowRight,
} from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface DayPlan {
  dayId: string;
  dayName: string;
  dayNum: string;
  isToday?: boolean;
  scheduledCount: number;
  featuredDrop: {
    title: string;
    formatType: string;
    mediaCategory: "video" | "reel" | "thread" | "story";
    contentSnippet: string;
    platforms: string[];
    peakSchedule: {
      platform: string;
      platformName: string;
      time: string;
      windowLabel: string;
      reason: string;
    }[];
  };
}

const WEEK_PLAN: DayPlan[] = [
  {
    dayId: "mon",
    dayName: "monday",
    dayNum: "15",
    isToday: true,
    scheduledCount: 4,
    featuredDrop: {
      title: "Episode 1 Premiere & System Breakdown",
      formatType: "4K Video & Multi-Channel Launch",
      mediaCategory: "video",
      contentSnippet:
        "Our complete behind-the-scenes walkthrough is live! Deep dive into creative workflows, queue workers, and creator sustainability.",
      platforms: ["youtube", "linkedin", "instagram", "tiktok"],
      peakSchedule: [
        {
          platform: "linkedin",
          platformName: "LinkedIn",
          time: "08:30 AM",
          windowLabel: "Morning Commute",
          reason: "Founders & creators checking feed before work",
        },
        {
          platform: "instagram",
          platformName: "Instagram",
          time: "12:30 PM",
          windowLabel: "Lunch Peak",
          reason: "Highest reel engagement window",
        },
        {
          platform: "youtube",
          platformName: "YouTube",
          time: "04:00 PM",
          windowLabel: "Evening Watch Window",
          reason: "Subscribers active on desktop & smart TVs",
        },
        {
          platform: "tiktok",
          platformName: "TikTok",
          time: "06:30 PM",
          windowLabel: "Prime Relax Hours",
          reason: "Short-form video browsing peak",
        },
      ],
    },
  },
  {
    dayId: "tue",
    dayName: "tuesday",
    dayNum: "16",
    scheduledCount: 3,
    featuredDrop: {
      title: "Live Stream Hangout & Project Q&A",
      formatType: "Interactive Stream & Teasers",
      mediaCategory: "story",
      contentSnippet:
        "🔴 Going live on Twitch & YouTube! Reviewing community projects, answering audience questions, and coding new features live.",
      platforms: ["twitch", "youtube", "x"],
      peakSchedule: [
        {
          platform: "x",
          platformName: "X (Twitter)",
          time: "01:30 PM",
          windowLabel: "Midday Conversation",
          reason: "Quick stream teaser with chat link",
        },
        {
          platform: "twitch",
          platformName: "Twitch",
          time: "06:30 PM",
          windowLabel: "Prime Stream Hours",
          reason: "Live viewers waiting in channel room",
        },
        {
          platform: "youtube",
          platformName: "YouTube",
          time: "06:30 PM",
          windowLabel: "Simulcast Live",
          reason: "Subscribers receive stream notification",
        },
      ],
    },
  },
  {
    dayId: "wed",
    dayName: "wednesday",
    dayNum: "17",
    scheduledCount: 2,
    featuredDrop: {
      title: "3 Lighting Setups for Solo Creators",
      formatType: "Visual Carousel & Reel",
      mediaCategory: "reel",
      contentSnippet:
        "You do not need a $5,000 studio. Here are 3 budget light placements that will make your talking-head videos look cinematic.",
      platforms: ["instagram", "tiktok"],
      peakSchedule: [
        {
          platform: "instagram",
          platformName: "Instagram",
          time: "12:30 PM",
          windowLabel: "Lunch Peak",
          reason: "Reel caption + visual carousel drop",
        },
        {
          platform: "tiktok",
          platformName: "TikTok",
          time: "07:00 PM",
          windowLabel: "Evening Trend Window",
          reason: "High audio-discovery traffic",
        },
      ],
    },
  },
  {
    dayId: "thu",
    dayName: "thursday",
    dayNum: "18",
    scheduledCount: 4,
    featuredDrop: {
      title: "Creator Studio Architecture Showcase",
      formatType: "4-Part Deep Dive Thread",
      mediaCategory: "thread",
      contentSnippet:
        "Why manual cross-posting is burning your creative energy and how automated queue workers eliminate copy-pasting forever 🧵👇",
      platforms: ["x", "linkedin", "threads", "peerlist"],
      peakSchedule: [
        {
          platform: "peerlist",
          platformName: "Peerlist",
          time: "10:00 AM",
          windowLabel: "Tech Maker Morning",
          reason: "Product showcase & architecture note",
        },
        {
          platform: "x",
          platformName: "X (Twitter)",
          time: "01:30 PM",
          windowLabel: "Viral Thread Window",
          reason: "Highest repost & discussion activity",
        },
        {
          platform: "threads",
          platformName: "Threads",
          time: "03:00 PM",
          windowLabel: "Afternoon Casual",
          reason: "Open discussion with creator circle",
        },
      ],
    },
  },
  {
    dayId: "fri",
    dayName: "friday",
    dayNum: "19",
    scheduledCount: 3,
    featuredDrop: {
      title: "Weekly Creator Recap & Milestones",
      formatType: "Community Highlight Story",
      mediaCategory: "story",
      contentSnippet:
        "Wrapping up an incredible week! Celebrating top community submissions and creative breakthroughs across all our channels.",
      platforms: ["youtube", "instagram", "bluesky"],
      peakSchedule: [
        {
          platform: "youtube",
          platformName: "YouTube",
          time: "03:30 PM",
          windowLabel: "Community Post",
          reason: "Weekend preview & member shoutouts",
        },
        {
          platform: "instagram",
          platformName: "Instagram",
          time: "06:00 PM",
          windowLabel: "Weekend Story Drop",
          reason: "Audience winding down for the weekend",
        },
      ],
    },
  },
  {
    dayId: "sat",
    dayName: "saturday",
    dayNum: "20",
    scheduledCount: 2,
    featuredDrop: {
      title: "Weekend Motivation: Batch Your Content",
      formatType: "Inspiration Card & Quote",
      mediaCategory: "reel",
      contentSnippet:
        "Weekend rule: Spend 3 calm hours creating your weekly content, and let your automated scheduler handle the release timing.",
      platforms: ["x", "instagram"],
      peakSchedule: [
        {
          platform: "x",
          platformName: "X (Twitter)",
          time: "11:00 AM",
          windowLabel: "Brunch Scroll",
          reason: "Weekend inspiration & high bookmark rate",
        },
        {
          platform: "instagram",
          platformName: "Instagram",
          time: "01:00 PM",
          windowLabel: "Afternoon Relax",
          reason: "Story engagement peak",
        },
      ],
    },
  },
  {
    dayId: "sun",
    dayName: "sunday",
    dayNum: "21",
    scheduledCount: 1,
    featuredDrop: {
      title: "Next Week Production Preview",
      formatType: "Behind-the-Scenes Teaser",
      mediaCategory: "story",
      contentSnippet:
        "Sneak peek at what is rendering for Monday! Scripting a new guide on building fullstack micro-apps in record time.",
      platforms: ["youtube", "threads"],
      peakSchedule: [
        {
          platform: "youtube",
          platformName: "YouTube",
          time: "05:00 PM",
          windowLabel: "Sunday Evening Queue",
          reason: "Subscribers preparing watchlists for the week",
        },
      ],
    },
  },
];

export function InteractiveCalendar() {
  const [selectedDayId, setSelectedDayId] = useState<string>("mon");
  const [timingMode, setTimingMode] = useState<"peak" | "simultaneous">("peak");

  const currentDay = WEEK_PLAN.find((d) => d.dayId === selectedDayId) || WEEK_PLAN[0];

  return (
    <section
      id="calendar"
      className="relative py-14 lg:py-20 border-t border-[#ede8df] bg-[#faf8f5] overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact, Creator-Centric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lowercase">
          <div>
            <div className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2.5">
              <Sparkles className="h-3 w-3 text-stone-800" />
              <span>smart audience calendar</span>
              <span className="text-stone-400">&middot;</span>
              <span className="text-stone-600 font-normal">visual weekly planner</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
              plan your week visually.{" "}
              <span className="font-serif italic font-normal text-stone-800">
                drop at peak viewer hours.
              </span>
            </h2>
          </div>

          {/* Strategy Switcher Toggle */}
          <div className="inline-flex border border-[#dfc39a] bg-white p-1 rounded-md shadow-2xs font-mono text-xs">
            <button
              type="button"
              onClick={() => setTimingMode("peak")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                timingMode === "peak"
                  ? "bg-[#F4DCB4] font-bold text-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-stone-800" />
              <span>audience peak times</span>
            </button>
            <button
              type="button"
              onClick={() => setTimingMode("simultaneous")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                timingMode === "simultaneous"
                  ? "bg-[#F4DCB4] font-bold text-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-stone-800" />
              <span>simultaneous drop</span>
            </button>
          </div>
        </div>

        {/* 7-Day Timeline Selector Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6 font-mono text-xs lowercase">
          {WEEK_PLAN.map((day) => {
            const isSelected = selectedDayId === day.dayId;
            return (
              <button
                key={day.dayId}
                type="button"
                onClick={() => setSelectedDayId(day.dayId)}
                className={`p-2.5 sm:p-3 rounded-md border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                  isSelected
                    ? "border-stone-900 bg-white font-bold text-stone-900 shadow-xs ring-1 ring-stone-900/10"
                    : "border-[#ede8df] bg-white/70 text-stone-600 hover:bg-white hover:border-[#dfc39a]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold">{day.dayName.slice(0, 3)}</span>
                  {day.isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
                  )}
                </div>

                <div className="font-bold text-sm sm:text-base text-stone-900">{day.dayNum}</div>

                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <span>{day.scheduledCount} posts</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Content & Peak Timing Card */}
        <div className="border border-[#ede8df] bg-white p-5 sm:p-7 rounded-md shadow-xs lowercase">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDay.dayId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Day Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dashed border-[#ede8df] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#faf8f5] border border-[#ede8df] text-stone-800">
                    <Calendar className="h-4 w-4 text-[#dfc39a]" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-stone-900 font-sans">
                      {currentDay.dayName}, sep {currentDay.dayNum} &middot; scheduled content
                    </div>
                    <div className="font-mono text-xs text-stone-400">
                      {currentDay.featuredDrop.formatType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-[#faf8f5] border border-[#ede8df] px-2.5 py-1 rounded-sm text-stone-700 font-semibold">
                    {timingMode === "peak" ? "⚡ AI Peak Staggered" : "🚀 Instant Batch"}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-sm font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>ready to drop</span>
                  </span>
                </div>
              </div>

              {/* Creator Post Preview Box */}
              <div className="bg-[#faf8f5] border border-[#ede8df] p-4 sm:p-5 rounded-md space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-stone-500">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    {currentDay.featuredDrop.mediaCategory === "video" && (
                      <Film className="h-3.5 w-3.5" />
                    )}
                    {currentDay.featuredDrop.mediaCategory === "reel" && (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {currentDay.featuredDrop.title}
                  </span>
                  <span className="text-emerald-700 font-semibold hidden sm:inline">
                    {currentDay.featuredDrop.platforms.length} channels synchronized
                  </span>
                </div>

                <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-snug">
                  &ldquo;{currentDay.featuredDrop.contentSnippet}&rdquo;
                </p>
              </div>

              {/* Staggered Peak Timings Grid vs Simultaneous Banner */}
              {timingMode === "peak" ? (
                <div>
                  <div className="font-mono text-xs font-bold text-stone-800 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#dfc39a]" />
                      <span>staggered audience release windows:</span>
                    </span>
                    <span className="text-stone-400 font-normal text-[11px]">
                      tailored per platform timezone
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    {currentDay.featuredDrop.peakSchedule.map((slot) => (
                      <div
                        key={slot.platform}
                        className="border border-[#ede8df] bg-white p-3.5 rounded-md shadow-2xs space-y-2 hover:border-[#dfc39a] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-[#faf8f5] border border-[#ede8df]">
                              <PlatformIcon platform={slot.platform} size={13} />
                            </div>
                            <span className="font-bold text-stone-900">{slot.platformName}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-bold">
                            peak
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-stone-900 font-bold text-sm">
                          <Clock className="h-3 w-3 text-[#dfc39a]" />
                          <span>{slot.time}</span>
                        </div>

                        <p className="text-[11px] text-stone-500 font-sans leading-tight">
                          {slot.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#faf8f5] border border-[#ede8df] p-4 rounded-md font-mono text-xs text-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#dfc39a]" />
                    <span>
                      Simultaneous batch drop scheduled at <strong>02:00 PM EST</strong> across all{" "}
                      {currentDay.featuredDrop.platforms.length} connected channels.
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold">● verified</span>
                </div>
              )}

              {/* Bottom Card Summary */}
              <div className="pt-3 border-t border-dashed border-[#ede8df] flex flex-wrap items-center justify-between font-mono text-[11px] text-stone-500 gap-2">
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-stone-700" />
                  <span>automatically scheduled based on audience engagement data</span>
                </span>
                <span className="text-stone-800 font-semibold flex items-center gap-1">
                  <span>switch day above to explore</span>
                  <ArrowRight className="h-3 w-3 text-stone-400" />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
