"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Globe, CheckCircle2, Plus, Clock } from "lucide-react";

interface StaggeredDrop {
  platform: string;
  icon: string;
  bg: string;
  color: string;
  targetTime: string;
  peakReason: string;
  status: "dispatched" | "scheduled" | "queued";
}

interface ScheduledSlot {
  id: string;
  day: string;
  dayIndex: number;
  time: string;
  title: string;
  content: string;
  scheduleMode: "simultaneous" | "staggered";
  staggeredDrops?: StaggeredDrop[];
  platforms: Array<{
    name: string;
    icon: string;
    bg: string;
    color: string;
  }>;
  status: "queued" | "dispatched" | "optimizing";
}

const SCHEDULED_ITEMS: ScheduledSlot[] = [
  {
    id: "slot-wed-1",
    day: "Wednesday",
    dayIndex: 2,
    time: "Staggered All-Day Release",
    title: "Launch Day: Real-Time Engine Deep Dive",
    content:
      "A complete walkthrough of our distributed queue engine. Formatted and scheduled individually for each platform's peak engagement window.",
    scheduleMode: "staggered",
    staggeredDrops: [
      {
        platform: "LinkedIn",
        icon: "in",
        bg: "bg-[#0a66c2]",
        color: "text-white",
        targetTime: "08:30 AM",
        peakReason: "Morning commute & founder coffee reading",
        status: "dispatched",
      },
      {
        platform: "X (Twitter)",
        icon: "𝕏",
        bg: "bg-stone-900",
        color: "text-white",
        targetTime: "12:15 PM",
        peakReason: "Mid-day tech feed & developer lunch breaks",
        status: "dispatched",
      },
      {
        platform: "YouTube",
        icon: "YT",
        bg: "bg-[#FF0000]",
        color: "text-white",
        targetTime: "03:00 PM",
        peakReason: "Afternoon video drop & notification surge",
        status: "scheduled",
      },
      {
        platform: "Twitch",
        icon: "TW",
        bg: "bg-[#9146FF]",
        color: "text-white",
        targetTime: "06:30 PM",
        peakReason: "Prime live stream hours & community chat",
        status: "scheduled",
      },
      {
        platform: "Reddit",
        icon: "rd",
        bg: "bg-[#ff4500]",
        color: "text-white",
        targetTime: "08:45 PM",
        peakReason: "Evening subreddit discovery & deep discussion",
        status: "queued",
      },
    ],
    platforms: [
      { name: "LinkedIn", icon: "in", bg: "bg-[#0a66c2]", color: "text-white" },
      { name: "X", icon: "𝕏", bg: "bg-stone-900", color: "text-white" },
      { name: "YouTube", icon: "YT", bg: "bg-[#FF0000]", color: "text-white" },
      { name: "Twitch", icon: "TW", bg: "bg-[#9146FF]", color: "text-white" },
      { name: "Reddit", icon: "rd", bg: "bg-[#ff4500]", color: "text-white" },
    ],
    status: "queued",
  },
  {
    id: "slot-mon-1",
    day: "Monday",
    dayIndex: 0,
    time: "09:30 AM (Simultaneous)",
    title: "Weekly Founder Synthesis & Short",
    content:
      "5 things we learned shipping our multi-network distribution pipeline this week. Dispatched at the exact same moment across all channels.",
    scheduleMode: "simultaneous",
    platforms: [
      { name: "YouTube", icon: "YT", bg: "bg-[#FF0000]", color: "text-white" },
      { name: "LinkedIn", icon: "in", bg: "bg-[#0a66c2]", color: "text-white" },
      { name: "X", icon: "𝕏", bg: "bg-stone-900", color: "text-white" },
    ],
    status: "dispatched",
  },
  {
    id: "slot-tue-1",
    day: "Tuesday",
    dayIndex: 1,
    time: "02:15 PM (Simultaneous)",
    title: "Twitch Live Stream Coding Drop",
    content:
      "🔴 Going live on Twitch & YouTube: Live coding distributed queuing workers with token encryption. Answering chat questions!",
    scheduleMode: "simultaneous",
    platforms: [
      { name: "Twitch", icon: "TW", bg: "bg-[#9146FF]", color: "text-white" },
      { name: "YouTube", icon: "YT", bg: "bg-[#FF0000]", color: "text-white" },
      { name: "X", icon: "𝕏", bg: "bg-stone-900", color: "text-white" },
    ],
    status: "queued",
  },
  {
    id: "slot-thu-1",
    day: "Thursday",
    dayIndex: 3,
    time: "Staggered Video Release",
    title: "Changelog v1.4 & YouTube Premiere",
    content:
      "SocioConnect v1.4 Launch Premiere: High-throughput video promo dispatcher with automated cross-platform sync.",
    scheduleMode: "staggered",
    staggeredDrops: [
      {
        platform: "Peerlist",
        icon: "P",
        bg: "bg-[#00AA45]",
        color: "text-white",
        targetTime: "10:00 AM",
        peakReason: "Maker morning project hunt",
        status: "scheduled",
      },
      {
        platform: "YouTube",
        icon: "YT",
        bg: "bg-[#FF0000]",
        color: "text-white",
        targetTime: "04:00 PM",
        peakReason: "Premiere video release slot",
        status: "scheduled",
      },
      {
        platform: "X (Twitter)",
        icon: "𝕏",
        bg: "bg-stone-900",
        color: "text-white",
        targetTime: "04:05 PM",
        peakReason: "Immediate premiere link thread",
        status: "queued",
      },
    ],
    platforms: [
      { name: "YouTube", icon: "YT", bg: "bg-[#FF0000]", color: "text-white" },
      { name: "Peerlist", icon: "P", bg: "bg-[#00AA45]", color: "text-white" },
      { name: "X", icon: "𝕏", bg: "bg-stone-900", color: "text-white" },
    ],
    status: "queued",
  },
  {
    id: "slot-fri-1",
    day: "Friday",
    dayIndex: 4,
    time: "10:30 AM (Simultaneous)",
    title: "Weekend Reflection & Highlight Clip",
    content:
      "Wrapping up the creator sprint! Celebrate your shipped features with your audience across Twitch, Instagram, and Bluesky.",
    scheduleMode: "simultaneous",
    platforms: [
      { name: "Twitch", icon: "TW", bg: "bg-[#9146FF]", color: "text-white" },
      {
        name: "Instagram",
        icon: "IG",
        bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
        color: "text-white",
      },
      { name: "Bluesky", icon: "bs", bg: "bg-[#0285ff]", color: "text-white" },
    ],
    status: "queued",
  },
  {
    id: "slot-sat-1",
    day: "Saturday",
    dayIndex: 5,
    time: "01:00 PM (Simultaneous)",
    title: "Creator Tip & Community Spotlight",
    content:
      "Weekend maker advice: Schedule your video releases during peak viewer hours without remaining glued to your screen.",
    scheduleMode: "simultaneous",
    platforms: [
      { name: "YouTube", icon: "YT", bg: "bg-[#FF0000]", color: "text-white" },
      { name: "Peerlist", icon: "P", bg: "bg-[#00AA45]", color: "text-white" },
      { name: "Reddit", icon: "rd", bg: "bg-[#ff4500]", color: "text-white" },
    ],
    status: "optimizing",
  },
];

const DAYS = [
  { name: "Mon", full: "Monday", date: "Sep 18" },
  { name: "Tue", full: "Tuesday", date: "Sep 19" },
  { name: "Wed", full: "Wednesday", date: "Sep 20" },
  { name: "Thu", full: "Thursday", date: "Sep 21" },
  { name: "Fri", full: "Friday", date: "Sep 22" },
  { name: "Sat", full: "Saturday", date: "Sep 23" },
  { name: "Sun", full: "Sunday", date: "Sep 24" },
];

const TIMEZONES = [
  { id: "UTC", label: "UTC (Coordinated)" },
  { id: "PST", label: "PST / PDT (San Francisco)" },
  { id: "EST", label: "EST / EDT (New York)" },
  { id: "IST", label: "IST (India / Asia)" },
  { id: "GMT", label: "GMT / BST (London)" },
];

export function InteractiveCalendar() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Wednesday default
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [activeSlotId, setActiveSlotId] = useState<string>("slot-wed-1");
  const [customQueueNotice, setCustomQueueNotice] = useState<string | null>(null);

  const activeSlot =
    SCHEDULED_ITEMS.find((s) => s.id === activeSlotId) ||
    SCHEDULED_ITEMS.find((s) => s.dayIndex === selectedDayIndex) ||
    SCHEDULED_ITEMS[0];

  function handleAddQuickSlot() {
    setCustomQueueNotice(
      "New staggered slot created: Auto-mapped to morning, mid-day, and evening peaks!",
    );
    setTimeout(() => setCustomQueueNotice(null), 3500);
  }

  return (
    <section
      id="calendar"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Pain Point Emphasis */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              TIMEZONE &amp; AUDIENCE PEAK SCHEDULER
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Your audience isn&apos;t active at the same time everywhere.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              LinkedIn peaks during morning coffee, YouTube in the afternoon, and Twitch in the
              evening. With SocioConnect, write your post once and choose between an{" "}
              <strong>instant simultaneous blast</strong> or{" "}
              <strong>staggered peak times per platform</strong>.
            </p>
          </div>

          {/* Timezone Switcher */}
          <div className="flex items-center gap-2 font-mono text-xs border border-[#ede8df] bg-white p-2 rounded-xs shadow-xs">
            <Globe className="h-4 w-4 text-stone-500" />
            <span className="text-stone-400 uppercase text-[10px]">TIMEZONE:</span>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              aria-label="Select display timezone for scheduled posts"
              className="bg-transparent font-bold text-stone-900 focus:outline-none cursor-pointer pr-2"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Calendar Board Frame */}
        <div className="border border-[#ede8df] bg-white p-5 sm:p-8 shadow-xs">
          {/* Calendar Top Navigation */}
          <div className="flex flex-wrap items-center justify-between border-b border-dashed border-[#ede8df] pb-4 mb-6 font-mono text-xs">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-stone-700" />
              <span className="font-bold text-stone-900 text-sm">WEEK 38 · SEPTEMBER 2026</span>
              <span className="text-stone-400">({selectedTimezone} Universal Dispatch)</span>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleAddQuickSlot}
                className="inline-flex items-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] px-3 py-1 font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD POST SLOT</span>
              </button>
            </div>
          </div>

          {/* Quick Notice if Slot Added */}
          {customQueueNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 rounded-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{customQueueNotice}</span>
            </motion.div>
          )}

          {/* 7-Day Interactive Columns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-8">
            {DAYS.map((day, idx) => {
              const slotsForDay = SCHEDULED_ITEMS.filter((s) => s.dayIndex === idx);
              const isSelectedDay = selectedDayIndex === idx;

              return (
                <button
                  key={day.name}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    if (slotsForDay.length > 0) {
                      setActiveSlotId(slotsForDay[0].id);
                    }
                  }}
                  className={`text-left p-3.5 border transition-all rounded-xs flex flex-col justify-between min-h-[140px] ${
                    isSelectedDay
                      ? "border-stone-900 bg-[#faf8f5] shadow-xs"
                      : "border-[#ede8df] bg-white hover:border-[#dfc39a]"
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 font-mono">
                    <span className="font-bold text-xs text-stone-900">{day.name}</span>
                    <span className="text-[10px] text-stone-400">{day.date}</span>
                  </div>

                  {/* Scheduled Mini Slots in Day */}
                  <div className="my-2 space-y-1.5 flex-1">
                    {slotsForDay.map((slot) => {
                      const isActiveSlot = activeSlotId === slot.id;
                      const isStaggered = slot.scheduleMode === "staggered";
                      return (
                        <div
                          key={slot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayIndex(idx);
                            setActiveSlotId(slot.id);
                          }}
                          className={`p-2 rounded-xs border text-[11px] font-mono transition-all ${
                            isActiveSlot
                              ? "border-[#dfc39a] bg-[#F4DCB4]/60 font-semibold"
                              : "border-[#ede8df] bg-white text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                            <span className="truncate">
                              {isStaggered ? "⏳ Staggered" : slot.time.split(" ")[0]}
                            </span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                slot.status === "dispatched"
                                  ? "bg-emerald-500"
                                  : slot.status === "optimizing"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                            />
                          </div>
                          <div className="font-sans text-stone-900 truncate font-medium">
                            {slot.title}
                          </div>
                          {/* Platform pills */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {slot.platforms.map((p) => (
                              <span
                                key={p.name}
                                className={`h-4 w-4 rounded-full ${p.bg} ${p.color} text-[8px] flex items-center justify-center font-bold`}
                                title={p.name}
                              >
                                {p.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {slotsForDay.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[10px] font-mono text-stone-300 py-4">
                        + Empty slot
                      </div>
                    )}
                  </div>

                  {/* Slot count tag */}
                  <div className="pt-2 border-t border-dashed border-[#ede8df] text-[10px] font-mono text-stone-400">
                    {slotsForDay.length} {slotsForDay.length === 1 ? "release" : "releases"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Slot Inspection Detail Box with Staggered Visualizer */}
          <div className="border border-dashed border-[#dfc39a] bg-[#faf8f5] p-5 sm:p-7 rounded-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-[#ede8df] pb-4 mb-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 uppercase">
                  ACTIVE QUEUE SLOT: {activeSlot.day} ({selectedTimezone})
                </span>
                <span className="text-stone-300">/</span>
                <span
                  className={`px-2 py-0.5 rounded-xs uppercase text-[10px] font-bold ${
                    activeSlot.scheduleMode === "staggered"
                      ? "bg-[#F4DCB4] text-stone-900 border border-[#dfc39a]"
                      : "bg-stone-100 text-stone-800 border border-stone-300"
                  }`}
                >
                  {activeSlot.scheduleMode === "staggered"
                    ? "✨ Staggered Peak Times"
                    : "⚡ Simultaneous Blast"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                <span>Target Apps ({activeSlot.platforms.length}):</span>
                <div className="flex items-center gap-1.5">
                  {activeSlot.platforms.map((p) => (
                    <span
                      key={p.name}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold ${p.bg} ${p.color}`}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Post Draft Content */}
            <div className="bg-white border border-[#ede8df] p-4 rounded-xs mb-4">
              <h4 className="font-bold text-stone-900 text-sm mb-1">{activeSlot.title}</h4>
              <p className="font-sans text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                {activeSlot.content}
              </p>
            </div>

            {/* If Staggered Drops are configured: Visual Per-Platform Timeline */}
            {activeSlot.staggeredDrops && (
              <div className="border border-[#ede8df] bg-white p-4 rounded-xs mb-4">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-stone-700" />
                    STAGGERED PLATFORM DISPATCH TIMELINE
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Optimized for peak audience attention windows
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeSlot.staggeredDrops.map((drop) => (
                    <div
                      key={drop.platform}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#faf8f5] border border-[#ede8df] rounded-xs font-mono text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-5 w-5 rounded-full ${drop.bg} ${drop.color} flex items-center justify-center text-[9px] font-bold`}
                        >
                          {drop.icon}
                        </span>
                        <span className="font-bold text-stone-900">{drop.platform}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-600 font-semibold">{drop.targetTime}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-stone-500 font-sans italic">{drop.peakReason}</span>
                        <span
                          className={`px-2 py-0.5 rounded-xs uppercase text-[9px] font-bold ${
                            drop.status === "dispatched"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {drop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queue Execution Metas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-white p-3 border border-[#ede8df] rounded-xs">
                <span className="text-stone-400 block text-[10px] uppercase">Timing Mode</span>
                <span className="font-bold text-stone-800 text-xs mt-0.5 block">
                  {activeSlot.scheduleMode === "staggered"
                    ? "Custom Per-Platform Peak Windows"
                    : "Exact Instant Broadcast"}
                </span>
              </div>

              <div className="bg-white p-3 border border-[#ede8df] rounded-xs">
                <span className="text-stone-400 block text-[10px] uppercase">Auth Mode</span>
                <span className="font-bold text-stone-800 text-xs mt-0.5 block">
                  OAuth 2.0 PKCE Session Vault
                </span>
              </div>

              <div className="bg-white p-3 border border-[#ede8df] rounded-xs">
                <span className="text-stone-400 block text-[10px] uppercase">Retry Engine</span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block">
                  Independent Platform Workers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
