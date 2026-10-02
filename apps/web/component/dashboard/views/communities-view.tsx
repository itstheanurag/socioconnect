"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Compass,
  CheckCircle2,
  Trash2,
  Radio,
  Tag,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { useNotification } from "@/context/notification-context";
import { PlatformIcon, getPlatformBrandColor, getPlatformDisplayName } from "@/component/dashboard/ui/platform-icon";
import { PlatformId } from "@/component/dashboard/types";

export function CommunitiesView() {
  const { communities, addCommunity, deleteCommunity } = useDashboard();
  const { toast } = useNotification();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New community form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(["twitter", "linkedin"]);

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name Required", "Please provide a name for the community group.");
      return;
    }

    addCommunity({
      name,
      description,
      color: "#E1306C",
      iconName: "Users",
      totalAudience: Math.floor(Math.random() * 80000) + 5000,
      botIds: [],
      destinations: selectedPlatforms.map((pid, idx) => ({
        id: `dest-${pid}-${idx}`,
        connectorId: `conn-${pid}`,
        platformId: pid,
        targetName: `#${name.toLowerCase().replace(/\s+/g, "")}`,
        targetType: "channel" as const,
      })),
    });

    setName("");
    setDescription("");
    setIsCreateModalOpen(false);
  };

  const togglePlatform = (p: PlatformId) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Target Audience Communities
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Group your subreddits, telegram groups, and social circles into reusable broadcast
            targets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Community Group</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((c) => {
          return (
            <div
              key={c.id}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Community Title & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-neutral-100">{c.name}</h3>
                      <p className="text-[11px] font-mono text-neutral-400">
                        {c.totalAudience.toLocaleString()} est. members
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteCommunity(c.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete community group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                  {c.description}
                </p>

                {/* Destination Platforms Included */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">
                    Destinations ({c.destinations.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.destinations.map((dest, i) => {
                      const brand = getPlatformBrandColor(dest.platformId);
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium ${brand.bg} ${brand.border} ${brand.text}`}
                        >
                          <PlatformIcon platformId={dest.platformId} className="w-3 h-3" />
                          <span className="capitalize font-mono">{dest.targetName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer and Status */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="text-[10px] font-mono text-neutral-500">
                  {c.destinations.length} channels connected
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>Create Audience Community</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">Community Group Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Frontend Engineers & React Devs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the intended audience..."
                    className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-medium">
                    Include Destination Channels
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "twitter",
                        "linkedin",
                        "reddit",
                        "telegram",
                        "instagram",
                        "threads",
                      ] as PlatformId[]
                    ).map((pid) => {
                      const isSel = selectedPlatforms.includes(pid);
                      const brand = getPlatformBrandColor(pid);
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => togglePlatform(pid)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? `${brand.bg} ${brand.border} ${brand.text} font-semibold`
                              : "bg-neutral-950/40 border-neutral-800 text-neutral-400 opacity-60"
                          }`}
                        >
                          <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                          <span className="capitalize text-xs">{getPlatformDisplayName(pid)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold shadow-md shadow-red-600/20 cursor-pointer"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
