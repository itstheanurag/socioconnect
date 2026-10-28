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
  KeyRound,
  Building2,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { DashboardSection } from "@/component/dashboard/types";

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
      items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
    },
    {
      groupLabel: "Content",
      items: [
        { id: "compose", label: "Compose", icon: PenTool, highlight: true },
        {
          id: "posts",
          label: "Posts",
          icon: FileText,
          badge: scheduledCount > 0 ? scheduledCount : undefined,
        },
        { id: "calendar", label: "Calendar", icon: CalendarDays },
      ],
    },
    {
      groupLabel: "Automation",
      items: [
        {
          id: "bots",
          label: "Bots",
          icon: Bot,
          badge: activeBotsCount > 0 ? `${activeBotsCount} on` : undefined,
        },
        { id: "automations", label: "Automations", icon: Zap },
      ],
    },
    {
      groupLabel: "Network",
      items: [
        { id: "communities", label: "Communities", icon: Users },
        { id: "connectors", label: "Connectors", icon: Radio, badge: connectedCount },
      ],
    },
    {
      groupLabel: "Analytics",
      items: [{ id: "analytics", label: "Analytics", icon: BarChart3 }],
    },
    {
      groupLabel: "Developers",
      items: [{ id: "developers", label: "API & Agents", icon: KeyRound }],
    },
    {
      groupLabel: "Workspace",
      items: [
        { id: "team", label: "Team", icon: Building2 },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 72 : 248 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="hidden md:flex flex-col h-full border-r border-neutral-800/80 bg-neutral-950/70 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden relative"
    >
      <div className="h-16 shrink-0 border-b border-neutral-800/80 px-3">
        <div className="flex h-full items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentSection("overview")}
            className={`flex min-w-0 items-center gap-2.5 text-left ${isSidebarCollapsed ? "mx-auto" : ""}`}
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-[#1b0b08] shadow-lg shadow-rose-500/20">
              <Share2 className="h-4 w-4" />
            </span>
            {!isSidebarCollapsed && (
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-bold tracking-tight text-neutral-100">
                  Socio<span className="font-serif italic font-normal text-rose-300">Connect</span>
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                  Broadcast OS
                </span>
              </span>
            )}
          </button>

          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
              title="Collapse sidebar (Ctrl+B)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isSidebarCollapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="mx-auto mt-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-1 text-neutral-500 hover:text-neutral-200"
          title="Expand sidebar (Ctrl+B)"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-none">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {group.groupLabel && !isSidebarCollapsed && (
              <div className="px-2.5 pb-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
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
                  className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-all duration-150 ${
                    isActive
                      ? item.highlight
                        ? "bg-rose-500 font-semibold text-[#1b0b08] shadow-lg shadow-rose-500/15"
                        : "border border-neutral-800 bg-neutral-900/80 font-semibold text-neutral-100"
                      : item.highlight
                        ? "border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
                        : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-100"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  {isActive && !item.highlight && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-rose-500" />
                  )}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive
                        ? item.highlight
                          ? "text-[#1b0b08]"
                          : "text-rose-300"
                        : item.highlight
                          ? "text-rose-300"
                          : "text-neutral-500 group-hover:text-neutral-300"
                    } group-hover:scale-105`}
                  />

                  {!isSidebarCollapsed && (
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-px font-mono text-[9px] font-semibold ${
                        isActive && item.highlight
                          ? "bg-[#1b0b08]/15 text-[#1b0b08]"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isSidebarCollapsed && isActive && (
                    <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-neutral-800/80 p-3">
        {!isSidebarCollapsed ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
                <span className="signal-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Signal stable
              </span>
              <span className="signal-tabular font-mono text-[9px] text-neutral-500">
                {connectedCount} ch
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-400"
                style={{ width: `${Math.min(100, 35 + connectedCount * 8)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Signal stable">
            <span className="signal-live-dot h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
