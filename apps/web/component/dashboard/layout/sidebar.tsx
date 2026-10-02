"use client";

import React from "react";
import {
  LayoutDashboard,
  PenTool,
  FileText,
  CalendarDays,
  Bot,
  Zap,
  Users,
  Radio,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { DashboardSection } from "../types";

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  highlight?: boolean;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export function Sidebar() {
  const {
    currentSection,
    setCurrentSection,
    isSidebarCollapsed,
    toggleSidebar,
    posts,
    bots,
    connectors,
  } = useDashboard();

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const activeBotsCount = bots.filter((b) => b.status === "active").length;
  const connectedCount = connectors.filter((c) => c.status === "connected").length;

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "CONTENT",
      items: [
        {
          id: "compose",
          label: "Compose",
          icon: PenTool,
          highlight: true,
        },
        {
          id: "posts",
          label: "Posts",
          icon: FileText,
          badge: scheduledCount > 0 ? scheduledCount : undefined,
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: CalendarDays,
        },
      ],
    },
    {
      groupLabel: "AUTOMATION",
      items: [
        {
          id: "bots",
          label: "Bots",
          icon: Bot,
          badge: activeBotsCount > 0 ? `${activeBotsCount} on` : undefined,
        },
        {
          id: "automations",
          label: "Automations",
          icon: Zap,
        },
      ],
    },
    {
      groupLabel: "NETWORK",
      items: [
        {
          id: "communities",
          label: "Communities",
          icon: Users,
        },
        {
          id: "connectors",
          label: "Connectors",
          icon: Radio,
          badge: connectedCount,
        },
      ],
    },
    {
      groupLabel: "ANALYTICS",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      groupLabel: "SETTINGS",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarCollapsed ? 68 : 240,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="hidden md:flex flex-col h-full border-r border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden relative"
    >
      {/* Sidebar Top: Collapse / Expand Toggle Bar */}
      <div className="h-12 border-b border-neutral-800/80 px-3 flex items-center justify-between shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold pl-1">
              Workspace
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              title="Collapse sidebar (Ctrl+B)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {group.groupLabel && !isSidebarCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-neutral-500 uppercase">
                {group.groupLabel}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentSection(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? "bg-red-600 text-neutral-100 shadow-md shadow-red-600/25 font-semibold"
                        : "bg-neutral-900 text-neutral-100 font-semibold border border-neutral-800 shadow-xs"
                      : item.highlight
                        ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive
                        ? "scale-105"
                        : "group-hover:scale-105 text-neutral-400 group-hover:text-neutral-200"
                    } ${item.highlight && !isActive ? "text-rose-400" : ""}`}
                  />

                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? "bg-neutral-800 text-neutral-200"
                          : "bg-neutral-800/80 text-neutral-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed Active Indicator Dot */}
                  {isSidebarCollapsed && isActive && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Quick status pill */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/80 shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-neutral-300">Gateway Live</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">99.98%</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Gateway Online (99.98%)">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
