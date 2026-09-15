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
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-12">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              THE WORKFLOW TRANSFORMATION
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Why manual cross-posting burns creator hours.
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600">
              Compare juggling 8 different social tabs every day with SocioConnect&apos;s unified
              distribution studio and fault-isolated drops.
            </p>
          </div>

          {/* Interactive Switch */}
          <div className="flex items-center border border-dashed border-[#dfc39a] bg-[#faf8f5] p-1 font-mono text-xs rounded-xs">
            <button
              onClick={() => setActiveTab("socioconnect")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-xs ${
                activeTab === "socioconnect"
                  ? "bg-[#F4DCB4] text-stone-900 font-bold shadow-xs border border-[#dfc39a]"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-stone-800" />
              SOCIOCONNECT DISPATCHER
            </button>
            <button
              onClick={() => setActiveTab("oldway")}
              className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-xs ${
                activeTab === "oldway"
                  ? "bg-white text-stone-900 font-bold shadow-xs border border-[#ede8df]"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400" />
              THE 8-TAB JUGGLE
            </button>
          </div>
        </div>

        {/* Comparison Box */}
        <div className="relative border border-[#ede8df] bg-[#faf8f5] p-6 sm:p-10 shadow-xs">
          {activeTab === "socioconnect" ? (
            /* SocioConnect Flow */
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>THE UNIFIED CREATOR FLOW</span>
                </div>
                <span className="text-stone-500">EFFORT: 5 MINUTES PER DAY</span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#ede8df] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 01 / DRAFT
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Write in One Calm Editor
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Compose your video launch, stream drop, or thread in a single distraction-free
                    window.
                  </p>
                </div>

                <div className="border border-[#ede8df] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 02 / CONNECT
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Zero-Password OAuth Vault
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    All apps connect via official developer OAuth 2.0 with AES-256 encrypted tokens.
                  </p>
                </div>

                <div className="border border-dashed border-[#dfc39a] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 03 / SCHEDULE
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Visual Weekly Queue
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Slot your releases into weekly calendar times mapped to per-platform audience
                    peak hours.
                  </p>
                </div>

                <div className="border border-[#dfc39a] bg-[#F4DCB4]/40 p-5 rounded-xs">
                  <div className="text-stone-800 text-[10px] mb-1 uppercase tracking-wider font-bold">
                    STEP 04 / BROADCAST
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Panic-Free Outbound Drop
                  </div>
                  <p className="text-xs text-stone-700 leading-normal font-sans">
                    Apps publish independently. A network glitch on one platform never halts your
                    other posts.
                  </p>
                </div>
              </div>

              {/* Status matrix with Real SVG Icons */}
              <div className="border border-[#ede8df] bg-white p-4 font-mono text-xs space-y-2 rounded-xs">
                <div className="text-[11px] uppercase text-stone-500 font-bold tracking-wider mb-2">
                  Unified Channel Confirmation:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2">
                    <PlatformIcon platform="youtube" size={14} />
                    <span>YouTube Premiere &amp; Post</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Dispatched via Google
                    OAuth 2.0 PKCE
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2">
                    <PlatformIcon platform="twitch" size={14} />
                    <span>Twitch Go-Live Alert</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Stream announcement
                    broadcasted
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold flex items-center gap-2">
                    <PlatformIcon platform="instagram" size={14} />
                    <span>Instagram Caption &amp; Reel</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Published via Meta
                    Graph API
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-semibold flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PlatformIcon platform="x" size={13} />
                      <PlatformIcon platform="linkedin" size={13} />
                    </div>
                    <span>X &amp; LinkedIn</span>
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Published with
                    character budget guardrails
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
                  <span>THE OLD 8-TAB JUGGLE</span>
                </div>
                <span className="text-red-600">EFFORT: 50+ MINUTES OF DAILY FRICTION</span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#ede8df] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <PlatformIcon platform="youtube" size={12} />
                    <span>STEP 01 / YOUTUBE</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Open YouTube Studio
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Fill community post, copy link, adjust premiere countdown, wait for upload.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/30 p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <PlatformIcon platform="twitch" size={12} />
                    <PlatformIcon platform="instagram" size={12} />
                    <span>STEP 02 / TWITCH &amp; IG</span>
                  </div>
                  <div className="font-bold text-stone-900 mb-2 font-sans text-sm">
                    Twitch &amp; Instagram
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Log into Twitch dashboard, paste title. Switch to mobile for Instagram reel
                    caption.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-xs">
                  <div className="text-red-700 text-[10px] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <PlatformIcon platform="x" size={11} />
                    <PlatformIcon platform="linkedin" size={11} />
                    <span>STEP 03 / X &amp; LINKEDIN</span>
                  </div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    X Threads &amp; LinkedIn
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    Red &apos;-38 chars&apos; error on X! Delete sentences manually while
                    reformatting paragraphs on LinkedIn.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-xs">
                  <div className="text-red-700 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 04 / GLITCH
                  </div>
                  <div className="font-bold text-red-950 mb-2 font-sans text-sm">
                    Desynchronized Drop
                  </div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    One network has a rate limit error. Your launch is desynchronized and audience
                    engagement breaks.
                  </p>
                </div>
              </div>

              {/* Status matrix */}
              <div className="border border-dashed border-red-300 bg-red-50/40 p-4 font-mono text-xs space-y-2 rounded-xs">
                <div className="text-[11px] uppercase text-red-800 font-bold tracking-wider mb-2">
                  Fragmented Outcome:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <PlatformIcon platform="youtube" size={13} />
                    <PlatformIcon platform="twitch" size={13} />
                    <span>YouTube &amp; Twitch Post</span>
                  </span>
                  <span className="text-stone-500">
                    Published, but took 20 minutes of manual reformatting
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <PlatformIcon platform="x" size={13} />
                    <span>X (Twitter) Post</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Truncated awkwardly mid-sentence
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <PlatformIcon platform="instagram" size={13} />
                    <span>Instagram Reel Drop</span>
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Forgot to post in the chaos
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
