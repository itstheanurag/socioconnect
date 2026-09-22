"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Hash,
  ImagePlus,
  Link as LinkIcon,
  Send,
  Sparkles,
  Zap,
  Film,
  X,
} from "lucide-react";
import { PlatformIcon } from "./landing/platform-icons";

interface SocialAccount {
  id: string;
  platform: string;
  name: string;
  detail: string;
  limit: number;
  selected: boolean;
}

const ACCOUNT_SEED: SocialAccount[] = [
  {
    id: "youtube",
    platform: "youtube",
    name: "Alex Builds",
    detail: "community & shorts",
    limit: 5000,
    selected: true,
  },
  {
    id: "instagram",
    platform: "instagram",
    name: "Alex Creates",
    detail: "@alex.creates",
    limit: 2200,
    selected: true,
  },
  {
    id: "linkedin",
    platform: "linkedin",
    name: "Alex Rivers",
    detail: "creator profile",
    limit: 3000,
    selected: true,
  },
  {
    id: "x",
    platform: "x",
    name: "@alex_builds",
    detail: "creator account",
    limit: 280,
    selected: true,
  },
  {
    id: "tiktok",
    platform: "tiktok",
    name: "@alex_creates",
    detail: "short-form feed",
    limit: 2200,
    selected: true,
  },
  {
    id: "threads",
    platform: "threads",
    name: "@alex.creates",
    detail: "micro-discussions",
    limit: 500,
    selected: true,
  },
  {
    id: "peerlist",
    platform: "peerlist",
    name: "alex_rivers",
    detail: "maker spotlight",
    limit: 1000,
    selected: false,
  },
  {
    id: "reddit",
    platform: "reddit",
    name: "u/alex_dev",
    detail: "r/videos & r/webdev",
    limit: 4000,
    selected: false,
  },
];

const PRESETS = [
  {
    label: "🎬 video premiere",
    text: "Our complete deep dive into creative workflows and queue workers is live! Watch the full 4K breakdown on YouTube.",
  },
  {
    label: "✨ reel caption",
    text: "3 lighting setups that will instantly elevate your talking head videos without spending thousands 💡✨ #creatorgrowth #cinematography",
  },
  {
    label: "🧵 founder thread",
    text: "Why manual social cross-posting is burning your creative energy—and how automated worker queues give you 10 hours back every week 🧵👇",
  },
];

export function ComposerWorkbench() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(ACCOUNT_SEED);
  const [content, setContent] = useState(
    "A calm publishing workflow lets you share with your audience everywhere without getting lost in 8 different browser tabs.",
  );
  const [scheduleMode, setScheduleMode] = useState<"peak" | "simultaneous">("peak");
  const [attachedMedia, setAttachedMedia] = useState<string | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [queued, setQueued] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => account.selected),
    [accounts],
  );

  const canPublish =
    selectedAccounts.length > 0 &&
    content.trim().length > 0 &&
    selectedAccounts.every((account) => content.length <= account.limit);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAccount = (id: string) => {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, selected: !account.selected } : account,
      ),
    );
  };

  const handleAiAdapt = async () => {
    setIsAdapting(true);
    await new Promise((r) => setTimeout(r, 600));
    setContent(
      "A calm publishing workflow lets you share with your audience everywhere without getting lost in 8 tabs ✨ Optimized with platform-specific hashtags & timestamps.",
    );
    setIsAdapting(false);
    showToast("AI adapted post tone & formatting for all active channels!");
  };

  const handleAttachMockMedia = () => {
    if (attachedMedia) {
      setAttachedMedia(null);
      showToast("Removed attached media.");
    } else {
      setAttachedMedia("creator_studio_demo.mp4");
      showToast("Attached 4K video reel (creator_studio_demo.mp4)");
    }
  };

  const handleDispatch = () => {
    setQueued(true);
    showToast(
      scheduleMode === "peak"
        ? `Scheduled staggered peak drop across ${selectedAccounts.length} channels!`
        : `Dispatched simultaneous post to ${selectedAccounts.length} channels!`,
    );
  };

  return (
    <div className="space-y-6 lowercase font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white font-mono text-xs px-4 py-2.5 rounded-md shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5 text-[#F4DCB4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ede8df] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2">
            <Zap className="h-3 w-3 text-stone-800" />
            <span>multi-channel composer</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-emerald-700 font-bold">
              {selectedAccounts.length} channels selected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            compose &amp; dispatch post
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            craft your core message once. tailor formatting with ai, attach media, and schedule
            across all your channels at their peak engagement windows.
          </p>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-stone-400 text-[10px]">presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setContent(preset.text);
                setQueued(false);
              }}
              className="bg-white border border-[#ede8df] hover:border-secondary-border hover:bg-[#faf8f5] px-2.5 py-1 rounded-md text-[11px] text-stone-800 transition-colors cursor-pointer shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Editor & Channel Selector */}
        <div className="lg:col-span-8 space-y-5">
          {/* Target Channel Selector Strip */}
          <div className="border border-[#ede8df] bg-white p-4 rounded-md shadow-xs space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs text-stone-500">
              <span className="font-bold text-stone-900">target channels:</span>
              <span className="text-[11px]">click to toggle active destination</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {accounts.map((account) => {
                const isSelected = account.selected;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-stone-900 bg-white font-bold text-stone-900 shadow-2xs ring-1 ring-stone-900/10"
                        : "border-[#ede8df] bg-[#faf8f5]/60 text-stone-500 hover:border-secondary-border"
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-xs bg-[#faf8f5] border border-[#ede8df]">
                      <PlatformIcon platform={account.id} size={13} />
                    </div>
                    <span>{account.platform}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-stone-900 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Editor Box */}
          <div className="border border-[#ede8df] bg-white rounded-md shadow-xs overflow-hidden">
            <div className="border-b border-[#ede8df] bg-[#faf8f5] px-4 py-2.5 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-stone-900">primary copy</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAiAdapt}
                  disabled={isAdapting}
                  className="flex items-center gap-1.5 border border-secondary-border bg-secondary hover:bg-[#ebd0a3] px-2.5 py-1 rounded-sm text-stone-900 font-bold transition-colors cursor-pointer disabled:opacity-50 text-[11px]"
                >
                  <Sparkles className={`h-3 w-3 ${isAdapting ? "animate-spin" : ""}`} />
                  <span>{isAdapting ? "adapting..." : "ai enhance copy"}</span>
                </button>
                <span className="text-stone-500 text-[11px]">{content.length} chars</span>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setQueued(false);
              }}
              rows={6}
              placeholder="write your announcement, launch story, or stream drop..."
              className="w-full p-4 font-sans text-sm text-stone-900 leading-relaxed border-0 focus:outline-hidden resize-none"
            />

            {/* Attached Media Preview */}
            {attachedMedia && (
              <div className="mx-4 mb-3 p-2.5 bg-[#faf8f5] border border-[#ede8df] rounded-md flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-stone-800">
                  <Film className="h-4 w-4 text-[#dfc39a]" />
                  <span className="font-bold">{attachedMedia}</span>
                  <span className="text-[10px] text-stone-400">(4K H.264 &middot; 24.5 MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedMedia(null)}
                  className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Editor Toolbar & Dispatch Bar */}
            <div className="border-t border-[#ede8df] bg-[#faf8f5]/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAttachMockMedia}
                  className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    attachedMedia
                      ? "border-secondary-border bg-secondary font-bold text-stone-900"
                      : "border-[#ede8df] bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span>{attachedMedia ? "media attached" : "attach media"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContent((prev) => `${prev} #creators #buildinpublic`);
                  }}
                  className="flex items-center gap-1.5 border border-[#ede8df] bg-white px-2.5 py-1.5 rounded-md text-stone-700 hover:border-stone-400 transition-colors cursor-pointer"
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span>hashtags</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContent((prev) => `${prev} https://socioconnect.app`);
                  }}
                  className="flex items-center gap-1.5 border border-[#ede8df] bg-white px-2.5 py-1.5 rounded-md text-stone-700 hover:border-stone-400 transition-colors cursor-pointer"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>link</span>
                </button>
              </div>

              {/* Schedule Mode & Dispatch Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleMode(scheduleMode === "peak" ? "simultaneous" : "peak")}
                  className="flex items-center gap-1.5 border border-[#ede8df] bg-white px-3 py-1.5 rounded-md text-stone-800 hover:border-secondary-border transition-colors cursor-pointer"
                >
                  <Clock3 className="h-3.5 w-3.5 text-[#dfc39a]" />
                  <span>{scheduleMode === "peak" ? "⚡ AI Peak Hours" : "🚀 Simultaneous"}</span>
                </button>

                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={handleDispatch}
                  className="flex items-center gap-2 border border-secondary-border bg-secondary hover:bg-[#ebd0a3] px-4 py-1.5 rounded-md font-bold text-stone-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{scheduleMode === "peak" ? "schedule peak drop" : "dispatch now"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner if Dispatched */}
          {queued && (
            <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-md flex items-center justify-between font-mono text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>
                  post queued across {selectedAccounts.length} channels with 100% private account
                  safety.
                </span>
              </div>
              <span className="font-bold text-[11px]">● scheduled</span>
            </div>
          )}
        </div>

        {/* Right Column: Character Limits & Live Channel Previews */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-[#ede8df] bg-white p-5 rounded-md shadow-xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2.5">
              <span className="font-bold text-stone-900">channel character meters</span>
              <span className="text-[11px] text-stone-400">live constraints</span>
            </div>

            <div className="space-y-2">
              {accounts
                .filter((a) => a.selected)
                .map((account) => {
                  const remaining = account.limit - content.length;
                  const isOver = remaining < 0;

                  return (
                    <div
                      key={account.id}
                      className={`p-2.5 border rounded-md transition-all flex items-center justify-between ${
                        isOver
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-[#ede8df] bg-[#faf8f5]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-white border border-[#ede8df]">
                          <PlatformIcon platform={account.id} size={13} />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{account.name}</div>
                          <div className="text-[10px] text-stone-400">{account.detail}</div>
                        </div>
                      </div>

                      <span
                        className={`font-bold text-[11px] ${
                          isOver ? "text-red-700" : "text-stone-700"
                        }`}
                      >
                        {remaining} left
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
