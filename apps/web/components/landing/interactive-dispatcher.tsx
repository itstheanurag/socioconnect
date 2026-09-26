"use client";

import { useState } from "react";
import { Send, Clock, Zap, CalendarDays, Shield, Sparkles } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface ChannelConfig {
  id: string;
  name: string;
  badge: string;
  charLimit: number;
  bestFormat: string;
  peakTime: string;
  peakReason: string;
  audienceContext: string;
  features: string[];
}

const CHANNELS: ChannelConfig[] = [
  {
    id: "youtube",
    name: "youtube",
    badge: "community & video",
    charLimit: 5000,
    bestFormat: "community announcement, premiere link, or pinned teaser",
    peakTime: "04:00 pm",
    peakReason: "peak evening video watching hours",
    audienceContext: "subscribers & viewers looking for new content drops",
    features: ["community post", "video premiere alert", "pinned comment"],
  },
  {
    id: "instagram",
    name: "instagram",
    badge: "reels & captions",
    charLimit: 2200,
    bestFormat: "hook headline + spacing + 5 relevant hashtags",
    peakTime: "12:30 pm",
    peakReason: "lunchtime mobile scrolling break",
    audienceContext: "visual followers scanning stories and reels",
    features: ["reel caption sync", "carousel preview", "hashtag presets"],
  },
  {
    id: "tiktok",
    name: "tiktok",
    badge: "short video",
    charLimit: 2200,
    bestFormat: "trending hook + concise caption + sound tags",
    peakTime: "07:00 pm",
    peakReason: "evening relax and entertainment window",
    audienceContext: "mobile video scrollers looking for quick insights",
    features: ["sound tag sync", "cover thumbnail", "caption spacing"],
  },
  {
    id: "linkedin",
    name: "linkedin",
    badge: "professional story",
    charLimit: 3000,
    bestFormat: "creator lessons, launch backstory, industry takeaways",
    peakTime: "08:30 am",
    peakReason: "morning work commute and desk check-in",
    audienceContext: "professionals & collaborators interested in your journey",
    features: ["article intro", "founder story", "document drop"],
  },
  {
    id: "x",
    name: "x (twitter)",
    badge: "quick bites & threads",
    charLimit: 280,
    bestFormat: "punchy one-liner or multi-post thread hook",
    peakTime: "01:30 pm",
    peakReason: "midday conversation and news peak",
    audienceContext: "fast scrollers looking for quick updates",
    features: ["auto thread splitting", "media cards", "reply pinning"],
  },
  {
    id: "threads",
    name: "threads",
    badge: "conversations",
    charLimit: 500,
    bestFormat: "casual conversational prompt or behind the scenes thought",
    peakTime: "03:00 pm",
    peakReason: "afternoon casual scroll peak",
    audienceContext: "engaged community having casual discussions",
    features: ["reply branching", "photo carousel", "topic tags"],
  },
  {
    id: "reddit",
    name: "reddit",
    badge: "niche communities",
    charLimit: 4000,
    bestFormat: "transparent behind-the-scenes discussion",
    peakTime: "06:00 pm",
    peakReason: "evening deep-dive reading sessions",
    audienceContext: "specific subreddit members wanting genuine value",
    features: ["subreddit flairs", "markdown preview", "anti-spam stagger"],
  },
  {
    id: "discord",
    name: "discord",
    badge: "community guilds",
    charLimit: 2000,
    bestFormat: "formatted announcement with emojis and server channel role pings",
    peakTime: "05:30 pm",
    peakReason: "after-work gaming & creator hangout hours",
    audienceContext: "core superfans & community members in your server",
    features: ["channel selection", "role pings", "rich embeds"],
  },
];

const PRESETS = [
  {
    label: "🎬 new video & episode drop",
    text: "just released our newest deep-dive episode! we break down the 3 strategies that took our creator channel from 0 to 100k subscribers in 12 months. link in bio & first comment! 🚀✨",
  },
  {
    label: "🎙️ podcast & interview teaser",
    text: "new podcast episode live! sitting down with top creators to discuss audience retention, creator burnout, and how to build a sustainable business with one calm studio. 🎧🔥",
  },
  {
    label: "🚀 product launch & story",
    text: "after 6 months of building and private testing with 500 creators, our new collection is officially live! one calm studio to publish your story across every channel at peak hours.",
  },
];

export function InteractiveDispatcher() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "youtube",
    "x",
    "linkedin",
    "instagram",
  ]);
  const [content, setContent] = useState<string>(PRESETS[0].text);
  const [scheduleMode, setScheduleMode] = useState<"staggered" | "simultaneous">("staggered");
  const [activeInspectTab, setActiveInspectTab] = useState<string>("youtube");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedResults, setPublishedResults] = useState<{
    [key: string]: {
      success: boolean;
      link: string;
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

    await new Promise((r) => setTimeout(r, 800));

    const results: {
      [key: string]: {
        success: boolean;
        link: string;
        status: string;
        dispatchTime: string;
      };
    } = {};

    for (const ch of selectedChannels) {
      const channelObj = CHANNELS.find((c) => c.id === ch);
      const domain =
        ch === "youtube"
          ? "youtube.com/post"
          : ch === "instagram"
            ? "instagram.com/p"
            : ch === "tiktok"
              ? "tiktok.com/@creator"
              : ch === "linkedin"
                ? "linkedin.com/feed/update"
                : ch === "threads"
                  ? "threads.net/@creator"
                  : ch === "x"
                    ? "x.com/status"
                    : ch === "reddit"
                      ? "reddit.com/r/community"
                      : "discord.com/channels";

      results[ch] = {
        success: true,
        link: `https://${domain}/${Math.random().toString(36).substring(2, 8)}`,
        status:
          scheduleMode === "staggered" ? `scheduled for ${channelObj?.peakTime}` : "published live",
        dispatchTime:
          scheduleMode === "staggered" ? channelObj?.peakTime || "immediate" : "immediate",
      };
    }

    setPublishedResults(results);
    setIsPublishing(false);
  }

  const activeInspectChannel = CHANNELS.find((c) => c.id === activeInspectTab) || CHANNELS[0];

  return (
    <section id="editor" className="relative py-16 lg:py-24 border-t border-line bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end lowercase">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              <span>creator posting studio</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              write once.{" "}
              <span className="font-serif italic font-normal text-stone-800">
                preview and publish everywhere.
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">
              try this live simulation: choose your channels, pick a message preset, and watch how
              socioconnect adapts the schedule for each platform.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>live interactive simulation</span>
          </div>
        </div>

        {/* The Interactive Studio Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-md border border-line bg-white p-4 sm:p-6 shadow-xs lowercase">
          {/* Left Column (7 cols): Channel Selector + Text Composer */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Platform Badges (Interactive multi-select) */}
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-stone-800">1. select target channels:</span>
                <span className="text-stone-500">
                  {selectedChannels.length} of 8 channels selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHANNELS.map((channel) => {
                  const isSelected = selectedChannels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={`flex items-center gap-2 rounded-md border p-2.5 text-left font-mono text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#dfc39a] bg-secondary/50 font-bold text-stone-900 shadow-2xs"
                          : "border-line bg-[#faf8f5] text-stone-600 hover:border-stone-400 hover:bg-white"
                      }`}
                    >
                      <PlatformIcon platform={channel.id} size={15} />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Input & Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-stone-800">2. craft your core post:</span>
                <span className="text-stone-500">{content.length} characters</span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-line bg-[#faf8f5] p-3.5 font-sans text-sm text-stone-900 focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                placeholder="write your video launch, story, or announcement here..."
              />

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="text-stone-400">quick presets:</span>
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePreset(preset.text)}
                    className="rounded-sm border border-line bg-white px-2 py-1 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing Strategy & Dispatch CTA */}
            <div className="border-t border-dashed border-line pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-800">3. timing strategy:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("staggered")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                      scheduleMode === "staggered"
                        ? "bg-secondary border-[#dfc39a] text-stone-900 font-bold"
                        : "bg-white border-line text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>staggered peak hours</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleMode("simultaneous")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                      scheduleMode === "simultaneous"
                        ? "bg-secondary border-[#dfc39a] text-stone-900 font-bold"
                        : "bg-white border-line text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    <span>instant blast</span>
                  </button>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || selectedChannels.length === 0}
                className="w-full flex items-center justify-center gap-2 border border-[#dfc39a] bg-secondary hover:bg-[#ebd0a3] p-3.5 rounded-md font-mono text-xs font-bold text-stone-900 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isPublishing
                    ? "adapting & dispatching..."
                    : `dispatch to ${selectedChannels.length} channels now`}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Live Per-Channel Inspector & Simulation Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-line lg:pl-6 pt-6 lg:pt-0">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="font-bold text-stone-800">channel format preview:</span>
                <span className="text-stone-500">live character meter</span>
              </div>

              {/* Inspect Channel Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedChannels.map((chId) => {
                  const ch = CHANNELS.find((c) => c.id === chId);
                  const isInspecting = activeInspectTab === chId;
                  return (
                    <button
                      key={chId}
                      type="button"
                      onClick={() => setActiveInspectTab(chId)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs cursor-pointer transition-all ${
                        isInspecting
                          ? "bg-stone-900 border-stone-900 text-white font-bold"
                          : "bg-[#faf8f5] border-line text-stone-700 hover:bg-white"
                      }`}
                    >
                      <PlatformIcon platform={chId} size={12} />
                      <span>{ch?.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Channel Context Box */}
              <div className="rounded-md border border-line bg-[#faf8f5] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-dashed border-line pb-2">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={activeInspectChannel.id} size={16} />
                    <span className="font-bold text-stone-900 font-sans">
                      {activeInspectChannel.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded-xs border border-line">
                    {activeInspectChannel.badge}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="text-stone-500">
                    <span className="font-bold text-stone-800">best format: </span>
                    <span>{activeInspectChannel.bestFormat}</span>
                  </div>

                  <div className="text-stone-500">
                    <span className="font-bold text-stone-800">optimal peak drop: </span>
                    <span className="text-stone-900 font-bold bg-[#F4DCB4] px-1 rounded-xs">
                      {activeInspectChannel.peakTime}
                    </span>
                    <span className="text-stone-400"> ({activeInspectChannel.peakReason})</span>
                  </div>
                </div>

                {/* Character Limit Meter */}
                <div className="pt-2 border-t border-dashed border-line space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">character meter:</span>
                    <span
                      className={`font-bold ${
                        content.length > activeInspectChannel.charLimit
                          ? "text-red-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {content.length} / {activeInspectChannel.charLimit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        content.length > activeInspectChannel.charLimit
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (content.length / activeInspectChannel.charLimit) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Published Results Box */}
            <div className="mt-4 pt-4 border-t border-dashed border-line">
              {publishedResults ? (
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>dispatched successfully:</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {Object.entries(publishedResults).map(([platformKey, item]) => (
                      <div
                        key={platformKey}
                        className="flex items-center justify-between bg-[#faf8f5] p-2 rounded-sm border border-line text-[11px]"
                      >
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <PlatformIcon platform={platformKey} size={12} />
                          <span>{platformKey}</span>
                        </span>
                        <span className="text-stone-500 text-[10px]">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-stone-400 font-mono text-xs">
                  <Shield className="h-3.5 w-3.5 text-stone-400" />
                  <span>100% private encrypted oauth &middot; zero passwords stored</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
