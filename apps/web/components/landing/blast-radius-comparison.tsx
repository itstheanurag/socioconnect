"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Sparkles, XCircle, Clock, Zap } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

export function BlastRadiusComparison() {
  const [activeTab, setActiveTab] = useState<"socioconnect" | "oldway">("socioconnect");

  return (
    <section className="relative py-16 lg:py-24 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-12 lowercase">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              <span>the daily creator workflow upgrade</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              why manual cross-posting burns your best creative hours.
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600">
              compare juggling 8 different browser tabs every single day with socioconnect&apos;s
              calm unified studio and timed peak-hour drops.
            </p>
          </div>

          {/* Interactive Switch */}
          <div className="flex items-center border border-dashed border-secondary-border bg-[#faf8f5] p-1 font-mono text-xs rounded-md">
            <button
              type="button"
              onClick={() => setActiveTab("socioconnect")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                activeTab === "socioconnect"
                  ? "bg-secondary text-stone-900 font-bold shadow-xs border border-secondary-border"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-stone-800" />
              <span>socioconnect calm flow</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("oldway")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                activeTab === "oldway"
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-line"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>the 8-tab chaos</span>
            </button>
          </div>
        </div>

        {/* Comparison Box */}
        <div className="relative border border-line bg-[#faf8f5] p-6 sm:p-10 shadow-xs rounded-md lowercase">
          {activeTab === "socioconnect" ? (
            /* SocioConnect Flow */
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-4 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>the calm creator workflow</span>
                </div>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-xs border border-emerald-200">
                  ⚡ 5 minutes daily total
                </span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-line bg-white p-5 rounded-md shadow-2xs">
                  <div className="text-stone-400 text-[10px] mb-1">step 01 / draft</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    write in one calm editor
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    draft your video drop, reel caption, or newsletter snippet in a distraction-free
                    studio with smart character meters.
                  </p>
                </div>

                <div className="border border-line bg-white p-5 rounded-md shadow-2xs">
                  <div className="text-stone-400 text-[10px] mb-1">step 02 / adapt</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    ai formats per platform
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    automatically adapt tone, split long threads, format hashtags, and set flairs
                    for reddit and discord.
                  </p>
                </div>

                <div className="border border-dashed border-secondary-border bg-white p-5 rounded-md shadow-2xs">
                  <div className="text-stone-400 text-[10px] mb-1">step 03 / schedule</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    drag-and-drop calendar
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    slot your releases into peak audience hours so your morning commuters and
                    evening streamers both see you.
                  </p>
                </div>

                <div className="border border-secondary-border bg-secondary/40 p-5 rounded-md shadow-2xs">
                  <div className="text-stone-800 text-[10px] mb-1 font-bold">step 04 / publish</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    reliable automated drops
                  </div>
                  <p className="text-xs text-stone-700 leading-normal font-sans">
                    each network publishes independently. a network hiccup on one app never halts or
                    breaks your other posts.
                  </p>
                </div>
              </div>

              {/* Status matrix with Real SVG Icons */}
              <div className="border border-line bg-white p-4 font-mono text-xs space-y-2 rounded-md">
                <div className="text-[11px] text-stone-500 font-bold mb-2">
                  unified channel confirmation:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="youtube" size={14} />
                    <span>youtube video &amp; community post</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> published to youtube
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="instagram" size={14} />
                    <span>instagram reel &amp; carousel</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> reel published with
                    tags
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="linkedin" size={14} />
                    <span>linkedin story &amp; takeaways</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> published during
                    morning peak
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="x" size={14} />
                    <span>x (twitter) thread</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 3-tweet thread live
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* The Old Way */
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-4 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>the daily 8-tab juggle</span>
                </div>
                <span className="text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded-xs border border-red-200">
                  ⚠️ 45+ minutes of daily manual friction
                </span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-line bg-white p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="youtube" size={12} />
                    <span>step 01 / youtube studio</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    open studio tab
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    copy title, adjust description, set premiere time, format community poll.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/30 p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="instagram" size={12} />
                    <PlatformIcon platform="tiktok" size={12} />
                    <span>step 02 / reels &amp; tiktok</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    mobile juggling
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    airdrop video to phone, paste caption, retype hashtags, select audio tags.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-md">
                  <div className="text-red-700 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="x" size={11} />
                    <PlatformIcon platform="linkedin" size={11} />
                    <span>step 03 / x &amp; linkedin</span>
                  </div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    character errors
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    red &apos;-42 chars&apos; error on x! manually trim sentences while reformatting
                    line breaks on linkedin.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-md">
                  <div className="text-red-700 text-[10px] mb-1">step 04 / forgotten post</div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    broken schedule
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    get distracted mid-day and forget to post on 2 channels. your launch is
                    desynchronized.
                  </p>
                </div>
              </div>

              {/* Status matrix */}
              <div className="border border-dashed border-red-300 bg-red-50/40 p-4 font-mono text-xs space-y-2 rounded-md">
                <div className="text-[11px] text-red-800 font-bold mb-2">fragmented outcome:</div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="youtube" size={13} />
                    <span>youtube video post</span>
                  </span>
                  <span className="text-stone-500 font-sans text-xs">
                    published, but took 15 minutes of manual reformatting
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="x" size={13} />
                    <span>x (twitter) post</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1 font-sans text-xs">
                    <XCircle className="h-3.5 w-3.5" /> trimmed awkwardly to fit character limit
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="instagram" size={13} />
                    <span>instagram reel drop</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1 font-sans text-xs">
                    <AlertCircle className="h-3.5 w-3.5" /> forgotten during afternoon meetings
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
