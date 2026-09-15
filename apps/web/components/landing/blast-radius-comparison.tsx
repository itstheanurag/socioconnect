"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Sparkles, XCircle } from "lucide-react";

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
              THE CREATOR WORKFLOW UPGRADE
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Why manual copy-pasting is holding your brand back.
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600">
              Compare the friction of juggling multiple social tabs every morning with the ease of
              SocioConnect&apos;s unified creator desk.
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
              SOCIOCONNECT STUDIO
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
              THE 5-TAB NIGHTMARE
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
                  <div className="font-bold text-stone-900 mb-2">Write In One Calm Editor</div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Compose your essay, announcement, or story in a single distraction-free window.
                  </p>
                </div>

                <div className="border border-[#ede8df] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 02 / PREVIEW
                  </div>
                  <div className="font-bold text-stone-900 mb-2">Inspect Live Platform Feeds</div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    See exactly how your hook and hashtags render on LinkedIn, Threads, X, and
                    Bluesky side-by-side.
                  </p>
                </div>

                <div className="border border-dashed border-[#dfc39a] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 03 / ADAPT
                  </div>
                  <div className="font-bold text-stone-900 mb-2">
                    Auto-Split &amp; Character Safety
                  </div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Keep long-form for LinkedIn while auto-breaking into numbered threads for X.
                  </p>
                </div>

                <div className="border border-[#dfc39a] bg-[#F4DCB4]/40 p-5 rounded-xs">
                  <div className="text-stone-800 text-[10px] mb-1 uppercase tracking-wider font-bold">
                    STEP 04 / PUBLISH
                  </div>
                  <div className="font-bold text-stone-900 mb-2">One-Click Panic-Free Drop</div>
                  <p className="text-xs text-stone-700 leading-normal font-sans">
                    Feeds publish independently. A network hiccup on one platform never ruins your
                    whole launch.
                  </p>
                </div>
              </div>

              {/* Status matrix */}
              <div className="border border-[#ede8df] bg-white p-4 font-mono text-xs space-y-2 rounded-xs">
                <div className="text-[11px] uppercase text-stone-500 font-bold tracking-wider mb-2">
                  Unified Channel Confirmation:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold">LinkedIn Feed</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Published with
                    formatting &amp; hashtags
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-2">
                  <span className="text-stone-800 font-semibold">Threads Feed</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Published with
                    conversational tone
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-800 font-semibold">X (Twitter) Feed</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Published with
                    280-char guardrails
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
                  <span>THE OLD 5-TAB JUGGLE</span>
                </div>
                <span className="text-red-600">EFFORT: 45+ MINUTES OF FRICTION</span>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#ede8df] bg-white p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 01 / TAB 1
                  </div>
                  <div className="font-bold text-stone-900 mb-2">Open LinkedIn</div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Paste text, adjust line spacing, re-add hashtags, upload image file.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/30 p-5 rounded-xs">
                  <div className="text-stone-400 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 02 / TAB 2
                  </div>
                  <div className="font-bold text-stone-900 mb-2">Open X / Twitter</div>
                  <p className="text-xs text-stone-600 leading-normal font-sans">
                    Red &apos;-42 chars&apos; error! Manually delete adjectives to fit the limit.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-xs">
                  <div className="text-red-700 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 03 / TAB 3 &amp; 4
                  </div>
                  <div className="font-bold text-red-950 mb-2">Threads &amp; Bluesky</div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    Re-login because your session expired. Copy-paste again, wondering if you
                    already posted.
                  </p>
                </div>

                <div className="border border-dashed border-red-300 bg-red-50/50 p-5 rounded-xs">
                  <div className="text-red-700 text-[10px] mb-1 uppercase tracking-wider">
                    STEP 04 / GLITCH
                  </div>
                  <div className="font-bold text-red-950 mb-2">Post Outage Disaster</div>
                  <p className="text-xs text-red-700 leading-normal font-sans">
                    One network has a rate limit error. Your launch is desynchronized and audience
                    engagement splits.
                  </p>
                </div>
              </div>

              {/* Status matrix */}
              <div className="border border-dashed border-red-300 bg-red-50/40 p-4 font-mono text-xs space-y-2 rounded-xs">
                <div className="text-[11px] uppercase text-red-800 font-bold tracking-wider mb-2">
                  Fragmented Outcome:
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700">LinkedIn Post</span>
                  <span className="text-stone-500">
                    Published, but took 15 minutes of manual reformatting
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-red-200/60 pb-2">
                  <span className="text-stone-700">X (Twitter) Post</span>
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Truncated awkwardly mid-sentence
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-700">Threads Post</span>
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Session timed out, forgot to publish
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
