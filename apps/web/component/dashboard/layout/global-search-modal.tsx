"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  Users,
  Bot,
  Radio,
  PenTool,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon } from "../ui/platform-icon";

export function GlobalSearchModal() {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    posts,
    communities,
    bots,
    connectors,
    setCurrentSection,
    openContextualPanel,
    navigateToCompose,
  } = useDashboard();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
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

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredBots = bots.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.username.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredConnectors = connectors.filter(
    (c) =>
      c.accountHandle.toLowerCase().includes(query.toLowerCase()) ||
      c.platformName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 backdrop-blur-md bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-2xl rounded-3xl border border-white/12 bg-[#090912] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
            <Search className="w-5 h-5 text-rose-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across posts, bots, communities, connectors, schedules..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setIsGlobalSearchOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          {!query && (
            <div className="p-4 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchOpen(false);
                    navigateToCompose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-left text-xs text-white transition-all cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-rose-400" />
                  <span>Compose Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchOpen(false);
                    setCurrentSection("calendar");
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-left text-xs text-white transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>Calendar View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchOpen(false);
                    setCurrentSection("bots");
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-left text-xs text-white transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manage Bots</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchOpen(false);
                    setCurrentSection("connectors");
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-left text-xs text-white transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Connectors</span>
                </button>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Posts */}
            {filteredPosts.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <FileText className="w-3 h-3 text-rose-400" />
                  <span>Posts ({filteredPosts.length})</span>
                </div>
                {filteredPosts.slice(0, 4).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      openContextualPanel("post_details", post);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-left transition-all cursor-pointer group"
                  >
                    <div className="space-y-0.5 truncate mr-3">
                      <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors truncate">
                        {post.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {post.baseContent}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center -space-x-1">
                        {post.targetPlatforms.map((p) => (
                          <div
                            key={p}
                            className="w-4 h-4 rounded-full bg-[#121222] border border-white/10 flex items-center justify-center p-0.5"
                          >
                            <PlatformIcon platformId={p} className="w-2.5 h-2.5 text-white" />
                          </div>
                        ))}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Communities */}
            {filteredCommunities.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Users className="w-3 h-3 text-sky-400" />
                  <span>Communities ({filteredCommunities.length})</span>
                </div>
                {filteredCommunities.map((comm) => (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      setCurrentSection("communities");
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{comm.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-md">
                        {comm.description}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {comm.destinations.length} channels
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Bots */}
            {filteredBots.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span>Bots ({filteredBots.length})</span>
                </div>
                {filteredBots.map((bot) => (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      setCurrentSection("bots");
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{bot.name}</div>
                      <div className="text-[11px] font-mono text-emerald-400">{bot.username}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ● Active
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Connectors */}
            {filteredConnectors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>Connectors ({filteredConnectors.length})</span>
                </div>
                {filteredConnectors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      setCurrentSection("connectors");
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <PlatformIcon platformId={c.platformId} className="w-4 h-4 text-white" />
                      <div>
                        <div className="text-xs font-semibold text-white">{c.platformName}</div>
                        <div className="text-[11px] font-mono text-neutral-400">
                          {c.accountHandle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Connected ✓</span>
                  </button>
                ))}
              </div>
            )}

            {query &&
              filteredPosts.length === 0 &&
              filteredCommunities.length === 0 &&
              filteredBots.length === 0 &&
              filteredConnectors.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No matching items found for &ldquo;{query}&rdquo;
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
