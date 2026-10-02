"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Share2, Bell, ChevronDown, LogOut, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/auth-context";

export function TopBar() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = user?.firstName ? user.firstName[0]?.toUpperCase() : "G";
  const userName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "Gaurav";
  const userEmail = user?.email || "gauravanuragi60@gmail.com";
  const userAvatar = user?.avatar;

  return (
    <header className="h-16 shrink-0 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between select-none z-30">
      {/* Left: Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 shadow-md shadow-red-600/25">
          <Share2 className="w-4 h-4 text-neutral-100" />
          <div className="absolute -inset-0.5 bg-red-500 rounded-xl blur-xs opacity-40 group-hover:opacity-75 transition duration-300 -z-10" />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-neutral-100 flex items-center">
          Socio
          <span className="font-serif italic font-normal text-rose-400 text-lg ml-0.5">
            Connect
          </span>
        </span>
      </Link>

      {/* Right: Notifications & Profile Section */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-neutral-950" />
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 z-50 text-neutral-200 backdrop-blur-2xl space-y-2"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-semibold text-neutral-100">Notifications</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 transition-colors">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>Telegram Bot active</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      @socioconnect_bot synced 18 queued messages across 2 communities.
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono">5m ago</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 transition-colors">
                    <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <ExternalLink className="w-3 h-3" />
                      <span>Post Published</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      &ldquo;Design System Showcase&rdquo; published to Instagram &amp; LinkedIn.
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono">1h ago</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 transition-all cursor-pointer"
          >
            {userAvatar && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={userName}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-rose-500/40 shadow-xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-rose-500 to-red-600 text-neutral-100 flex items-center justify-center text-xs font-bold font-display shadow-xs">
                {userInitial}
              </div>
            )}
            <span className="text-xs font-medium text-neutral-200 hidden sm:inline max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2.5 z-50 text-neutral-200 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 px-3 py-2.5 border-b border-neutral-800 mb-1">
                  {userAvatar && !avatarError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userAvatar}
                      alt={userName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-rose-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-rose-500 to-red-600 text-neutral-100 flex items-center justify-center text-sm font-bold font-display shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-100 truncate">{userName}</p>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{userEmail}</p>
                  </div>
                </div>

                <Link
                  href="/"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/70 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Landing Page</span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
