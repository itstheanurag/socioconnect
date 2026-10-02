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

  if (!isGlobalSearchOpen) return null;

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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 backdrop-blur-md bg-neutral-950/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Posts ({filteredPosts.length})</span>
                </div>
                <div className="space-y-1">
                  {filteredPosts.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        openContextualPanel("post_details", p);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/60 transition-colors text-left group cursor-pointer border border-transparent hover:border-neutral-800"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300 truncate">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {p.baseContent}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                          {p.status}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bots */}
            {filteredBots.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telegram Dispatchers ({filteredBots.length})</span>
                </div>
                <div className="space-y-1">
                  {filteredBots.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        setCurrentSection("bots");
                        openContextualPanel("bot_info", b);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/60 transition-colors text-left group cursor-pointer border border-transparent hover:border-neutral-800"
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300">
                          {b.name}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">{b.username}</div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                        {b.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Communities */}
            {filteredCommunities.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Communities ({filteredCommunities.length})</span>
                </div>
                <div className="space-y-1">
                  {filteredCommunities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        setCurrentSection("communities");
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/60 transition-colors text-left group cursor-pointer border border-transparent hover:border-neutral-800"
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">{c.description}</div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {c.destinations.length} destinations
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Connectors */}
            {filteredConnectors.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Connected Channels ({filteredConnectors.length})</span>
                </div>
                <div className="space-y-1">
                  {filteredConnectors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        setCurrentSection("connectors");
                        openContextualPanel("connector_info", c);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/60 transition-colors text-left group cursor-pointer border border-transparent hover:border-neutral-800"
                    >
                      <div className="flex items-center gap-2">
                        <PlatformIcon platformId={c.platformId} className="w-4 h-4" />
                        <div>
                          <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300">
                            {c.platformName}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400">
                            {c.accountHandle}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Active</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length === 0 &&
              filteredBots.length === 0 &&
              filteredCommunities.length === 0 &&
              filteredConnectors.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No matching entities found for &quot;{query}&quot;
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
