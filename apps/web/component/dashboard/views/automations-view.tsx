"use client";

import React, { useState } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import {
  PlatformIcon,
  getPlatformBrandColor,
  getPlatformDisplayName,
} from "@/component/dashboard/ui/platform-icon";
import { CustomSelect, CustomSelectOption } from "@/component/dashboard/ui/custom-select";
import { AutomationRule, PlatformId } from "@/component/dashboard/types";

const TRIGGER_OPTIONS: CustomSelectOption[] = [
  { value: "rss", label: "RSS Feed Updates (Blog / Changelog)" },
  { value: "github", label: "GitHub Release Tag Webhook" },
  { value: "substack", label: "Substack Newsletter Dispatch" },
  { value: "webhook", label: "Custom Webhook Endpoint" },
];

export function AutomationsView() {
  const { automations, toggleAutomation } = useDashboard();
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState("rss");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Autonomous Workflows &amp; Rules
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Trigger cross-network distribution automatically from RSS feeds, webhooks, or scheduled
            intervals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewRuleModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow Rule</span>
        </button>
      </div>

      {/* Grid of Automation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((rule) => {
          const isActive = rule.status === "active";
          return (
            <motion.div
              key={rule.id}
              layout
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Card Header & Status Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isActive
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-neutral-800 border border-neutral-700 text-neutral-500"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-neutral-100">
                        {rule.name}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400 capitalize">
                        {rule.sourceType.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAutomation(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Description */}
                <div className="p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800 space-y-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Execution Pipeline
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed capitalize">
                    {rule.description ||
                      `${rule.sourceType.replace(/_/g, " ")} → ${rule.actionType.replace(/_/g, " ")}`}
                  </p>
                </div>

                {/* Target Platform Flow */}
                {rule.targetPlatform && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">
                      Target Destination
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const pid = rule.targetPlatform as PlatformId;
                        const brand = getPlatformBrandColor(pid);
                        return (
                          <span
                            key={pid}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium ${brand.bg} ${brand.border} ${brand.text}`}
                          >
                            <PlatformIcon platformId={pid} className="w-3 h-3" />
                            <span className="capitalize">{getPlatformDisplayName(pid)}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Telemetry */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Last run: {rule.lastExecutedAt || "Never"}</span>
                </div>

                <span className="text-[11px] text-neutral-300 font-semibold">
                  {rule.executionsCount.toLocaleString()} dispatches
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Automation Modal */}
      <AnimatePresence>
        {isNewRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Configure Publishing Rule</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">Trigger Source</label>
                  <CustomSelect
                    value={triggerSource}
                    onChange={setTriggerSource}
                    options={TRIGGER_OPTIONS}
                    className="w-full"
                    buttonClassName="w-full py-2.5 bg-neutral-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">Pipeline Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Adapt summary for X, format longpost for LinkedIn"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-amber-500/50"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewRuleModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewRuleModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold shadow-md shadow-red-600/20 cursor-pointer"
                  >
                    Save Workflow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
