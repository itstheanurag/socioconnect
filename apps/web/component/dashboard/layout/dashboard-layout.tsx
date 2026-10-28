"use client";

import React, { useEffect } from "react";
import { TopBar } from "./top-bar";
import { SignalRail } from "./signal-rail";
import { Sidebar } from "./sidebar";
import { ContextualPanel } from "./contextual-panel";
import { GlobalSearchModal } from "./global-search-modal";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";

// Views
import { OverviewView } from "@/component/dashboard/views/overview-view";
import { ComposeView } from "@/component/dashboard/views/compose-view";
import { PostsView } from "@/component/dashboard/views/posts-view";
import { CalendarView } from "@/component/dashboard/views/calendar-view";
import { BotsView } from "@/component/dashboard/views/bots-view";
import { AutomationsView } from "@/component/dashboard/views/automations-view";
import { CommunitiesView } from "@/component/dashboard/views/communities-view";
import { ConnectorsView } from "@/component/dashboard/views/connectors-view";
import { AnalyticsView } from "@/component/dashboard/views/analytics-view";
import { DevelopersView } from "@/component/dashboard/views/developers-view";
import { TeamView } from "@/component/dashboard/views/team-view";
import { SettingsView } from "@/component/dashboard/views/settings-view";

// Mobile Bottom Navigation
import { LayoutDashboard, PenTool, CalendarDays, Bot, FileText } from "lucide-react";
import { DashboardSection } from "@/component/dashboard/types";

export function DashboardLayout() {
  const { currentSection, setCurrentSection } = useDashboard();

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get("section");
    if (section) setCurrentSection(section as DashboardSection);
  }, [setCurrentSection]);

  const renderCurrentView = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewView />;
      case "compose":
        return <ComposeView />;
      case "posts":
        return <PostsView />;
      case "calendar":
        return <CalendarView />;
      case "bots":
        return <BotsView />;
      case "automations":
        return <AutomationsView />;
      case "communities":
        return <CommunitiesView />;
      case "connectors":
        return <ConnectorsView />;
      case "analytics":
        return <AnalyticsView />;
      case "developers":
        return <DevelopersView />;
      case "team":
        return <TeamView />;
      case "settings":
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  const mobileNavItems: { id: DashboardSection; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "compose", label: "Compose", icon: PenTool },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "bots", label: "Bots", icon: Bot },
  ];

  return (
    <div className="dashboard-shell h-screen max-h-screen w-screen overflow-hidden text-neutral-200 flex flex-col selection:bg-rose-500/30 selection:text-neutral-100 relative font-sans">
      <div className="signal-grid fixed inset-0 pointer-events-none opacity-80" />
      <div className="fixed -top-24 left-1/3 h-80 w-80 rounded-full bg-rose-500/5 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/5 h-96 w-96 rounded-full bg-sky-400/5 blur-[150px] pointer-events-none" />

      {/* Strict Fixed Header */}
      <TopBar />

      {/* Middle Zone: Strict Viewport Splitting */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop) */}
        <Sidebar />

        {/* Dominant Main Workspace Area with strict independent scroll */}
        <main className="signal-scroll flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden px-4 sm:px-7 py-5 sm:py-6 w-full z-10">
          <div className="mx-auto w-full max-w-[1440px]">
            <SignalRail />
            {renderCurrentView()}
          </div>
        </main>

        {/* Contextual Right Panel */}
        <ContextualPanel />
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden shrink-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-2 py-1.5 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentSection(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all ${
                isActive ? "text-rose-400 font-semibold" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-rose-400" : "text-neutral-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
