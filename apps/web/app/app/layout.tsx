"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  PenTool,
  Link2,
  Bot,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: typeof PenTool;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "compose post", href: "/app", icon: PenTool },
  { name: "connectors", href: "/app/connectors", icon: Link2, badge: "6 active" },
  { name: "community hubs", href: "/app/communities", icon: Users, badge: "new" },
  { name: "bots & ai", href: "/app/bots", icon: Bot, badge: "auto" },
  { name: "calendar", href: "/app/calendar", icon: Calendar },
  { name: "usage & plan", href: "/app/usage", icon: BarChart3 },
  { name: "profile & security", href: "/app/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, mockLogin } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto fallback to demo user if viewing dashboard in preview
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      mockLogin();
    }
  }, [isLoading, isAuthenticated, mockLogin]);

  const activeNavItem =
    NAV_ITEMS.find((item) =>
      item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href),
    ) || NAV_ITEMS[0];

  const userFullName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.toLowerCase()
    : "maya rao";

  const userEmail = user?.email?.toLowerCase() || "maya@socioconnect.app";

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex font-sans lowercase">
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop & Mobile Slide-Over Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#ede8df] bg-[#fcfaf7] flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Logo & Navigation */}
        <div className="p-4 space-y-6">
          {/* Logo Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-stone-900 hover:opacity-85 transition-opacity"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#F4DCB4] border border-[#dfc39a] font-mono text-xs font-black text-stone-900 shadow-2xs">
                s
              </div>
              <span className="font-mono text-sm font-bold tracking-tight">socioconnect</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Compose CTA Button */}
          <div>
            <Link
              href="/app"
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] hover:bg-[#ebd0a3] p-2.5 rounded-md font-mono text-xs font-bold text-stone-900 transition-colors shadow-2xs"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>+ compose post</span>
            </Link>
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 font-mono text-xs">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 pb-1">
              studio apps
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-white font-bold text-stone-900 shadow-xs border border-[#ede8df]"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-stone-900" : "text-stone-400"}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-xs ${
                        isActive
                          ? "bg-[#F4DCB4] text-stone-900 font-bold"
                          : "bg-stone-200/70 text-stone-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Link to Landing Page */}
          <div className="pt-2 border-t border-dashed border-[#ede8df] font-mono text-xs">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-stone-900 rounded-md hover:bg-white/60 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
              <span>view public landing</span>
            </Link>
          </div>
        </div>

        {/* Bottom Sidebar: User Profile & Log Out */}
        <div className="p-4 border-t border-[#ede8df] bg-white/70 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                }
                alt={userFullName}
                className="h-7 w-7 rounded-full object-cover border border-[#ede8df] shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-stone-900 truncate">{userFullName}</div>
                <div className="text-[10px] text-stone-400 truncate">{userEmail}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void logout();
              }}
              title="Sign Out"
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-dashed border-[#ede8df]">
            <span className="flex items-center gap-1 text-emerald-800 font-bold">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>creator pro</span>
            </span>
            <span>0% passwords stored</span>
          </div>
        </div>
      </aside>

      {/* Main Content Layout (Offset for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 border-b border-[#ede8df] bg-[#faf8f5]/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile Sidebar Trigger + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 border border-[#ede8df] rounded-md bg-white cursor-pointer"
                aria-label="Open navigation sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500">
                <span className="text-stone-400">studio</span>
                <ChevronRight className="h-3 w-3 text-stone-300" />
                <span className="font-bold text-stone-900">{activeNavItem.name}</span>
              </div>
            </div>

            {/* Right: Studio Status Indicator & Shortcuts */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-stone-500 bg-white border border-[#ede8df] px-2.5 py-1 rounded-sm shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>worker pipelines operational</span>
              </div>

              {pathname !== "/app" && (
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1 border border-[#dfc39a] bg-[#F4DCB4] px-2.5 py-1 text-[11px] font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-sm shadow-2xs"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>compose</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Studio Footer */}
        <footer className="border-t border-[#ede8df] bg-[#faf8f5] py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-stone-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>socioconnect studio engine &middot; v1.4</span>
            </div>
            <div>calm creative publishing &middot; zero password exposure</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
