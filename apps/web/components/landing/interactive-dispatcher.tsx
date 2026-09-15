"use client";

import { useState } from "react";
import {
  Check,
  RotateCw,
  ExternalLink,
  Send,
  RefreshCcw,
  Sparkles,
  AlertCircle,
  Radio,
  Lock,
  Clock,
  Zap,
} from "lucide-react";

interface ChannelOption {
  id: string;
  name: string;
  handle: string;
  limit: number;
  avatarBg: string;
  tag: string;
  icon: string;
  peakTime: string;
  peakWindow: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: "youtube",
    name: "YouTube",
    handle: "@AlexBuilds (Community & Shorts)",
    limit: 5000,
    avatarBg: "bg-[#FF0000]",
    tag: "VIDEO & COMMUNITY",
    icon: "YT",
    peakTime: "03:00 PM",
    peakWindow: "Afternoon Premiere surge",
  },
  {
    id: "twitch",
    name: "Twitch",
    handle: "twitch.tv/alex_codes",
    limit: 500,
    avatarBg: "bg-[#9146FF]",
    tag: "LIVE STREAM DROP",
    icon: "TW",
    peakTime: "06:30 PM",
    peakWindow: "Evening stream hours",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@alex.creates (Captions & Reels)",
    limit: 2200,
    avatarBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    tag: "VISUAL & REELS",
    icon: "IG",
    peakTime: "11:30 AM",
    peakWindow: "Mid-day visual feed check",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@alex_builds",
    limit: 280,
    avatarBg: "bg-stone-900",
    tag: "PUBLIC THREAD",
    icon: "𝕏",
    peakTime: "12:15 PM",
    peakWindow: "Tech lunch break discussions",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Alex Rivers · Creator",
    limit: 3000,
    avatarBg: "bg-[#0a66c2]",
    tag: "PROFESSIONAL",
    icon: "in",
    peakTime: "08:30 AM",
    peakWindow: "Morning executive coffee",
  },
  {
    id: "peerlist",
    name: "Peerlist",
    handle: "alex_rivers",
    limit: 1000,
    avatarBg: "bg-[#00AA45]",
    tag: "MAKER NETWORK",
    icon: "P",
    peakTime: "10:00 AM",
    peakWindow: "Maker project spotlight",
  },
  {
    id: "reddit",
    name: "Reddit",
    handle: "u/alex_dev (r/videos)",
    limit: 4000,
    avatarBg: "bg-[#ff4500]",
    tag: "SUBREDDIT",
    icon: "rd",
    peakTime: "08:45 PM",
    peakWindow: "Evening deep conversations",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    handle: "alex.bsky.social",
    limit: 300,
    avatarBg: "bg-[#0285ff]",
    tag: "OPEN WEB",
    icon: "bs",
    peakTime: "01:00 PM",
    peakWindow: "Open protocol feed activity",
  },
];

const PRESETS = [
  {
    title: "New Video Launch",
    text: "🔥 NEW VIDEO IS LIVE: 'How We Built a Real-Time Streaming Architecture in 48 Hours'. Watch behind-the-scenes breakdown, source code repo walkthrough, and production benchmarks. Link in bio & community tab! 🎥🚀",
  },
  {
    title: "Going Live Stream",
    text: "🔴 GOING LIVE on Twitch & YouTube in 10 mins! Today: Live coding the multi-channel queue worker, answering developer questions, and reviewing community PRs. Come hang out!",
  },
  {
    title: "Reel & Short Caption",
    text: "Stop spending 40 mins copy-pasting your video promos across 7 apps. Here is the exact distribution workflow top creators use to schedule once and cross-post everywhere. 🎬✨ #CreatorEconomy #VideoProduction",
  },
];

export function InteractiveDispatcher() {
  const [content, setContent] = useState(PRESETS[0].text);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "youtube",
    "twitch",
    "instagram",
    "x",
    "linkedin",
    "peerlist",
  ]);
  const [scheduleMode, setScheduleMode] = useState<"simultaneous" | "staggered">("staggered");
  const [activeInspectTab, setActiveInspectTab] = useState<string>("youtube");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResults, setPublishedResults] = useState<{
    [key: string]: {
      success: boolean;
      link: string;
      latency: string;
      status: string;
      timestamp: string;
      dispatchTime: string;
    };
  } | null>(null);

  function toggleChannel(id: string) {
    if (isPublishing) return;
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function handlePreset(text: string) {
    if (isPublishing) return;
    setContent(text);
    setPublishedResults(null);
  }

  async function handlePublish() {
    if (isPublishing || selectedChannels.length === 0) return;
    setIsPublishing(true);
    setPublishedResults(null);

    await new Promise((r) => setTimeout(r, 1100));

    const results: {
      [key: string]: {
        success: boolean;
        link: string;
        latency: string;
        status: string;
        timestamp: string;
        dispatchTime: string;
      };
    } = {};

    for (const ch of selectedChannels) {
      const channelObj = CHANNELS.find((c) => c.id === ch);
      const latencyMs = Math.floor(Math.random() * 60) + 85;
      const domain =
        ch === "youtube"
          ? "youtube.com/post"
          : ch === "twitch"
            ? "twitch.tv/alex_codes"
            : ch === "instagram"
              ? "instagram.com/p"
              : ch === "linkedin"
                ? "linkedin.com/feed/update"
                : ch === "peerlist"
                  ? "peerlist.io/post"
                  : ch === "x"
                    ? "x.com/status"
                    : ch === "reddit"
                      ? "reddit.com/r/videos/comments"
                      : "bsky.app/profile/post";

      results[ch] = {
        success: true,
        link: `https://${domain}/${Math.random().toString(36).substring(2, 8)}`,
        latency: `${latencyMs}ms`,
        status:
          scheduleMode === "staggered"
            ? `Queued for Peak ${channelObj?.peakTime}`
            : "200 OK · Dispatched Now",
        timestamp: new Date().toLocaleTimeString(),
        dispatchTime:
          scheduleMode === "staggered"
            ? channelObj?.peakTime || "Immediate"
            : "Immediate Simultaneous",
      };
    }

    setPublishedResults(results);
    setIsPublishing(false);
  }

  const activeInspectChannel = CHANNELS.find((c) => c.id === activeInspectTab) || CHANNELS[0];

  return (
    <section id="editor" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              INTERACTIVE MULTI-DESTINATION DISPATCHER
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Compose once. Schedule at same or different peak times.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Choose an <strong>instant simultaneous drop</strong> or{" "}
              <strong>staggered peak windows</strong> to hit audiences exactly when they are active
              on YouTube, Twitch, Instagram, X, LinkedIn, and Reddit.
            </p>
          </div>

          {/* Preset scenarios */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-stone-500 mr-1">TRY A SAMPLE:</span>
            {PRESETS.map((p) => (
              <button
                key={p.title}
                onClick={() => handlePreset(p.text)}
                className={`border px-3 py-1.5 text-xs font-mono transition-colors rounded-sm ${
                  content === p.text
                    ? "border-[#dfc39a] bg-[#F4DCB4] text-stone-900 font-bold"
                    : "border-dashed border-[#dcd5c8] bg-white text-stone-600 hover:border-stone-500"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interactive Studio Frame */}
        <div className="relative border border-[#ede8df] bg-white p-5 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Creator Composer & Channels */}
            <div className="flex flex-col justify-between lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#ede8df] lg:pr-8 pb-8 lg:pb-0">
              <div>
                {/* Scheduling Mode Switcher: Simultaneous vs Staggered Peak Times */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border border-dashed border-[#dfc39a] bg-[#faf8f5] p-2 rounded-xs font-mono text-xs">
                  <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                    TIMING STRATEGY:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScheduleMode("staggered")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-all ${
                        scheduleMode === "staggered"
                          ? "bg-[#F4DCB4] text-stone-900 font-bold border border-[#dfc39a] shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <Clock className="h-3 w-3 text-stone-800" />
                      <span>STAGGERED PEAK TIMES</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode("simultaneous")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-all ${
                        scheduleMode === "simultaneous"
                          ? "bg-stone-900 text-white font-bold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <Zap className="h-3 w-3 text-stone-300" />
                      <span>SIMULTANEOUS BLAST</span>
                    </button>
                  </div>
                </div>

                {/* Channel Selectors */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                      Destination Apps ({selectedChannels.length} active)
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">Click to toggle</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.id);
                      const isOverLimit = content.length > ch.limit;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`flex items-center gap-2 border px-3 py-2 text-xs font-mono transition-all rounded-xs ${
                            isSelected
                              ? isOverLimit
                                ? "border-dashed border-amber-400 bg-amber-50 text-amber-900 font-medium"
                                : "border-stone-800 bg-[#faf8f5] text-stone-900 font-semibold"
                              : "border-dashed border-[#dcd5c8] bg-white text-stone-400 hover:border-stone-400"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-xs text-[9px] font-bold ${
                              isSelected
                                ? `${ch.avatarBg} text-white`
                                : "border border-stone-300 text-stone-400"
                            }`}
                          >
                            {ch.icon}
                          </span>
                          <span>{ch.name}</span>
                          <span
                            className={`text-[10px] ${
                              isOverLimit
                                ? "text-amber-700 font-bold"
                                : "text-stone-400 font-normal"
                            }`}
                          >
                            {scheduleMode === "staggered"
                              ? ch.peakTime
                              : `${ch.limit - content.length}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Editor with Dashed Border */}
                <div className="relative border border-dashed border-[#dfc39a] bg-[#faf8f5] p-3.5 rounded-xs">
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 mb-2 font-mono text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <Sparkles className="h-3.5 w-3.5 text-stone-700" />
                      DISTRIBUTION COMPOSER
                    </span>
                    <span>{content.length} characters</span>
                  </div>

                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (publishedResults) setPublishedResults(null);
                    }}
                    placeholder="Write your video announcement, live stream drop, or caption..."
                    className="w-full resize-none bg-transparent font-sans text-sm text-stone-800 placeholder-stone-400 focus:outline-none leading-relaxed"
                  />

                  {/* Per-platform character budget indicators */}
                  <div className="mt-3 pt-3 border-t border-dashed border-[#ede8df] flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="text-stone-400 uppercase text-[10px]">Budgets:</span>
                    {CHANNELS.filter((c) => selectedChannels.includes(c.id)).map((c) => {
                      const remaining = c.limit - content.length;
                      const isExceeded = remaining < 0;
                      return (
                        <span
                          key={c.id}
                          className={`px-1.5 py-0.5 rounded-xs ${
                            isExceeded
                              ? "border border-dashed border-red-300 bg-red-50 text-red-700 font-bold"
                              : "bg-[#ede8df]/70 text-stone-700"
                          }`}
                        >
                          {c.name}: {remaining < 0 ? `${remaining} (OVER)` : `${remaining} left`}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Overlimit Warning if any */}
                {selectedChannels.some((id) => {
                  const ch = CHANNELS.find((c) => c.id === id);
                  return ch && content.length > ch.limit;
                }) && (
                  <div className="mt-3 flex items-center gap-2 border border-dashed border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 rounded-xs font-mono">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      Notice: Your message exceeds character limits on some channels. Our thread
                      splitter automatically chunks long posts for X and Bluesky.
                    </span>
                  </div>
                )}
              </div>

              {/* Publish Action Button */}
              <div className="mt-8 flex items-center gap-3 pt-4 border-t border-dashed border-[#ede8df]">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || selectedChannels.length === 0}
                  className={`flex-1 inline-flex items-center justify-center gap-2 border px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm shadow-xs ${
                    isPublishing
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-wait"
                      : selectedChannels.length === 0
                        ? "border-dashed border-[#dcd5c8] bg-stone-100 text-stone-400 cursor-not-allowed"
                        : "border-[#dfc39a] bg-[#F4DCB4] text-stone-900 hover:bg-[#ebd0a3]"
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin text-emerald-700" />
                      <span>SCHEDULING VIA ENCRYPTED VAULT...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {scheduleMode === "staggered"
                          ? `SCHEDULE ${selectedChannels.length} APPS AT PEAK TIMES`
                          : `DISPATCH ${selectedChannels.length} APPS SIMULTANEOUSLY`}
                      </span>
                    </>
                  )}
                </button>

                {publishedResults && (
                  <button
                    type="button"
                    onClick={() => setPublishedResults(null)}
                    className="border border-dashed border-[#dcd5c8] bg-white p-3 text-stone-600 hover:border-stone-500 hover:text-stone-900 transition-colors rounded-sm"
                    title="Reset simulation"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Outbound Dispatch Inspector & Telemetry */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#ede8df] pb-3 mb-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 uppercase tracking-wider">
                    <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span>OUTBOUND PAYLOAD INSPECTOR</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {CHANNELS.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveInspectTab(ch.id)}
                        className={`px-2 py-0.5 text-[11px] font-mono transition-colors rounded-xs ${
                          activeInspectTab === ch.id
                            ? "bg-stone-900 text-white font-bold"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {ch.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspected Payload Console */}
                <div className="border border-[#ede8df] bg-[#faf8f5] p-4 rounded-xs font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${activeInspectChannel.avatarBg}`} />
                      <span className="font-bold text-stone-900">
                        {activeInspectChannel.name} PAYLOAD
                      </span>
                    </div>
                    <span className="text-stone-500">{activeInspectChannel.handle}</span>
                  </div>

                  <div className="bg-white border border-[#ede8df] p-3 rounded-xs font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line">
                    {content}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <div className="bg-white p-2 border border-[#ede8df] rounded-xs">
                      <span className="text-stone-400 block text-[9px]">
                        TARGET DISPATCH WINDOW
                      </span>
                      <span className="font-bold text-stone-800">
                        {scheduleMode === "staggered"
                          ? `${activeInspectChannel.peakTime} (Peak)`
                          : "Immediate Simultaneous"}
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-[#ede8df] rounded-xs">
                      <span className="text-stone-400 block text-[9px]">FEED PERMISSION</span>
                      <span className="font-bold text-emerald-700">Write-Only (Zero Read)</span>
                    </div>
                  </div>
                </div>

                {/* Published Success Telemetry */}
                {publishedResults && (
                  <div className="mt-4 border border-emerald-200 bg-emerald-50/80 p-4 rounded-xs font-mono text-xs">
                    <div className="flex items-center justify-between text-emerald-900 font-bold mb-3 border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>
                          {scheduleMode === "staggered"
                            ? "Staggered Peak Schedule Confirmed"
                            : "Simultaneous Broadcast Telemetry"}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700">100% Queue Coverage</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      {Object.entries(publishedResults).map(([chKey, val]) => (
                        <div
                          key={chKey}
                          className="flex items-center justify-between bg-white/80 p-2 border border-emerald-100 rounded-xs"
                        >
                          <span className="uppercase font-bold text-stone-800">{chKey}:</span>
                          <span className="text-stone-500">{val.dispatchTime}</span>
                          <span className="text-emerald-800 font-semibold">{val.status}</span>
                          <span className="text-stone-400 flex items-center gap-1">
                            {val.link.substring(0, 20)}... <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Zero Password Guarantee Strip */}
              <div className="mt-6 border border-dashed border-[#dfc39a] bg-[#faf8f5] p-3.5 font-mono text-xs text-stone-600 rounded-xs">
                <div className="flex items-center gap-2 text-stone-800 font-semibold mb-1">
                  <Lock className="h-4 w-4 text-stone-800" />
                  <span>The SocioConnect Privacy Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500 font-sans">
                  We never ask for user login passwords. Connections use official OAuth 2.0 with
                  write-only permissions. We never read, scrape, or store your personal feed data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
