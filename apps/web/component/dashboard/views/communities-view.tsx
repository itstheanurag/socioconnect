"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Bot,
  Send,
  SlidersHorizontal,
  X,
  Share2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon } from "../ui/platform-icon";
import { Community, PlatformId } from "../types";

export function CommunitiesView() {
  const {
    communities,
    createCommunity,
    connectors,
    bots,
    navigateToCompose,
    openContextualPanel,
  } = useDashboard();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<
    { connectorId: string; platformId: PlatformId; targetName: string; targetType: any }[]
  >([]);

  const handleCreate = () => {
    if (!name) return;
    createCommunity({
      name,
      description,
      color: "#E1306C",
      iconName: "Users",
      destinations:
        selectedDestinations.length > 0
          ? selectedDestinations.map((d, i) => ({ ...d, id: `dest-new-${i}` }))
          : [
              {
                id: "dest-def-1",
                connectorId: "conn-1",
                platformId: "instagram",
                targetName: "@socioconnect.hq",
                targetType: "profile",
              },
              {
                id: "dest-def-2",
                connectorId: "conn-5",
                platformId: "telegram",
                targetName: "@socioconnect_community",
                targetType: "channel",
              },
            ],
      botIds: ["bot-1"],
      totalAudience: 45000,
    });
    setIsCreateModalOpen(false);
    setName("");
    setDescription("");
    setSelectedDestinations([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Audience Graph
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Communities &amp; Audience Networks
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Cluster multiple connected social channels into unified target audiences for 1-click broadcasts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Communities Network Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {communities.map((comm) => {
          const assignedBots = bots.filter((b) => comm.botIds.includes(b.id));

          return (
            <motion.div
              key={comm.id}
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 space-y-5 shadow-2xl flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-rose-400 font-display font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    {comm.totalAudience.toLocaleString()} Reach
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {comm.description}
                  </p>
                </div>

                {/* Destinations Network List */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Destinations ({comm.destinations.length})
                  </div>
                  <div className="space-y-1.5">
                    {comm.destinations.map((dest) => (
                      <div
                        key={dest.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <PlatformIcon platformId={dest.platformId} className="w-3.5 h-3.5 text-white" />
                          <span className="font-medium text-neutral-200">{dest.targetName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          {dest.targetType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Bots */}
                {assignedBots.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                    <Bot className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-mono truncate">
                      Automated by {assignedBots.map((b) => b.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigateToCompose({
                      communityIds: [comm.id],
                      targetPlatforms: comm.destinations.map((d) => d.platformId),
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast Post</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-white/12 bg-[#090912] shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>Create Audience Community</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-300">Community Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Founders &amp; Developers"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-hidden focus:border-rose-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-300">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the audience and channels grouped in this community..."
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-neutral-300">
                    Select Connected Destinations to Bundle:
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    {connectors.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <PlatformIcon platformId={c.platformId} className="w-3.5 h-3.5 text-white" />
                          <span className="text-white">{c.accountHandle}</span>
                          <span className="text-[10px] text-neutral-500">({c.platformName})</span>
                        </div>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDestinations((prev) => [
                                ...prev,
                                {
                                  connectorId: c.id,
                                  platformId: c.platformId,
                                  targetName: c.accountHandle,
                                  targetType: "profile",
                                },
                              ]);
                            } else {
                              setSelectedDestinations((prev) =>
                                prev.filter((d) => d.connectorId !== c.id)
                              );
                            }
                          }}
                          className="rounded accent-rose-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Save Community
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
