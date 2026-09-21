"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Clock,
  Send,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { PlatformIcon } from "../../../components/landing/platform-icons";

interface BotConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: "active" | "paused";
  confidenceScore: number;
  totalAutomations: number;
  lastRun: string;
  icon: typeof Sparkles;
  platforms: string[];
  settings: {
    autoApply: boolean;
    tone: string;
    sensitivity: string;
  };
}

const INITIAL_BOTS: BotConfig[] = [
  {
    id: "format-adapter",
    name: "content adaptation bot",
    tagline: "one raw draft → native channel formatting",
    description:
      "automatically crafts reel captions with sound hooks, youtube descriptions with timestamps, and 4-part x threads from one source idea.",
    status: "active",
    confidenceScore: 96,
    totalAutomations: 142,
    lastRun: "12 mins ago",
    icon: Sparkles,
    platforms: ["youtube", "instagram", "x", "linkedin", "tiktok", "threads"],
    settings: {
      autoApply: true,
      tone: "authoritative storyteller",
      sensitivity: "high",
    },
  },
  {
    id: "peak-timing",
    name: "audience peak timing bot",
    tagline: "calculates optimal drop hours per timezone",
    description:
      "analyzes your follower activity patterns to schedule youtube premieres at 4 pm, linkedin at 8:30 am, and instagram reels at 12:30 pm.",
    status: "active",
    confidenceScore: 99,
    totalAutomations: 388,
    lastRun: "3 mins ago",
    icon: Clock,
    platforms: ["youtube", "twitch", "instagram", "linkedin", "x"],
    settings: {
      autoApply: true,
      tone: "adaptive",
      sensitivity: "smart-staggered",
    },
  },
  {
    id: "autonomous-dispatcher",
    name: "autonomous queue & retry bot",
    tagline: "decoupled worker pipelines with zero drop rate",
    description:
      "monitors platform rate limits, manages token renewal, and automatically handles exponential backoff retries if an api endpoint stalls.",
    status: "active",
    confidenceScore: 100,
    totalAutomations: 1204,
    lastRun: "just now",
    icon: Send,
    platforms: ["youtube", "instagram", "x", "linkedin", "tiktok", "peerlist", "reddit"],
    settings: {
      autoApply: true,
      tone: "resilient",
      sensitivity: "max-retry",
    },
  },
  {
    id: "evergreen-repurpose",
    name: "evergreen content repurposer",
    tagline: "resurfaces top-performing creative ideas",
    description:
      "identifies high-engagement past posts and suggests fresh variations, audio pairings, or thread summaries for under-served channels.",
    status: "paused",
    confidenceScore: 89,
    totalAutomations: 45,
    lastRun: "2 days ago",
    icon: RefreshCw,
    platforms: ["linkedin", "x", "threads", "bluesky"],
    settings: {
      autoApply: false,
      tone: "punchy & viral",
      sensitivity: "moderate",
    },
  },
];

interface BotLog {
  id: string;
  time: string;
  botId: string;
  botName: string;
  action: string;
  platform: string;
  status: "applied" | "suggested" | "queued";
}

const RECENT_LOGS: BotLog[] = [
  {
    id: "log-1",
    time: "4 mins ago",
    botId: "peak-timing",
    botName: "audience peak timing bot",
    action: "slotted youtube premiere to thursday 04:00 pm (+42% projected reach)",
    platform: "youtube",
    status: "applied",
  },
  {
    id: "log-2",
    time: "18 mins ago",
    botId: "format-adapter",
    botName: "content adaptation bot",
    action: "generated 4-tweet thread structure with call-to-action link",
    platform: "x",
    status: "applied",
  },
  {
    id: "log-3",
    time: "45 mins ago",
    botId: "format-adapter",
    botName: "content adaptation bot",
    action: "trimmed instagram caption to 2,200 char budget and added 4 niche tags",
    platform: "instagram",
    status: "applied",
  },
  {
    id: "log-4",
    time: "1 hour ago",
    botId: "autonomous-dispatcher",
    botName: "autonomous queue bot",
    action: "refreshed oauth 2.0 delegated token for tiktok creator api",
    platform: "tiktok",
    status: "applied",
  },
  {
    id: "log-5",
    time: "3 hours ago",
    botId: "evergreen-repurpose",
    botName: "evergreen repurposer",
    action: "suggested re-framing 10k-view video into a linkedin founder takeaway",
    platform: "linkedin",
    status: "suggested",
  },
];

export default function BotsPage() {
  const [bots, setBots] = useState<BotConfig[]>(INITIAL_BOTS);
  const [selectedTone, setSelectedTone] = useState<string>("authoritative storyteller");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleBotStatus = (botId: string) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id === botId) {
          const nextStatus = b.status === "active" ? "paused" : "active";
          return { ...b, status: nextStatus };
        }
        return b;
      }),
    );
    const target = bots.find((b) => b.id === botId);
    showToast(
      target?.status === "active"
        ? `Paused ${target.name}.`
        : `Activated ${target?.name} in auto-dispatch mode!`,
    );
  };

  return (
    <div className="space-y-8 lowercase">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white font-mono text-xs px-4 py-2.5 rounded-md shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5 text-[#F4DCB4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ede8df] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2">
            <Bot className="h-3 w-3 text-stone-800" />
            <span>autonomous creator assistants</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-emerald-700 font-bold">3 of 4 active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
            ai workflow bots &amp; automation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-2xl">
            quiet assistants that work behind the scenes. they adapt formats, time your releases, and
            guarantee reliable delivery without requiring tedious manual oversight.
          </p>
        </div>

        {/* Global AI Tone Selector */}
        <div className="flex items-center gap-2 font-mono text-xs bg-white border border-[#ede8df] p-1.5 rounded-md shadow-2xs">
          <Sliders className="h-3.5 w-3.5 text-stone-500 shrink-0" />
          <span className="text-stone-400 text-[10px]">voice tone:</span>
          <select
            value={selectedTone}
            onChange={(e) => {
              setSelectedTone(e.target.value);
              showToast(`Updated default voice tone to: "${e.target.value}"`);
            }}
            aria-label="Select default voice tone"
            className="bg-transparent border-0 font-bold text-stone-900 focus:outline-hidden cursor-pointer"
          >
            <option value="authoritative storyteller">storyteller &amp; builder</option>
            <option value="punchy & viral">punchy &amp; concise</option>
            <option value="casual & authentic">casual &amp; authentic</option>
            <option value="minimalist insight">minimalist insight</option>
          </select>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {bots.map((bot) => {
          const isActive = bot.status === "active";
          const Icon = bot.icon;

          return (
            <div
              key={bot.id}
              className={`border p-6 rounded-md transition-all flex flex-col justify-between space-y-5 ${
                isActive
                  ? "border-[#ede8df] bg-white shadow-2xs hover:border-[#dfc39a]"
                  : "border-[#ede8df] bg-white/60 opacity-80"
              }`}
            >
              {/* Header & Toggle */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#ede8df] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#ede8df] bg-[#faf8f5] shadow-2xs text-stone-800">
                      <Icon className="h-5 w-5 text-[#dfc39a]" />
                    </div>
                    <div>
                      <div className="font-bold text-base text-stone-900 font-sans">
                        {bot.name}
                      </div>
                      <div className="font-mono text-xs text-stone-400">{bot.tagline}</div>
                    </div>
                  </div>

                  {/* Active / Paused Switch */}
                  <button
                    type="button"
                    onClick={() => toggleBotStatus(bot.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm font-mono text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-stone-100 text-stone-500 border border-stone-200"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>active</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-stone-400" />
                        <span>paused</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                  {bot.description}
                </p>

                {/* Supported Channels Strip */}
                <div className="mt-4 pt-3 border-t border-[#ede8df] flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-stone-400">supported channels:</span>
                  <div className="flex items-center gap-1.5">
                    {bot.platforms.map((p) => (
                      <div
                        key={p}
                        className="flex h-5 w-5 items-center justify-center rounded-xs border border-[#ede8df] bg-[#faf8f5]"
                      >
                        <PlatformIcon platform={p} size={11} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bot Metrics & Telemetry */}
              <div className="pt-3 border-t border-dashed border-[#ede8df] grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-[#faf8f5] p-2.5 rounded-md border border-[#ede8df]">
                  <span className="text-[10px] text-stone-400 block">accuracy rate</span>
                  <span className="font-bold text-stone-800">{bot.confidenceScore}%</span>
                </div>
                <div className="bg-[#faf8f5] p-2.5 rounded-md border border-[#ede8df]">
                  <span className="text-[10px] text-stone-400 block">actions taken</span>
                  <span className="font-bold text-stone-800">{bot.totalAutomations}</span>
                </div>
                <div className="bg-[#faf8f5] p-2.5 rounded-md border border-[#ede8df]">
                  <span className="text-[10px] text-stone-400 block">last executed</span>
                  <span className="font-bold text-stone-800 truncate block">{bot.lastRun}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bot Execution Logs Feed */}
      <div className="border border-[#ede8df] bg-white p-6 rounded-md shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-800">
            <Zap className="h-4 w-4 text-[#dfc39a]" />
            <span>recent autonomous bot activity log</span>
          </div>
          <span className="font-mono text-[10px] text-stone-400">live feed &middot; 100% auditable</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {RECENT_LOGS.map((log) => (
            <div
              key={log.id}
              className="p-3 border border-[#ede8df] bg-[#faf8f5] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-white border border-[#ede8df] shrink-0">
                  <PlatformIcon platform={log.platform} size={12} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 mr-2">{log.botName}:</span>
                  <span className="text-stone-700">{log.action}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] text-stone-400">
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>{log.status}</span>
                </span>
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
