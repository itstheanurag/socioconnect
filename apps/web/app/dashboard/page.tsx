"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  LogOut,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
            <Share2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm font-mono text-neutral-400">Loading your command center...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitial = user.firstName ? user.firstName[0]?.toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-rose-500/30 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[32rem] h-[32rem] bg-red-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#080811]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 shadow-md shadow-red-600/25">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white flex items-center">
              Socio
              <span className="font-serif italic font-normal text-rose-400 text-lg ml-0.5">
                Connect
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refreshUser()}
              className="p-2 rounded-xl text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 border border-white/6 transition-all cursor-pointer"
              title="Refresh session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#12111d] via-[#0b0b14] to-[#07070d] p-6 sm:p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-rose-500/30 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center font-display text-2xl font-bold ring-2 ring-rose-500/30 shadow-xl">
                  {userInitial}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20">
                    <Sparkles className="w-3 h-3" />
                    Authenticated via Google
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Session
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Manage your connected social networks and scheduled automations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <span>Landing Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Profile Details & Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-3xl border border-white/8 bg-[#090912]/80 backdrop-blur-xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-rose-400" />
                <h2 className="font-display text-sm font-semibold text-white tracking-wide">
                  Profile Details
                </h2>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase">OAuth User</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/6">
                <span className="text-neutral-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Full Name
                </span>
                <span className="font-medium text-white">
                  {user.firstName} {user.lastName || ""}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/6">
                <span className="text-neutral-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  Email
                </span>
                <span className="font-mono text-neutral-300 truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/6">
                <span className="text-neutral-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  Account Role
                </span>
                <span className="font-mono text-rose-300 uppercase font-semibold text-[11px]">
                  {user.role}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics & Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="rounded-3xl border border-white/8 bg-[#090912]/80 backdrop-blur-xl p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  Active
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display text-white">8 Channels</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Ready to connect X, LinkedIn, Instagram, TikTok, and YouTube.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#090912]/80 backdrop-blur-xl p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/8">
                  Fast Sync
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display text-white">Automations</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Queue and schedule posts across all connected networks in real-time.
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 rounded-3xl border border-white/8 bg-linear-to-r from-rose-950/20 via-[#0a0a14] to-[#0a0a14] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-display">
                    Multi-Platform Publisher Ready
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Your authenticated session is active and verified by SocioConnect backend API.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
