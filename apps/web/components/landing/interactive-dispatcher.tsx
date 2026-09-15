"use client";

import { useState, useMemo } from "react";
import {
  Check,
  RotateCw,
  ExternalLink,
  Send,
  RefreshCcw,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  AlertCircle,
} from "lucide-react";

interface ChannelOption {
  id: string;
  name: string;
  handle: string;
  limit: number;
  avatarBg: string;
  tag: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Sarah Jenkins · Founder & Creator",
    limit: 3000,
    avatarBg: "bg-[#0a66c2]",
    tag: "PROFESSIONAL",
  },
  {
    id: "threads",
    name: "Threads",
    handle: "@sarah.creates",
    limit: 500,
    avatarBg: "bg-stone-900",
    tag: "DISCUSSION",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@sarah_creates",
    limit: 280,
    avatarBg: "bg-stone-800",
    tag: "VIRAL THREAD",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    handle: "sarah.bsky.social",
    limit: 300,
    avatarBg: "bg-[#0285ff]",
    tag: "OPEN WEB",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    handle: "@sarah@mastodon.art",
    limit: 500,
    avatarBg: "bg-[#6364ff]",
    tag: "COMMUNITY",
  },
];

const PRESETS = [
  {
    title: "Product Launch",
    text: "Excited to share our new creator workflow! Stop spending 45 minutes re-formatting posts across 5 different tabs. With SocioConnect, compose once and preview your thoughts natively for every feed. #CreatorEconomy #SaaS #Productivity",
  },
  {
    title: "Creative Habit",
    text: "The secret to creative longevity isn't 24/7 hustle—it's smart distribution. When you protect your creative energy with unified tools, you post consistently without burnout. What's your daily writing routine?",
  },
  {
    title: "Community Question",
    text: "Quick question for writers & builders: Which social platform has given you the highest quality community conversations this year? LinkedIn, Threads, or X? Drop your thoughts below! ☕️",
  },
];

export function InteractiveDispatcher() {
  const [content, setContent] = useState(PRESETS[0].text);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "linkedin",
    "threads",
    "x",
    "bluesky",
  ]);
  const [previewTab, setPreviewTab] = useState<string>("linkedin");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResults, setPublishedResults] = useState<{
    [key: string]: { success: boolean; link?: string; message?: string };
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

    await new Promise((r) => setTimeout(r, 1200));

    const results: { [key: string]: { success: boolean; link?: string; message?: string } } = {};
    for (const ch of selectedChannels) {
      results[ch] = {
        success: true,
        link: `https://${ch === "threads" ? "threads.net" : ch === "linkedin" ? "linkedin.com/in" : ch === "bluesky" ? "bsky.app" : "x.com"}/post/${Math.random().toString(36).substring(2, 8)}`,
        message: "Live on feed",
      };
    }

    setPublishedResults(results);
    setIsPublishing(false);
  }

  const activeChannelMeta = useMemo(() => {
    return CHANNELS.find((c) => c.id === previewTab) || CHANNELS[0];
  }, [previewTab]);

  return (
    <section id="editor" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              INTERACTIVE CREATOR PLAYGROUND
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Try the unified creator composer right here.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Type your idea, check character budgets, switch between live feed previews, and see
              how effortless multi-channel publishing feels.
            </p>
          </div>

          {/* Preset scenarios */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-stone-500 mr-1">TRY A DRAFT:</span>
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
                {/* Channel Selectors */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                      Destination Feeds ({selectedChannels.length} active)
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
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs text-[9px] ${
                              isSelected
                                ? "bg-[#F4DCB4] text-stone-900 font-bold border border-[#dfc39a]"
                                : "border border-stone-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span>{ch.name}</span>
                          <span
                            className={`text-[10px] ${
                              isOverLimit
                                ? "text-amber-700 font-bold"
                                : "text-stone-400 font-normal"
                            }`}
                          >
                            {ch.limit - content.length < 0
                              ? `+${Math.abs(ch.limit - content.length)}`
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
                      POST COMPOSER
                    </span>
                    <span>{content.length} characters written</span>
                  </div>

                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (publishedResults) setPublishedResults(null);
                    }}
                    placeholder="Write your story, announcement, or thread here..."
                    className="w-full resize-none bg-transparent font-sans text-sm text-stone-800 placeholder-stone-400 focus:outline-none leading-relaxed"
                  />

                  {/* Per-platform character budget indicators */}
                  <div className="mt-3 pt-3 border-t border-dashed border-[#ede8df] flex flex-wrap items-center gap-3 font-mono text-[11px]">
                    <span className="text-stone-400">BUDGETS:</span>
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
                      Notice: Your draft exceeds character limits on some channels. SocioConnect can
                      auto-trim or split into threads upon publishing!
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
                      <span>SCHEDULING ACROSS FEEDS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>SCHEDULE TO {selectedChannels.length} FEEDS</span>
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

            {/* Right: Live Visual Preview Tabs */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#ede8df] pb-3 mb-4">
                  <span className="font-mono text-xs font-bold text-stone-900 uppercase tracking-wider">
                    LIVE FEED PREVIEW
                  </span>
                  <div className="flex items-center gap-1">
                    {CHANNELS.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setPreviewTab(ch.id)}
                        className={`px-2.5 py-1 text-xs font-mono transition-colors rounded-xs ${
                          previewTab === ch.id
                            ? "bg-stone-900 text-white font-bold"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {ch.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rendered Mockup Feed Card */}
                <div className="border border-[#ede8df] bg-white p-5 rounded-xs shadow-xs">
                  {/* Mockup Author Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#f6eee2] border border-[#dfc39a] flex items-center justify-center font-bold text-stone-800 font-serif text-sm">
                        SJ
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-stone-900">Sarah Jenkins</span>
                          <span className="h-3.5 w-3.5 rounded-full bg-[#F4DCB4] text-stone-900 border border-[#dfc39a] flex items-center justify-center text-[8px] font-bold">
                            ✓
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 font-mono block">
                          {activeChannelMeta.handle} · Just now
                        </span>
                      </div>
                    </div>

                    <span className="border border-dashed border-[#dfc39a] bg-[#faf8f5] px-2 py-0.5 font-mono text-[10px] text-stone-700 rounded-xs uppercase">
                      {activeChannelMeta.name} Feed
                    </span>
                  </div>

                  {/* Post Content with line breaks */}
                  <div className="font-sans text-sm text-stone-800 leading-relaxed whitespace-pre-line my-4">
                    {content}
                  </div>

                  {/* Social Action Footer Bar */}
                  <div className="border-t border-[#f0ede6] pt-3 mt-4 flex items-center justify-between text-stone-400 text-xs font-mono">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" /> 2.4k
                      </span>
                      <span className="flex items-center gap-1 hover:text-stone-700 transition-colors">
                        <MessageCircle className="h-4 w-4" /> 84 replies
                      </span>
                      <span className="flex items-center gap-1 hover:text-stone-700 transition-colors">
                        <Share2 className="h-4 w-4" /> 192 reposts
                      </span>
                    </div>
                    <Bookmark className="h-4 w-4 hover:text-stone-700 cursor-pointer" />
                  </div>
                </div>

                {/* Published Success Telemetry */}
                {publishedResults && (
                  <div className="mt-4 border border-emerald-200 bg-emerald-50/80 p-4 rounded-xs font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Universal Broadcast Confirmed</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-emerald-700">
                      {Object.entries(publishedResults).map(([chKey, val]) => (
                        <div key={chKey} className="flex items-center justify-between">
                          <span className="uppercase font-semibold">{chKey} Feed:</span>
                          <span className="flex items-center gap-1 text-emerald-900 underline">
                            {val.link} <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Peace of mind highlight with dashed border */}
              <div className="mt-6 border border-dashed border-[#dfc39a] bg-[#faf8f5] p-3.5 font-mono text-xs text-stone-600">
                <div className="flex items-center gap-2 text-stone-800 font-semibold mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#dfc39a]" />
                  <span>The Creator Guarantee: No More Post Loss</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500">
                  If any single social network suffers an outage or temporary rate limit, your other
                  scheduled posts publish smoothly on time. Zero panic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
