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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion } from "motion/react";
import { DashboardSection } from "../types";
import { useDashboard } from "../context/dashboard-context";

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
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
      className="hidden md:flex flex-col h-full border-r border-white/[0.08] bg-[#07070d]/95 backdrop-blur-xl shrink-0 select-none z-20 overflow-hidden relative"
    >
      {/* Sidebar Top: Prominent Collapse / Expand Toggle Bar */}
      <div className="h-12 border-b border-white/[0.05] px-3 flex items-center justify-between shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold pl-1">
              Menu
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation list with strict overflow-x-hidden */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 w-full">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1 w-full overflow-hidden">
            {group.groupLabel && !isSidebarCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold truncate">
                {group.groupLabel}
              </div>
            )}
            {group.groupLabel && isSidebarCollapsed && (
              <div className="w-6 h-px bg-white/8 mx-auto my-2" />
            )}

            <div className="space-y-0.5 w-full">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                return (
                  <div key={item.id} className="relative group/nav w-full">
                    <button
                      type="button"
                      onClick={() => setCurrentSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer overflow-hidden ${
                        isActive
                          ? item.highlight
                            ? "bg-red-600 text-white font-semibold shadow-md shadow-red-600/25"
                            : "bg-white/[0.08] text-white font-semibold border border-white/10 shadow-xs"
                          : item.highlight
                            ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
                      } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? "text-current scale-105"
                            : item.highlight
                              ? "text-rose-400"
                              : "text-neutral-400 group-hover/nav:text-neutral-200"
                        }`}
                      />

                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-white/5 text-neutral-400 border border-white/8"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Collapsed Hover Tooltip */}
                    {isSidebarCollapsed && (
                      <div className="fixed left-[76px] px-2.5 py-1 rounded-lg bg-[#0f0f1c] border border-white/15 text-white text-xs whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-50 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-rose-300 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-white/[0.06] shrink-0 w-full overflow-hidden">
        <button
          type="button"
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer text-xs font-medium ${
            isSidebarCollapsed ? "justify-center px-0" : "px-3"
          }`}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-rose-400" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-400 truncate">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
