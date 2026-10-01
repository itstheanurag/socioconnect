"use client";

import React, { useState } from "react";
import {
  Bot,
  Plus,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { TelegramBot } from "../types";

export function BotsView() {
  const { bots, toggleBotStatus, createBot, communities, openContextualPanel } = useDashboard();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [botName, setBotName] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [botToken, setBotToken] = useState("");
  const [selectedCommIds, setSelectedCommIds] = useState<string[]>(["comm-1"]);

  const handleFinishCreate = () => {
    if (!botName || !botUsername) return;
    createBot({
      name: botName,
      username: botUsername.startsWith("@") ? botUsername : `@${botUsername}`,
      tokenMasked: `${botToken.slice(0, 6)}••••••••:AAHk••••••••••••`,
      status: "active",
      communityIds: selectedCommIds,
      commandsCount: 4,
      webhookStatus: "healthy",
    });
    setIsCreateModalOpen(false);
    setWizardStep(1);
    setBotName("");
    setBotUsername("");
    setBotToken("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Autonomous Dispatchers
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Telegram Bots &amp; Agents
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Deploy autonomous Telegram bots to broadcast formatted posts, manage channel queues, and
            sync cross-network updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setWizardStep(1);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Telegram Bot</span>
        </button>
      </div>

      {/* Bot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bots.map((bot) => (
          <motion.div
            key={bot.id}
            whileHover={{ y: -2 }}
            className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 space-y-5 shadow-2xl relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {bot.name}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400 mt-0.5">{bot.username}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full border ${
                    bot.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  {bot.status === "active" ? "● Active" : "Paused"}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Communities</div>
                <div className="font-bold text-white text-sm">{bot.communityIds.length}</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Scheduled</div>
                <div className="font-bold text-white text-sm">{bot.scheduledQueueCount}</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Webhook</div>
                <div className="font-bold text-emerald-400 text-xs truncate flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Healthy</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => openContextualPanel("bot_info", bot)}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Diagnostics &amp; Logs</span>
                <Info className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBotStatus(bot.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    bot.status === "active"
                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                  }`}
                >
                  {bot.status === "active" ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Telegram Bot Creation Modal Wizard */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl border border-white/12 bg-[#090912] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Create &amp; Connect Telegram Bot
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Step {wizardStep} of 3 • Beginner-friendly setup
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wizard Content */}
              <div className="p-6 space-y-5">
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5 text-xs text-neutral-300">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>How to get a Telegram Bot Token:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
                        <li>Open Telegram and message @BotFather</li>
                        <li>Send /newbot and choose a display name and username</li>
                        <li>Copy the HTTP API access token provided by BotFather</li>
                      </ol>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        Bot Display Name
                      </label>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="e.g. SocioConnect VIP Dispatcher"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-hidden focus:border-cyan-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        Bot Username (@handle)
                      </label>
                      <input
                        type="text"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                        placeholder="e.g. @my_startup_news_bot"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-hidden focus:border-cyan-500/50 font-mono"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        BotFather API Token
                      </label>
                      <input
                        type="password"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="7829103948:AAHk981-LpZ4..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-hidden focus:border-cyan-500/50 font-mono"
                      />
                      <span className="text-[10px] text-neutral-500">
                        Stored encrypted in SocioConnect vault with instant webhook rotation.
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                      <div className="font-semibold text-white">Default Bot Capabilities</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Channel Broadcasting</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Multi-image Galleries</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Markdown Formatting</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Silent Push Notification</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-xs font-medium text-neutral-300">
                      Assign Bot to Target Communities
                    </div>
                    <div className="space-y-2">
                      {communities.map((comm) => (
                        <label
                          key={comm.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">{comm.name}</div>
                            <div className="text-[10px] text-neutral-400">
                              {comm.destinations.length} channel targets
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCommIds.includes(comm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCommIds((prev) => [...prev, comm.id]);
                              } else {
                                setSelectedCommIds((prev) => prev.filter((id) => id !== comm.id));
                              }
                            }}
                            className="rounded accent-cyan-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer */}
              <div className="p-5 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    disabled={wizardStep === 1 && (!botName || !botUsername)}
                    onClick={() => setWizardStep((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishCreate}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deploy &amp; Activate Bot</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
