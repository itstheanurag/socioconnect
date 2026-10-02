"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { PlatformIcon } from "@/component/dashboard/ui/platform-icon";

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

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  };

  // Group scheduled posts by day of current month
  const scheduledPosts = posts.filter((p) => p.status === "scheduled" && p.scheduledFor);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Publishing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Visual map of scheduled dispatches across all connected channels and communities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-display font-semibold text-xs text-neutral-200 px-2 min-w-[120px] text-center">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateToCompose()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold text-xs shadow-lg shadow-red-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-950/40 text-center py-2.5 text-xs font-mono font-medium text-neutral-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-800/80 bg-neutral-900/30">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-neutral-950/30 opacity-40" />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === 2; // Simulated "today" as Oct 2

            // Find posts for this day
            const dayPosts = scheduledPosts.filter((p) => {
              if (!p.scheduledFor) return false;
              const date = new Date(p.scheduledFor);
              return date.getDate() === dayNum && date.getMonth() === currentMonthIndex;
            });

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  isToday
                    ? "bg-rose-500/5 ring-1 ring-inset ring-rose-500/30"
                    : "hover:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isToday
                        ? "w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30"
                        : "text-neutral-400"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="space-y-1 mt-1 flex-1">
                  {dayPosts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => openContextualPanel("post_details", post)}
                      className="w-full text-left p-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-200 truncate transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-0.5 shrink-0">
                        {post.targetPlatforms.slice(0, 2).map((pid) => (
                          <PlatformIcon key={pid} platformId={pid} className="w-2.5 h-2.5" />
                        ))}
                      </div>
                      <span className="truncate">{post.title}</span>
                    </button>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] font-mono text-neutral-500 pl-1">
                      +{dayPosts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
