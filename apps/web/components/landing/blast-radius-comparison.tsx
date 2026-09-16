"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

export function BlastRadiusComparison() {
  const [activeTab, setActiveTab] = useState<"socioconnect" | "oldway">("socioconnect");

  return (
    <section className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-12 lowercase">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              <span>the workflow transformation</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              why manual cross-posting burns creator hours.
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600">
              compare juggling 8 different social media tabs every day with socioconnect&apos;s
              unified distribution studio and scheduled timed drops.
            </p>
          </div>

          {/* Interactive Switch */}
          <div className="flex items-center border border-dashed border-[#dfc39a] bg-[#faf8f5] p-1 font-mono text-xs rounded-md">
            <button
              type="button"
              onClick={() => setActiveTab("socioconnect")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                activeTab === "socioconnect"
                  ? "bg-[#F4DCB4] text-stone-900 font-bold shadow-xs border border-[#dfc39a]"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-stone-800" />
              <span>socioconnect studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("oldway")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-sm cursor-pointer ${
                activeTab === "oldway"
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-[#ede8df]"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>the 8-tab juggle</span>
            </button>
          </div>
        </div>

        {/* Comparison Box */}
        <div className="relative border border-[#ede8df] bg-[#faf8f5] p-6 sm:p-10 shadow-xs rounded-md lowercase">
          {activeTab === "socioconnect" ? (
            /* SocioConnect Flow */
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>the unified creator flow</span>
                </div>
                <span className="text-stone-500">effort: 5 minutes per day</span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#ede8df] bg-white p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1">step 01 / draft</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    write in one calm editor
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    compose your video launch, stream drop, or thread in a single distraction-free
                    window.
                  </p>
                </div>

                <div className="border border-[#ede8df] bg-white p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1">step 02 / connect</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    safe one-click logins
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    connect all your channels privately in seconds without ever sharing your
                    passwords.
                  </p>
                </div>

                <div className="border border-dashed border-[#dfc39a] bg-white p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1">step 03 / schedule</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    visual weekly queue
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    slot your releases into weekly calendar times mapped to per-platform audience
                    peak hours.
                  </p>
                </div>

                <div className="border border-[#dfc39a] bg-[#F4DCB4]/40 p-5 rounded-md">
                  <div className="text-stone-800 text-[10px] mb-1 font-bold">step 04 / publish</div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    panic-free automatic drop
                  </div>
                  <p className="text-xs text-stone-700 leading-normal font-sans">
                    channels publish independently. a network glitch on one app never halts your
                    other posts.
                  </p>
                </div>
              </div>

              {/* Status matrix with Real SVG Icons */}
              <div className="border border-[#ede8df] bg-white p-4 font-mono text-xs space-y-2 rounded-md">
                <div className="text-[11px] text-stone-500 font-bold mb-2">
                  unified channel confirmation:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="youtube" size={14} />
                    <span>youtube premiere &amp; post</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> published to youtube
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="twitch" size={14} />
                    <span>twitch go-live alert</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> stream alert
                    broadcasted
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <PlatformIcon platform="instagram" size={14} />
                    <span>instagram caption &amp; reel</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> published to instagram
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-semibold flex items-center gap-2 font-sans">
                    <div className="flex items-center gap-1">
                      <PlatformIcon platform="x" size={13} />
                      <PlatformIcon platform="linkedin" size={13} />
                    </div>
                    <span>x &amp; linkedin</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> published within
                    character limits
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* The Old Way */
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>the old 8-tab juggle</span>
                </div>
                <span className="text-red-600">effort: 50+ minutes of daily friction</span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#ede8df] bg-white p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="youtube" size={12} />
                    <span>step 01 / youtube</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    open youtube studio
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    fill community post, copy link, adjust premiere countdown, wait for upload.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/30 p-5 rounded-md">
                  <div className="text-stone-400 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="twitch" size={12} />
                    <PlatformIcon platform="instagram" size={12} />
                    <span>step 02 / twitch &amp; ig</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    twitch &amp; instagram
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    log into twitch dashboard, paste title. switch to mobile for instagram reel
                    caption.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-md">
                  <div className="text-red-700 text-[10px] mb-1 flex items-center gap-1.5">
                    <PlatformIcon platform="x" size={11} />
                    <PlatformIcon platform="linkedin" size={11} />
                    <span>step 03 / x &amp; linkedin</span>
                  </div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    x threads &amp; linkedin
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    red &apos;-38 chars&apos; error on x! delete sentences manually while
                    reformatting paragraphs on linkedin.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-md">
                  <div className="text-red-700 text-[10px] mb-1">step 04 / glitch</div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    desynchronized drop
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    one network gives an error. your launch is desynchronized and audience
                    engagement breaks.
                  </p>
                </div>
              </div>

              {/* Status matrix */}
              <div className="border border-dashed border-red-300 bg-red-50/40 p-4 font-mono text-xs space-y-2 rounded-md">
                <div className="text-[11px] text-red-800 font-bold mb-2">fragmented outcome:</div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="youtube" size={13} />
                    <PlatformIcon platform="twitch" size={13} />
                    <span>youtube &amp; twitch post</span>
                  </span>
                  <span className="text-stone-500 font-sans text-xs">
                    published, but took 20 minutes of manual reformatting
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="x" size={13} />
                    <span>x (twitter) post</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1 font-sans text-xs">
                    <XCircle className="h-3.5 w-3.5" /> truncated awkwardly mid-sentence
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 flex items-center gap-1.5 font-sans">
                    <PlatformIcon platform="instagram" size={13} />
                    <span>instagram reel drop</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1 font-sans text-xs">
                    <AlertCircle className="h-3.5 w-3.5" /> forgot to post in the chaos
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
