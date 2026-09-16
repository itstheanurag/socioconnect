"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface CalendarSlot {
  id: string;
  day: string;
  dayIndex: number;
  time: string;
  title: string;
  content: string;
  scheduleMode: "simultaneous" | "staggered";
  staggeredDrops?: {
    platform: string;
    name: string;
    targetTime: string;
    peakReason: string;
    status: "scheduled" | "queued" | "live";
  }[];
  platforms: string[];
  status: "scheduled" | "queued" | "optimizing";
}

const WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const INITIAL_SCHEDULE: CalendarSlot[] = [
  {
    id: "slot-mon-1",
    day: "monday",
    dayIndex: 0,
    time: "staggered launch schedule",
    title: "episode 1 launch & creator breakdown",
    content:
      "🎬 our new behind-the-scenes video is live! a deep dive into creative workflows, tool setups, and creator sustainability.",
    scheduleMode: "staggered",
    staggeredDrops: [
      {
        platform: "linkedin",
        name: "linkedin",
        targetTime: "08:30 am",
        peakReason: "morning creator network check-in",
        status: "scheduled",
      },
      {
        platform: "instagram",
        name: "instagram",
        targetTime: "12:30 pm",
        peakReason: "lunch break reel and story teaser",
        status: "scheduled",
      },
      {
        platform: "youtube",
        name: "youtube",
        targetTime: "04:00 pm",
        peakReason: "main episode release & community post",
        status: "scheduled",
      },
      {
        platform: "twitch",
        name: "twitch",
        targetTime: "06:30 pm",
        peakReason: "evening live stream watch-party",
        status: "queued",
      },
    ],
    platforms: ["linkedin", "instagram", "youtube", "twitch"],
    status: "scheduled",
  },
  {
    id: "slot-tue-1",
    day: "tuesday",
    dayIndex: 1,
    time: "02:15 pm (simultaneous)",
    title: "live stream hangout & q&a",
    content:
      "🔴 going live on twitch & youtube! today we're reviewing community projects and answering audience questions in chat.",
    scheduleMode: "simultaneous",
    platforms: ["twitch", "youtube", "x"],
    status: "queued",
  },
  {
    id: "slot-thu-1",
    day: "thursday",
    dayIndex: 3,
    time: "staggered feature drop",
    title: "new feature showcase & premiere",
    content:
      "excited to share our newest creator tools! full walkthrough and interactive demo are up now.",
    scheduleMode: "staggered",
    staggeredDrops: [
      {
        platform: "peerlist",
        name: "peerlist",
        targetTime: "10:00 am",
        peakReason: "morning maker project showcase",
        status: "scheduled",
      },
      {
        platform: "youtube",
        name: "youtube",
        targetTime: "04:00 pm",
        peakReason: "premiere video release window",
        status: "scheduled",
      },
      {
        platform: "x",
        name: "x (twitter)",
        targetTime: "04:05 pm",
        peakReason: "immediate premiere discussion thread",
        status: "queued",
      },
    ],
    platforms: ["youtube", "peerlist", "x"],
    status: "queued",
  },
  {
    id: "slot-fri-1",
    day: "friday",
    dayIndex: 4,
    time: "10:30 am (simultaneous)",
    title: "weekly recap & community highlights",
    content:
      "wrapping up the week! celebrating top community submissions and creative breakthroughs across all our channels.",
    scheduleMode: "simultaneous",
    platforms: ["twitch", "instagram", "bluesky"],
    status: "queued",
  },
  {
    id: "slot-sat-1",
    day: "saturday",
    dayIndex: 5,
    time: "01:00 pm (simultaneous)",
    title: "weekend tip & creator inspiration",
    content:
      "weekend tip: batch your content creation in one calm afternoon and let your scheduler handle the weekly releases.",
    scheduleMode: "simultaneous",
    platforms: ["youtube", "peerlist", "reddit"],
    status: "optimizing",
  },
];

export function InteractiveCalendar() {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot>(INITIAL_SCHEDULE[0]);
  const [currentWeek] = useState("sep 15 - sep 21, 2026");

  return (
    <section
      id="calendar"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lowercase">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              <span>smart audience calendar</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              visual scheduling built for creator habits.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              your viewers on youtube, twitch, and linkedin are active at different times of day.
              plan your week visually and let socioconnect release every post when it gets the most
              love.
            </p>
          </div>

          {/* Week Selector Bar */}
          <div className="flex items-center gap-3 font-mono text-xs border border-[#ede8df] bg-white px-3.5 py-1.5 rounded-md shadow-2xs">
            <button
              className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-stone-800">{currentWeek}</span>
            <button
              className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="border border-[#ede8df] bg-white rounded-md shadow-xs overflow-hidden mb-6 lowercase">
          <div className="grid grid-cols-7 border-b border-[#ede8df] bg-[#faf8f5] text-center font-mono text-xs">
            {WEEK_DAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-2.5 border-r last:border-r-0 border-[#ede8df] ${
                  idx === 0 || idx === 3 ? "font-bold text-stone-900 bg-white" : "text-stone-500"
                }`}
              >
                <span>{day}</span>
                <span className="block text-[10px] text-stone-400 font-normal">sep {15 + idx}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-7 min-h-[220px] divide-y sm:divide-y-0 sm:divide-x divide-[#ede8df]">
            {WEEK_DAYS.map((day, idx) => {
              const slotsOnDay = INITIAL_SCHEDULE.filter((s) => s.dayIndex === idx);

              return (
                <div
                  key={day}
                  className={`p-2 flex flex-col justify-start gap-1.5 ${
                    slotsOnDay.length > 0 ? "bg-white" : "bg-[#faf8f5]/40"
                  }`}
                >
                  {slotsOnDay.map((slot) => {
                    const isSelected = selectedSlot.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`text-left p-2.5 border transition-all rounded-md w-full cursor-pointer ${
                          isSelected
                            ? "border-stone-900 bg-[#F4DCB4]/30 shadow-2xs"
                            : "border-[#ede8df] bg-[#faf8f5] hover:border-[#dfc39a]"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-stone-500 mb-1">
                          <span className="font-semibold text-stone-800 truncate">
                            {slot.time.split(" ")[0]}
                          </span>
                          {slot.scheduleMode === "staggered" && (
                            <span className="text-[9px] bg-[#dfc39a]/40 px-1 py-0.2 rounded-xs text-stone-800 font-bold">
                              staggered
                            </span>
                          )}
                        </div>

                        <div className="font-sans text-xs font-semibold text-stone-900 line-clamp-1 mb-1.5">
                          {slot.title}
                        </div>

                        {/* Platform Icons Mini Strip */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-dashed border-[#ede8df]">
                          {slot.platforms.map((p) => (
                            <div
                              key={p}
                              className="flex h-5 w-5 items-center justify-center rounded-xs border border-[#ede8df] bg-white shadow-2xs"
                            >
                              <PlatformIcon platform={p} size={11} />
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Slot Detailed Peak Inspection Card */}
        {selectedSlot && (
          <div className="border border-[#ede8df] bg-white p-6 sm:p-7 rounded-md shadow-xs lowercase">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-dashed border-[#ede8df] pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-stone-500 mb-1">
                  <CalendarDays className="h-4 w-4 text-stone-700" />
                  <span className="font-bold text-stone-900">{selectedSlot.day}</span>
                  <span>·</span>
                  <span>{selectedSlot.time}</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-sans">{selectedSlot.title}</h3>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="border border-[#dfc39a] bg-[#F4DCB4]/40 px-3 py-1 text-stone-900 font-bold rounded-md">
                  {selectedSlot.scheduleMode === "staggered"
                    ? "timed audience peak drops"
                    : "simultaneous release"}
                </span>
              </div>
            </div>

            {/* Post Draft Content */}
            <div className="mb-6 bg-[#faf8f5] p-3.5 border border-[#ede8df] rounded-md font-sans text-sm text-stone-800 leading-relaxed">
              <span className="font-mono text-[10px] text-stone-400 block mb-1">post text:</span>
              &ldquo;{selectedSlot.content}&rdquo;
            </div>

            {/* If Staggered, show the interactive peak delivery timeline */}
            {selectedSlot.scheduleMode === "staggered" && selectedSlot.staggeredDrops ? (
              <div>
                <div className="font-mono text-xs font-bold text-stone-800 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-stone-700" />
                  <span>staggered platform schedule:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                  {selectedSlot.staggeredDrops.map((drop) => (
                    <div
                      key={drop.platform}
                      className="border border-[#ede8df] bg-white p-3.5 rounded-md shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#ede8df] bg-[#faf8f5]">
                            <PlatformIcon platform={drop.platform} size={14} />
                          </div>
                          <span className="font-bold text-stone-900">{drop.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-bold">
                          {drop.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-stone-800 font-bold text-sm">
                        <Clock className="h-3.5 w-3.5 text-[#dfc39a]" />
                        <span>{drop.targetTime}</span>
                      </div>

                      <p className="text-[11px] text-stone-500 font-sans leading-snug">
                        {drop.peakReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                <Layers className="h-4 w-4 text-stone-700" />
                <span>
                  simultaneous release across all {selectedSlot.platforms.length} connected channels
                  at {selectedSlot.time}.
                </span>
              </div>
            )}

            {/* Bottom Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-dashed border-[#ede8df] flex flex-wrap items-center justify-between font-mono text-xs text-stone-500 gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>account safety: 100% private &amp; verified</span>
              </div>
              <div>independent channel publish queues</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
