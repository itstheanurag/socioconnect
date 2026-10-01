"use client";

import React, { useState } from "react";
import {
  Radio,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { COMPLETE_PLATFORM_POOL } from "@/component/icons/social-icons";
import { ConnectorAccount, PlatformId } from "../types";

export function ConnectorsView() {
  const { connectors, toggleConnectorSync, openContextualPanel } = useDashboard();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [expandedCapabilitiesId, setExpandedCapabilitiesId] = useState<string | null>(null);

  const toggleExpandCaps = (id: string) => {
    setExpandedCapabilitiesId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Active Integrations &amp; OAuth
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Connected Social Accounts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage authenticated platform API tokens, inspect native capability boundaries, and refresh OAuth permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connectors.map((connector) => {
          const brand = getPlatformBrandColor(connector.platformId);
          const isExpanded = expandedCapabilitiesId === connector.id;
          const caps = connector.capabilities;

          return (
            <motion.div
              key={connector.id}
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 space-y-5 shadow-2xl relative overflow-hidden group"
            >
              {/* Account Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${brand.bg} ${brand.border} ${brand.text} shadow-md`}
                  >
                    <PlatformIcon platformId={connector.platformId} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                      {connector.platformName}
                    </h3>
                    <div className="text-xs font-mono text-neutral-400 mt-0.5">
                      {connector.accountHandle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </div>
              </div>

              {/* Status and Telemetry */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Last Synced
                  </div>
                  <div className="font-semibold text-white font-mono text-xs">
                    {connector.lastSyncAt}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Audience Reach
                  </div>
                  <div className="font-semibold text-white font-mono text-xs">
                    {connector.stats.followers
                      ? `${(connector.stats.followers / 1000).toFixed(1)}k Followers`
                      : connector.stats.members
                      ? `${(connector.stats.members / 1000).toFixed(1)}k Members`
                      : `${connector.stats.postsCount} Posts`}
                  </div>
                </div>
              </div>

              {/* Expandable Capability Spec */}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <button
                  type="button"
                  onClick={() => toggleExpandCaps(connector.id)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Native Format Capabilities</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-2 text-[11px] pt-2"
                    >
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-neutral-400">Max Text:</span>{" "}
                        <span className="text-white font-mono">{caps.maxTextLength} chars</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-neutral-400">Carousel:</span>{" "}
                        <span className="text-white font-mono">
                          {caps.carousel ? `Yes (${caps.maxCarouselImages} imgs)` : "No"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-neutral-400">Audio Music:</span>{" "}
                        <span className="text-white font-mono">{caps.audioMusic ? "Supported" : "No"}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-neutral-400">Threading:</span>{" "}
                        <span className="text-white font-mono">{caps.threading ? "Supported" : "No"}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => openContextualPanel("connector_info", connector)}
                  className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Inspect Credentials
                </button>

                <button
                  type="button"
                  onClick={() => toggleConnectorSync(connector.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Force Sync</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connect Account Modal with 32+ Social Platforms */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-white/12 bg-[#090912] shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Radio className="w-4 h-4 text-rose-400" />
                  <span>Connect Social Network Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPLETE_PLATFORM_POOL.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setIsConnectModalOpen(false);
                          toggleConnectorSync("conn-1");
                        }}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 text-left transition-all cursor-pointer group"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${p.color}18`, color: p.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 capitalize font-mono">
                            {p.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
