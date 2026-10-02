"use client";

import React, { useState } from "react";
import {
  Link2,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor, getPlatformDisplayName } from "../ui/platform-icon";
import { ConnectorAccount, PlatformId } from "../types";

const ALL_AVAILABLE_PLATFORMS: { id: PlatformId; name: string; authType: string }[] = [
  { id: "twitter", name: "X (Twitter)", authType: "OAuth 2.0 PKCE" },
  { id: "linkedin", name: "LinkedIn Pages & Profiles", authType: "OAuth 2.0 OpenID" },
  { id: "instagram", name: "Instagram Graph API", authType: "Facebook Graph OAuth" },
  { id: "telegram", name: "Telegram Bot & Channel API", authType: "BotToken / MTProto" },
  { id: "reddit", name: "Reddit OAuth & Mod API", authType: "OAuth 2.0 Script" },
  { id: "threads", name: "Meta Threads API", authType: "Threads OAuth 2.0" },
  { id: "youtube", name: "YouTube Studio API", authType: "Google OAuth 2.0" },
  { id: "facebook", name: "Facebook Pages & Groups", authType: "Facebook Graph OAuth" },
  { id: "tiktok", name: "TikTok Content Posting API", authType: "TikTok Login Kit" },
];

export function ConnectorsView() {
  const { connectors, toggleConnectorSync } = useDashboard();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      toggleConnectorSync(id);
      setSyncingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Platform Connectors &amp; Accounts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage authenticated social accounts, API keys, and channel-level capabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New Platform</span>
        </button>
      </div>

      {/* Grid of Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const brand = getPlatformBrandColor(c.platformId);
          const isSyncing = syncingId === c.id;

          return (
            <motion.div
              key={c.id}
              layout
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Header with Avatar & Platform Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-lg ${brand.bg} ${brand.border} ${brand.text}`}
                    >
                      <PlatformIcon platformId={c.platformId} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-neutral-100 leading-tight">
                        {c.accountName}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">{c.accountHandle}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                      c.status === "connected"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="capitalize">{c.status}</span>
                  </span>
                </div>

                {/* Account Stats Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-neutral-950/40 border border-neutral-800 text-center">
                  <div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">
                      {c.stats.followers ? "Followers" : c.stats.subscribers ? "Subs" : "Members"}
                    </div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">
                      {(
                        c.stats.followers ||
                        c.stats.subscribers ||
                        c.stats.members ||
                        0
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">
                      Dispatched
                    </div>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5">
                      {c.stats.postsCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">Health</div>
                    <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      100%
                    </div>
                  </div>
                </div>

                {/* Capabilities Overview */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-neutral-400">
                  <div className="p-2 rounded-xl bg-neutral-950/40 border border-neutral-800">
                    <div className="text-[9px] uppercase text-neutral-500">Max Chars</div>
                    <div className="font-semibold text-neutral-200 mt-0.5">
                      {c.capabilities.maxTextLength.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950/40 border border-neutral-800">
                    <div className="text-[9px] uppercase text-neutral-500">Video Max</div>
                    <div className="font-semibold text-neutral-200 mt-0.5">
                      {c.capabilities.video
                        ? `${c.capabilities.maxVideoDurationSec}s`
                        : "Unsupported"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Meta & Sync Actions */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="text-[10px] text-neutral-500 font-mono">Synced {c.lastSyncAt}</div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSync(c.id)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
                    title="Refresh channel telemetry"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-rose-400" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900/95 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-neutral-100">
                    Connect Platform Account
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Select a social provider to initialize secure OAuth token handshake.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {ALL_AVAILABLE_PLATFORMS.map((p) => {
                  const brand = getPlatformBrandColor(p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-950/80 transition-all flex items-center justify-between group cursor-pointer"
                      onClick={() => {
                        setIsConnectModalOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center ${brand.bg} ${brand.border} ${brand.text}`}
                        >
                          <PlatformIcon platformId={p.id} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-neutral-100 group-hover:text-rose-400 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">{p.authType}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-neutral-600 group-hover:text-rose-400 transition-colors" />
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All platform tokens are encrypted at rest with AES-256-GCM.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
