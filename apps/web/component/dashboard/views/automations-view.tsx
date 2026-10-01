"use client";

import React, { useState } from "react";
import {
  Zap,
  Plus,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon } from "../ui/platform-icon";
import { PlatformId } from "../types";

export function AutomationsView() {
  const { automations, toggleAutomationStatus, createAutomation } = useDashboard();
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);

  // Modal form state
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<PlatformId>("reddit");
  const [targetPlatform, setTargetPlatform] = useState<PlatformId>("telegram");

  const handleCreateRule = () => {
    if (!ruleName) return;
    createAutomation({
      name: ruleName,
      description:
        ruleDescription ||
        `When content is published to ${sourcePlatform}, automatically dispatch formatted announcement to ${targetPlatform}.`,
      sourceType: "post_published",
      sourcePlatform,
      actionType: "cross_post",
      targetPlatform,
      status: "active",
    });
    setIsNewRuleModalOpen(false);
    setRuleName("");
    setRuleDescription("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Rule-based Automation Engine
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Publishing Automations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Build event-driven publishing workflows to cross-post, transform, and mirror content across platforms autonomously.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewRuleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/25 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {automations.map((rule) => (
          <motion.div
            key={rule.id}
            whileHover={{ y: -2 }}
            className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 space-y-5 shadow-2xl relative overflow-hidden group"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full border ${
                      rule.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    {rule.status === "active" ? "● Active" : "Paused"}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {rule.executionsCount} triggers executed
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {rule.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => toggleAutomationStatus(rule.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  rule.status === "active"
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
                }`}
                title={rule.status === "active" ? "Pause automation" : "Resume automation"}
              >
                {rule.status === "active" ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Visual Flow Representation */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {rule.sourcePlatform && (
                  <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                    <PlatformIcon platformId={rule.sourcePlatform} className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="truncate">
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Trigger</div>
                  <div className="font-semibold text-neutral-200 truncate">
                    {rule.sourceTarget || "Post Published"}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-neutral-500 shrink-0 px-1">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex items-center gap-2 min-w-0 text-right justify-end">
                <div className="truncate">
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Action</div>
                  <div className="font-semibold text-neutral-200 truncate">
                    {rule.targetDestination || "Auto Broadcast"}
                  </div>
                </div>
                {rule.targetPlatform && (
                  <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                    <PlatformIcon platformId={rule.targetPlatform} className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {rule.description}
            </p>

            {rule.lastExecutedAt && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 pt-2 border-t border-white/[0.05]">
                <Clock className="w-3 h-3 text-neutral-600" />
                <span>Last run {rule.lastExecutedAt}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* New Automation Modal */}
      <AnimatePresence>
        {isNewRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-white/12 bg-[#090912] shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Configure Publishing Rule</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-300">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. LinkedIn Article → Telegram Dispatch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-300">When post published to:</label>
                    <select
                      value={sourcePlatform}
                      onChange={(e) => setSourcePlatform(e.target.value as PlatformId)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e18] border border-white/10 text-white focus:outline-hidden"
                    >
                      <option value="reddit">Reddit</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-300">Then auto-broadcast to:</label>
                    <select
                      value={targetPlatform}
                      onChange={(e) => setTargetPlatform(e.target.value as PlatformId)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e18] border border-white/10 text-white focus:outline-hidden"
                    >
                      <option value="telegram">Telegram Bot Channel</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="threads">Threads</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-300">Custom Trigger Description</label>
                  <textarea
                    rows={3}
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder="Describe specific filtering rules or transformation conditions..."
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRule}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Activate Rule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
