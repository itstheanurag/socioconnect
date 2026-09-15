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
import { PlatformIcon } from "./platform-icons";

interface ChannelOption {
  id: string;
  name: string;
  handle: string;
  limit: number;
  peakTime: string;
  peakWindow: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: "youtube",
    name: "YouTube",
    handle: "@AlexBuilds (Community & Shorts)",
    limit: 5000,
    peakTime: "03:00 PM",
    peakWindow: "Afternoon Premiere surge",
  },
  {
    id: "twitch",
    name: "Twitch",
    handle: "twitch.tv/alex_codes",
    limit: 500,
    peakTime: "06:30 PM",
    peakWindow: "Prime live stream hours",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@alex.creates (Reels & Feed)",
    limit: 2200,
    peakTime: "11:30 AM",
    peakWindow: "Mid-day visual feed scroll",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@alex_builds",
    limit: 280,
    peakTime: "12:15 PM",
    peakWindow: "Lunch tech discussions",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Alex Rivers (Founder)",
    limit: 3000,
    peakTime: "08:30 AM",
    peakWindow: "Morning executive reading",
  },
  {
    id: "peerlist",
    name: "Peerlist",
    handle: "alex_rivers",
    limit: 1000,
    peakTime: "10:00 AM",
    peakWindow: "Maker project spotlight",
  },
  {
    id: "reddit",
    name: "Reddit",
    handle: "u/alex_dev (r/videos)",
    limit: 4000,
    peakTime: "08:45 PM",
    peakWindow: "Evening deep dives",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    handle: "alex.bsky.social",
    limit: 300,
    peakTime: "01:00 PM",
    peakWindow: "Open protocol feed",
  },
];

const PRESETS = [
  {
    title: "Video Drop",
    text: "🔥 NEW DEEP DIVE: 'Building a Real-Time Distribution Engine in TypeScript'. Full breakdown + open-source repo. Check it out! 🚀",
  },
  {
    title: "Going Live",
    text: "🔴 GOING LIVE on Twitch & YouTube! Live coding token encryption vaults & answering chat questions. Come hang out!",
  },
  {
    title: "Maker Tip",
    text: "Stop juggling 8 tabs every morning. Write once, pick your peak windows, and let your queue handle the rest. ⚡",
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
  const [scheduleMode, setScheduleMode] = useState<"staggered" | "simultaneous">("staggered");
  const [activeInspectTab, setActiveInspectTab] = useState<string>("youtube");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResults, setPublishedResults] = useState<{
    [key: string]: {
      success: boolean;
      link: string;
      latency: string;
      status: string;
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

    await new Promise((r) => setTimeout(r, 900));

    const results: {
      [key: string]: {
        success: boolean;
        link: string;
        latency: string;
        status: string;
        dispatchTime: string;
      };
    } = {};

    for (const ch of selectedChannels) {
      const channelObj = CHANNELS.find((c) => c.id === ch);
      const latencyMs = Math.floor(Math.random() * 50) + 70;
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
                      ? "reddit.com/r/videos"
                      : "bsky.app/profile/post";

      results[ch] = {
        success: true,
        link: `https://${domain}/${Math.random().toString(36).substring(2, 8)}`,
        latency: `${latencyMs}ms`,
        status:
          scheduleMode === "staggered" ? `Queued for ${channelObj?.peakTime}` : "Dispatched Now",
        dispatchTime:
          scheduleMode === "staggered" ? channelObj?.peakTime || "Immediate" : "Immediate",
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
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              INTERACTIVE DISPATCHER
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Write once. Hit peak attention everywhere.
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-stone-600">
              Switch between <strong>staggered peak windows</strong> or an{" "}
              <strong>instant simultaneous drop</strong>.
            </p>
          </div>

          {/* Preset quick buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-stone-400 mr-1">PRESETS:</span>
            {PRESETS.map((p) => (
              <button
                key={p.title}
                onClick={() => handlePreset(p.text)}
                className={`border px-3 py-1 text-xs font-mono transition-colors rounded-xs ${
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

        {/* Main Interactive Frame */}
        <div className="relative border border-[#ede8df] bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Composer */}
            <div className="flex flex-col justify-between lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#ede8df] lg:pr-8 pb-6 lg:pb-0">
              <div>
                {/* Timing strategy switch */}
                <div className="mb-4 flex items-center justify-between border border-dashed border-[#dfc39a] bg-[#faf8f5] p-2 rounded-xs font-mono text-xs">
                  <span className="text-stone-500 text-[11px] font-bold uppercase tracking-wider pl-1">
                    TIMING:
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

                {/* Channel Selectors with Real SVG Logos */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                      Destination Channels ({selectedChannels.length})
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">Toggle on/off</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-mono transition-all rounded-xs ${
                            isSelected
                              ? "border-stone-900 bg-[#faf8f5] text-stone-900 font-semibold shadow-2xs"
                              : "border-dashed border-[#dcd5c8] bg-white text-stone-400 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <PlatformIcon platform={ch.id} size={15} />
                          <span>{ch.name}</span>
                          <span className="text-[10px] text-stone-400">
                            {scheduleMode === "staggered"
                              ? ch.peakTime
                              : `${ch.limit - content.length}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Editor */}
                <div className="relative border border-dashed border-[#dfc39a] bg-[#faf8f5] p-4 rounded-xs">
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 mb-2 font-mono text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <Sparkles className="h-3.5 w-3.5 text-stone-700" />
                      COMPOSER
                    </span>
                    <span>{content.length} chars</span>
                  </div>

                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (publishedResults) setPublishedResults(null);
                    }}
                    placeholder="Write your video announcement, stream drop, or thread..."
                    className="w-full resize-none bg-transparent font-sans text-sm text-stone-800 placeholder-stone-400 focus:outline-none leading-relaxed"
                  />

                  {/* Character budget chips */}
                  <div className="mt-3 pt-2 border-t border-dashed border-[#ede8df] flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    {CHANNELS.filter((c) => selectedChannels.includes(c.id)).map((c) => {
                      const remaining = c.limit - content.length;
                      return (
                        <span
                          key={c.id}
                          className={`px-2 py-0.5 rounded-xs flex items-center gap-1 ${
                            remaining < 0
                              ? "bg-red-50 text-red-700 border border-red-200 font-bold"
                              : "bg-[#ede8df]/60 text-stone-700"
                          }`}
                        >
                          <PlatformIcon platform={c.id} size={12} />
                          <span>
                            {c.name}: {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {selectedChannels.some((id) => {
                  const ch = CHANNELS.find((c) => c.id === id);
                  return ch && content.length > ch.limit;
                }) && (
                  <div className="mt-3 flex items-center gap-2 border border-dashed border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 rounded-xs font-mono">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Auto-thread splitter will chunk long posts for X.</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-8 flex items-center gap-3 pt-4 border-t border-dashed border-[#ede8df]">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || selectedChannels.length === 0}
                  className={`flex-1 inline-flex items-center justify-center gap-2 border px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-xs shadow-xs ${
                    isPublishing
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-wait"
                      : selectedChannels.length === 0
                        ? "border-dashed border-[#dcd5c8] bg-stone-100 text-stone-400 cursor-not-allowed"
                        : "border-[#dfc39a] bg-[#F4DCB4] text-stone-900 hover:bg-[#ebd0a3]"
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin text-emerald-700" />
                      <span>DISPATCHING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
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
                    className="border border-dashed border-[#dcd5c8] bg-white p-3 text-stone-600 hover:border-stone-500 rounded-xs"
                    title="Reset form"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Outbound Inspector */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#ede8df] pb-3 mb-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 uppercase">
                    <Radio className="h-4 w-4 text-emerald-600" />
                    <span>PAYLOAD INSPECTOR</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {CHANNELS.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveInspectTab(ch.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors rounded-xs ${
                          activeInspectTab === ch.id
                            ? "bg-stone-900 text-white font-bold"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        <PlatformIcon platform={ch.id} size={13} />
                        <span>{ch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspect Content Box */}
                <div className="border border-[#ede8df] bg-[#faf8f5] p-4 rounded-xs font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-[11px]">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <PlatformIcon platform={activeInspectChannel.id} size={15} />
                      <span>{activeInspectChannel.name}</span>
                    </div>
                    <span className="text-stone-500">{activeInspectChannel.handle}</span>
                  </div>

                  <div className="bg-white border border-[#ede8df] p-3.5 rounded-xs font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line">
                    {content}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <div className="bg-white p-2 border border-[#ede8df] rounded-xs">
                      <span className="text-stone-400 block text-[10px]">PEAK TIME WINDOW</span>
                      <span className="font-bold text-stone-800">
                        {scheduleMode === "staggered"
                          ? `${activeInspectChannel.peakTime} (Peak)`
                          : "Immediate"}
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-[#ede8df] rounded-xs">
                      <span className="text-stone-400 block text-[10px]">FEED SCOPE</span>
                      <span className="font-bold text-emerald-700">Write-Only (Zero Read)</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Output */}
                {publishedResults && (
                  <div className="mt-4 border border-emerald-200 bg-emerald-50/80 p-3.5 rounded-xs font-mono text-xs">
                    <div className="flex items-center justify-between text-emerald-900 font-bold mb-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Dispatched Successfully</span>
                      </div>
                      <span className="text-[11px] text-emerald-700">100% Success</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      {Object.entries(publishedResults).map(([chKey, val]) => (
                        <div
                          key={chKey}
                          className="flex items-center justify-between bg-white/80 p-2 border border-emerald-100 rounded-xs"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-stone-800">
                            <PlatformIcon platform={chKey} size={13} />
                            <span className="capitalize">{chKey}:</span>
                          </div>
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

              {/* Zero Password Security Note */}
              <div className="mt-6 border border-dashed border-[#dfc39a] bg-[#faf8f5] p-3 font-mono text-xs text-stone-600 rounded-xs flex items-center gap-2">
                <Lock className="h-4 w-4 text-stone-800 shrink-0" />
                <span>Zero passwords stored. Official OAuth 2.0 PKCE token exchange only.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
