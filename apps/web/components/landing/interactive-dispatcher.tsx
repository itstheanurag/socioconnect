"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle2,
  ExternalLink,
  Clock,
  Zap,
  Check,
  CalendarDays,
  Shield,
} from "lucide-react";
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
    id: "twitch",
    name: "twitch",
    badge: "stream alerts",
    charLimit: 500,
    bestFormat: "🔴 go-live stream alert with stream category and title",
    peakTime: "06:30 pm",
    peakReason: "prime stream browsing & hangout time",
    audienceContext: "live viewers waiting for the stream to start",
    features: ["go-live notification", "channel feed drop", "stream title sync"],
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
    id: "peerlist",
    name: "peerlist",
    badge: "makers & tech",
    charLimit: 1000,
    bestFormat: "project launch spotlight with feature highlights",
    peakTime: "10:00 am",
    peakReason: "morning product hunt for tech creators",
    audienceContext: "designers, makers, and indie builders",
    features: ["project spotlight", "maker feed", "changelog tag"],
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
    id: "reddit",
    name: "reddit",
    badge: "niche communities",
    charLimit: 4000,
    bestFormat: "transparent behind-the-scenes discussion",
    peakTime: "07:00 pm",
    peakReason: "evening deep-dive reading sessions",
    audienceContext: "specific subreddit members wanting genuine value",
    features: ["subreddit flairs", "markdown preview", "spoiler tags"],
  },
  {
    id: "bluesky",
    name: "bluesky",
    badge: "open social",
    charLimit: 300,
    bestFormat: "concise conversational thought or media share",
    peakTime: "02:00 pm",
    peakReason: "afternoon community discussions",
    audienceContext: "tech, art, and journalism open web enthusiasts",
    features: ["custom feeds", "rich links", "thread builder"],
  },
];

const PRESETS = [
  {
    label: "🎥 new video drop",
    text: "just dropped a full deep-dive on building fullstack web apps in 2026! check out the architecture walkthrough and code examples. link in bio/comments! 🔥",
  },
  {
    label: "🔴 stream going live",
    text: "live now: building a modern multi-channel social studio from scratch. come hang out, ask questions, and chat! 🎮",
  },
  {
    label: "🚀 product launch story",
    text: "after 6 months of private testing with 500 creators, socioconnect is officially live! one studio to schedule your content at peak audience hours.",
  },
];

export function LandingInteractiveDispatcher() {
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
    <section id="editor" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end lowercase">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
              <span>creator posting studio</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              write once. reach every audience at their best time.
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-stone-600">
              switch between <strong>staggered peak hours</strong> or an{" "}
              <strong>instant simultaneous drop</strong> across all your accounts.
            </p>
          </div>

          {/* Preset quick buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-stone-600 mr-1">sample templates:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(p.text)}
                className="border border-[#ede8df] bg-white px-3 py-1 text-xs text-stone-700 hover:border-stone-400 hover:text-stone-900 transition-colors rounded-md shadow-2xs font-mono cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Composer Box */}
        <div className="border border-[#ede8df] bg-white shadow-xs rounded-md overflow-hidden lowercase">
          {/* Top Bar: Channel Toggle Pills & Mode Switcher */}
          <div className="border-b border-[#ede8df] bg-[#faf8f5] p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-stone-800">
                  <span>1. select target platforms</span>
                  <span className="text-stone-500 font-normal">
                    ({selectedChannels.length} active)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {CHANNELS.map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-all rounded-md cursor-pointer ${
                          isSelected
                            ? "border-stone-900 bg-white font-bold text-stone-900 shadow-2xs"
                            : "border-[#ede8df] bg-white/60 text-stone-400 hover:border-stone-300 hover:text-stone-600"
                        }`}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-sm shrink-0">
                          <PlatformIcon platform={ch.id} size={15} />
                        </div>
                        <span className="font-sans">{ch.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-emerald-600 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing mode selector */}
              <div className="border-t lg:border-t-0 lg:border-l border-dashed border-[#ede8df] pt-3 lg:pt-0 lg:pl-5">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-stone-800">
                  <span>2. timing strategy</span>
                </div>
                <div className="inline-flex border border-[#dfc39a] bg-white p-0.5 rounded-md font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("staggered")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                      scheduleMode === "staggered"
                        ? "bg-[#F4DCB4] font-bold text-stone-900"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>staggered peak hours</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("simultaneous")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                      scheduleMode === "simultaneous"
                        ? "bg-[#F4DCB4] font-bold text-stone-900"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    <span>instant simultaneous</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Composer Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Text Editor */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#ede8df]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-stone-800">compose post</span>
                  <span className="font-mono text-xs text-stone-500">
                    {content.length} characters
                  </span>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setPublishedResults(null);
                  }}
                  rows={6}
                  placeholder="what are you sharing with your audience today?"
                  className="w-full resize-none border border-[#ede8df] bg-[#faf8f5] p-3.5 font-sans text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden transition-all rounded-md"
                />

                {/* Platform Character Budget Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selectedChannels.map((chId) => {
                    const c = CHANNELS.find((ch) => ch.id === chId);
                    if (!c) return null;
                    const remaining = c.charLimit - content.length;
                    const isOver = remaining < 0;

                    return (
                      <div
                        key={c.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] rounded-md ${
                          isOver
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-[#ede8df] bg-white text-stone-600"
                        }`}
                      >
                        <PlatformIcon platform={c.id} size={12} />
                        <span>{c.name}:</span>
                        <span className={isOver ? "font-bold text-red-600" : "font-semibold"}>
                          {remaining} left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#ede8df] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% private · zero passwords stored</span>
                </div>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || selectedChannels.length === 0}
                  className="group inline-flex items-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] px-5 py-2.5 font-mono text-xs font-bold text-stone-900 transition-all hover:bg-[#ebd0a3] disabled:opacity-50 rounded-md shadow-xs cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
                      <span>publishing to {selectedChannels.length} apps...</span>
                    </>
                  ) : scheduleMode === "staggered" ? (
                    <>
                      <CalendarDays className="h-3.5 w-3.5 text-stone-800" />
                      <span>schedule {selectedChannels.length} apps at peak times</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-stone-800" />
                      <span>post to {selectedChannels.length} channels now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Preview & Inspection */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-[#faf8f5] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-stone-800">
                    channel preview &amp; peak times
                  </span>
                  <span className="font-mono text-[10px] text-stone-500">click to inspect</span>
                </div>

                {/* Inspect Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none font-mono text-xs">
                  {selectedChannels.map((chId) => {
                    const ch = CHANNELS.find((c) => c.id === chId);
                    if (!ch) return null;
                    const isActive = activeInspectTab === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setActiveInspectTab(ch.id)}
                        className={`px-3 py-1.5 border transition-colors rounded-md flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? "border-stone-900 bg-white text-stone-900 font-bold shadow-2xs"
                            : "border-[#ede8df] bg-white/50 text-stone-500 hover:border-stone-400"
                        }`}
                      >
                        <PlatformIcon platform={ch.id} size={13} />
                        <span>{ch.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Channel Details Card */}
                <div className="border border-[#ede8df] bg-white p-4 rounded-md shadow-2xs font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={activeInspectChannel.id} size={15} />
                      <span className="font-bold text-stone-900">{activeInspectChannel.name}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 px-2 py-0.5 bg-stone-100 rounded-sm">
                      {activeInspectChannel.badge}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-stone-500 text-[10px]">best format:</div>
                    <div className="font-sans text-stone-800">
                      {activeInspectChannel.bestFormat}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-[#ede8df] text-[11px]">
                    <div className="bg-[#faf8f5] p-2.5 rounded-md border border-[#ede8df]">
                      <span className="text-stone-400 text-[9px] block">recommended peak</span>
                      <span className="font-bold text-stone-800 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#dfc39a]" />
                        {activeInspectChannel.peakTime}
                      </span>
                    </div>
                    <div className="bg-[#faf8f5] p-2.5 rounded-md border border-[#ede8df]">
                      <span className="text-stone-400 text-[9px] block">audience focus</span>
                      <span className="font-bold text-stone-800 truncate block">
                        {activeInspectChannel.audienceContext}
                      </span>
                    </div>
                  </div>

                  {/* Character check */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#ede8df] text-[11px]">
                    <span className="text-stone-500">post length fit:</span>
                    <span
                      className={
                        content.length <= activeInspectChannel.charLimit
                          ? "text-emerald-700 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {content.length <= activeInspectChannel.charLimit
                        ? `✓ perfect (${content.length}/${activeInspectChannel.charLimit})`
                        : `✕ over limit by ${content.length - activeInspectChannel.charLimit}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Published Results Box */}
              {publishedResults && (
                <div className="mt-4 border border-emerald-300 bg-emerald-50/70 p-3.5 rounded-md font-mono text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      {scheduleMode === "staggered"
                        ? "successfully scheduled for peak hours!"
                        : "published across all channels!"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {Object.entries(publishedResults).map(([chId, res]) => {
                      const c = CHANNELS.find((ch) => ch.id === chId);
                      return (
                        <div
                          key={chId}
                          className="flex items-center justify-between bg-white/80 p-2 rounded-sm border border-emerald-200/60"
                        >
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={chId} size={14} />
                            <span className="font-bold text-stone-800">{c?.name}:</span>
                            <span className="text-[11px] text-stone-600">{res.status}</span>
                          </div>
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-900 underline"
                          >
                            <span>preview</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { LandingInteractiveDispatcher as InteractiveDispatcher };
