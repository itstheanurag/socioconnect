"use client";

import React from "react";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { ContextualPanel } from "./contextual-panel";
import { GlobalSearchModal } from "./global-search-modal";
import { useDashboard } from "../context/dashboard-context";

// Views
import { OverviewView } from "../views/overview-view";
import { ComposeView } from "../views/compose-view";
import { PostsView } from "../views/posts-view";
import { CalendarView } from "../views/calendar-view";
import { BotsView } from "../views/bots-view";
import { AutomationsView } from "../views/automations-view";
import { CommunitiesView } from "../views/communities-view";
import { ConnectorsView } from "../views/connectors-view";
import { AnalyticsView } from "../views/analytics-view";
import { SettingsView } from "../views/settings-view";

// Mobile Bottom Navigation
import { LayoutDashboard, PenTool, CalendarDays, Bot, FileText } from "lucide-react";
import { DashboardSection } from "../types";

export function DashboardLayout() {
  const { currentSection, setCurrentSection } = useDashboard();

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
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-200 flex flex-col selection:bg-rose-500/30 selection:text-neutral-100 relative font-sans">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[32rem] h-[32rem] bg-red-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Strict Fixed Header */}
      <TopBar />

      {/* Middle Zone: Strict Viewport Splitting */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop) */}
        <Sidebar />

        {/* Dominant Main Workspace Area with strict independent scroll */}
        <main className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full z-10 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {renderCurrentView()}
        </main>

        {/* Contextual Right Panel */}
        <ContextualPanel />
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden shrink-0 z-40 bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-800 px-2 py-1.5 flex items-center justify-around">
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
