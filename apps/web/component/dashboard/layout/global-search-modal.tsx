"use client";

import React, { useState, useEffect } from "react";
import { Search, X, FileText, Bot, Radio, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { PlatformIcon } from "@/component/dashboard/ui/platform-icon";

export function GlobalSearchModal() {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    posts,
    bots,
    communities,
    connectors,
    setCurrentSection,
    openContextualPanel,
  } = useDashboard();

  const [query, setQuery] = useState("");

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.baseContent.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredBots = bots.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.username.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredConnectors = connectors.filter(
    (c) =>
      c.accountHandle.toLowerCase().includes(query.toLowerCase()) ||
      c.platformName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isGlobalSearchOpen && (
        <motion.div
          key="global-search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 backdrop-blur-md bg-neutral-950/70"
          onClick={() => setIsGlobalSearchOpen(false)}
        >
          <motion.div
            key="global-search-modal-body"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-neutral-200"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800 bg-neutral-950/40">
              <Search className="w-5 h-5 text-rose-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across posts, bots, communities, connectors, schedules..."
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsGlobalSearchOpen(false)}
                className="px-2 py-1 rounded-lg bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-neutral-700 hover:text-neutral-200 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Posts */}
              {filteredPosts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    Posts ({filteredPosts.length})
                  </span>
                  <div className="space-y-1.5">
                    {filteredPosts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          openContextualPanel("post_details", p);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-neutral-200 group-hover:text-neutral-100">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-md font-sans">
                            {p.baseContent}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                              p.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}
                          >
                            {p.status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bots */}
              {filteredBots.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    Telegram Bots ({filteredBots.length})
                  </span>
                  <div className="space-y-1.5">
                    {filteredBots.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setCurrentSection("bots");
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-200">{b.name}</p>
                            <p className="text-[10px] font-mono text-neutral-400">@{b.username}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 capitalize">
                          {b.webhookStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {filteredCommunities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    Communities ({filteredCommunities.length})
                  </span>
                  <div className="space-y-1.5">
                    {filteredCommunities.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCurrentSection("communities");
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-neutral-200">{c.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-md">
                            {c.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {c.destinations.length} destinations
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connectors */}
              {filteredConnectors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-400" />
                    Connected Accounts ({filteredConnectors.length})
                  </span>
                  <div className="space-y-1.5">
                    {filteredConnectors.map((cn) => (
                      <div
                        key={cn.id}
                        onClick={() => {
                          openContextualPanel("connector_info", cn);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <PlatformIcon platformId={cn.platformId} className="w-4 h-4" />
                          <div>
                            <p className="text-xs font-semibold text-neutral-200">
                              {cn.accountHandle}
                            </p>
                            <p className="text-[10px] font-mono text-neutral-400 capitalize">
                              {cn.platformName}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 capitalize">
                          {cn.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPosts.length === 0 &&
                filteredBots.length === 0 &&
                filteredCommunities.length === 0 &&
                filteredConnectors.length === 0 && (
                  <div className="py-12 text-center text-xs text-neutral-400 font-mono">
                    No matching items found for &quot;{query}&quot;
                  </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
