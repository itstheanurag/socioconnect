"use client";

import React, { useState } from "react";
import {
  Bot,
  Plus,
  Radio,
  Key,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { useNotification } from "@/context/notification-context";
import { TelegramBot } from "../types";

export function BotsView() {
  const { bots, addBot, toggleBotStatus, deleteBot, openContextualPanel } = useDashboard();
  const { toast } = useNotification();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [botName, setBotName] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");

  const handleRegisterBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim() || !botToken.trim()) {
      toast.error("Required Fields Missing", "Please enter the Bot Name and Bot Father API Token.");
      return;
    }

    const cleanUsername = botUsername.startsWith("@") ? botUsername : `@${botUsername || "bot"}`;
    const tokenMask = `${botToken.slice(0, 6)}...${botToken.slice(-4)}`;

    addBot({
      name: botName,
      username: cleanUsername,
      tokenMasked: tokenMask,
      status: "active",
      communityIds: [],
      commandsCount: 4,
      webhookStatus: "healthy",
      scheduledQueueCount: 0,
      lastActive: "Just now",
    });

    setBotName("");
    setBotUsername("");
    setBotToken("");
    setChatId("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Telegram Dispatcher Bots
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Connect custom Telegram bots to broadcast formatted posts, markdown alerts, and media
            into channels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Telegram Bot</span>
        </button>
      </div>

      {/* Grid of Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <motion.div
            key={bot.id}
            layout
            className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div className="space-y-3">
              {/* Bot Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-neutral-100">{bot.name}</h3>
                    <p className="text-[11px] font-mono text-cyan-400">{bot.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteBot(bot.id)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete bot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bot Specs and Token */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800">
                  <span className="text-neutral-400 text-[11px]">API Token</span>
                  <span className="font-mono text-neutral-300 text-[11px]">{bot.tokenMasked}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase font-mono">Queue</span>
                    <div className="text-neutral-200 font-semibold font-mono mt-0.5">
                      {bot.scheduledQueueCount} pending
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase font-mono">
                      Telemetry
                    </span>
                    <div className="text-neutral-400 text-[11px] font-mono mt-0.5 truncate">
                      {bot.lastActive}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleBotStatus(bot.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  bot.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    bot.status === "active" ? "bg-emerald-400" : "bg-neutral-500"
                  }`}
                />
                <span className="capitalize">{bot.status}</span>
              </button>

              <button
                type="button"
                onClick={() => openContextualPanel("bot_info", bot)}
                className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 text-xs transition-colors cursor-pointer"
              >
                Inspect
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Telegram Bot Creation Modal Wizard */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100">
                      Create &amp; Connect Telegram Bot
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Configure dispatcher bot with BotFather API token
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form & BotFather Guide */}
              <form onSubmit={handleRegisterBot} className="p-5 space-y-4 text-xs">
                {/* How to get token guide alert */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5 text-neutral-300">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to get your Bot API Token in 30 seconds:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-400">
                    <li>
                      Open Telegram and message{" "}
                      <span className="font-mono text-cyan-300">@BotFather</span>
                    </li>
                    <li>
                      Send command <span className="font-mono text-cyan-300">/newbot</span> and
                      follow naming steps
                    </li>
                    <li>Copy the provided HTTP API token and paste below</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-medium">Bot Display Name</label>
                    <input
                      type="text"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="e.g. SocioConnect News Dispatcher"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-medium">Telegram Bot Username</label>
                    <input
                      type="text"
                      value={botUsername}
                      onChange={(e) => setBotUsername(e.target.value)}
                      placeholder="e.g. @SocioNewsBot"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">
                    Bot API Token (from @BotFather)
                  </label>
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 font-mono focus:outline-hidden focus:border-cyan-500/50"
                  />
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
                    Save &amp; Connect Bot
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
