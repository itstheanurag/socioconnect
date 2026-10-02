"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor } from "@/component/dashboard/ui/platform-icon";

export function CalendarView() {
  const { posts, openContextualPanel, navigateToCompose } = useDashboard();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-indexed: 9 = October
  const [currentYear] = useState(2026);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate 35 days grid (5 weeks) for October 2026
  // October 1, 2026 is a Thursday (index 4 in Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
  const daysInMonth = 31;
  const startDayOfWeek = 3; // Thursday (0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun)

  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push({ dayNumber: 28 + i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ dayNumber: i, isCurrentMonth: true });
  }
  while (calendarCells.length < 35) {
    calendarCells.push({ dayNumber: calendarCells.length - 30, isCurrentMonth: false });
  }

  const scheduledPosts = posts.filter((p) => p.status === "scheduled" || p.status === "published");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Publishing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Visual scheduler across all connected social channels and community destinations.
          </p>
        </div>

        {/* View Mode & Date Nav */}
        <div className="flex items-center gap-3">
          {/* Month / Week / Day Switch */}
          <div className="p-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-1 text-xs">
            {(["month", "week", "day"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-medium uppercase text-[11px] tracking-wider transition-all cursor-pointer ${
                  viewMode === mode
                    ? "bg-rose-500/20 text-neutral-100 font-semibold border border-rose-500/30"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              className="p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-100 px-2 font-display">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => Math.min(11, prev + 1))}
              className="p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Month Grid View */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-2 pb-3 border-b border-neutral-800 text-center">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* 35 Calendar Cells */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.isCurrentMonth && cell.dayNumber === 1; // Current mock date is Oct 1

            // Find posts scheduled for this day
            const dayPosts = cell.isCurrentMonth
              ? scheduledPosts.filter((p) => {
                  if (cell.dayNumber === 1 && p.id === "post-101") return true;
                  if (cell.dayNumber === 1 && p.id === "post-102") return true;
                  if (cell.dayNumber === 2 && p.id === "post-103") return true;
                  if (cell.dayNumber === 6 && p.id === "post-105") return true;
                  if (cell.dayNumber === 8 && p.id === "post-104") return true;
                  return false;
                })
              : [];

            return (
              <div
                key={idx}
                className={`min-h-[105px] sm:min-h-[125px] rounded-2xl p-2.5 flex flex-col justify-between border transition-all ${
                  !cell.isCurrentMonth
                    ? "bg-neutral-950/20 border-neutral-800/40 text-neutral-600"
                    : isToday
                      ? "bg-rose-500/[0.08] border-rose-500/30 shadow-inner"
                      : "bg-neutral-950/40 hover:bg-neutral-800/60 border-neutral-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isToday
                        ? "text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded-md"
                        : cell.isCurrentMonth
                          ? "text-neutral-300"
                          : "text-neutral-600"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.isCurrentMonth && (
                    <button
                      type="button"
                      onClick={() =>
                        navigateToCompose({
                          scheduledFor: `2026-10-${String(cell.dayNumber).padStart(2, "0")}T10:00:00`,
                        })
                      }
                      className="opacity-0 hover:opacity-100 p-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-opacity cursor-pointer"
                      title="Schedule post on this day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Day Posts Pills */}
                <div className="space-y-1 my-1">
                  {dayPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => openContextualPanel("post_preview", post)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[10px] text-neutral-100 flex items-center justify-between gap-1 shadow-xs cursor-pointer group"
                    >
                      <span className="truncate font-medium">{post.title}</span>
                      <div className="flex items-center -space-x-1 shrink-0">
                        {post.targetPlatforms.slice(0, 2).map((p) => (
                          <div
                            key={p}
                            className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center p-0.5"
                          >
                            <PlatformIcon platformId={p} className="w-2 h-2 text-neutral-100" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
