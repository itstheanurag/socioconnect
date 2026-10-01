"use client";

import React, { useEffect, useMemo } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Layers,
  Music,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Send,
  Eye,
  Hash,
  Smile,
  Info,
} from "lucide-react";
import { useDashboard } from "../context/dashboard-context";
import { useComposeStore, SAMPLE_MEDIA_LIBRARY } from "../store/use-compose-store";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { PlatformId, PostMedia } from "../types";
import {
  analyzePlatformCompatibility,
  getPlatformDisplayName,
  getRecommendedPlatforms,
} from "../utils/compatibility-engine";

const AVAILABLE_PLATFORMS: PlatformId[] = [
  "instagram",
  "twitter",
  "linkedin",
  "reddit",
  "telegram",
  "threads",
];

export function ComposeView() {
  const {
    createPost,
    openContextualPanel,
    composeDraft,
    setComposeDraft,
    communities,
    setCurrentSection,
  } = useDashboard();

  // Zustand Compose Store
  const {
    title,
    baseContent,
    mediaList,
    hasAudio,
    isAutoSelectPlatforms,
    selectedPlatforms,
    activeOverrideTab,
    platformOverrides,
    selectedCommunityIds,
    isScheduling,
    scheduleDateIso,
    setTitle,
    setBaseContent,
    addMedia,
    removeMedia,
    setHasAudio,
    setIsAutoSelectPlatforms,
    setSelectedPlatforms,
    togglePlatform,
    setActiveOverrideTab,
    setPlatformOverride,
    setSelectedCommunityIds,
    setIsScheduling,
    setScheduleDateIso,
    applyDraft,
    resetComposer,
  } = useComposeStore();

  // Consume incoming draft once
  useEffect(() => {
    if (composeDraft) {
      applyDraft({
        title: composeDraft.title,
        baseContent: composeDraft.baseContent,
        media: composeDraft.media,
        hasAudio: composeDraft.hasAudio,
        targetPlatforms: composeDraft.targetPlatforms,
        communityIds: composeDraft.communityIds,
        scheduledFor: composeDraft.scheduledFor,
        platformOverrides: composeDraft.platformOverrides,
      });
      setComposeDraft(null);
    }
  }, [composeDraft, setComposeDraft, applyDraft]);

  // Compute live compatibility with memoization
  const currentContentPayload = useMemo(
    () => ({
      text: baseContent,
      media: mediaList,
      hasAudio,
    }),
    [baseContent, mediaList, hasAudio],
  );

  const compatibilityMap = useMemo(
    () => AVAILABLE_PLATFORMS.map((p) => analyzePlatformCompatibility(p, currentContentPayload)),
    [currentContentPayload],
  );

  const recommendation = useMemo(
    () => getRecommendedPlatforms(currentContentPayload, AVAILABLE_PLATFORMS),
    [currentContentPayload],
  );

  // Safely sync selected platforms when auto-select is active
  const recommendedKey = useMemo(
    () =>
      [...recommendation.recommended, ...recommendation.compatibleWithModifications]
        .sort()
        .join(","),
    [recommendation],
  );

  useEffect(() => {
    if (isAutoSelectPlatforms) {
      const newSelected = [
        ...recommendation.recommended,
        ...recommendation.compatibleWithModifications,
      ];
      setSelectedPlatforms((prev) => {
        if (
          prev.length === newSelected.length &&
          prev.every((item) => newSelected.includes(item))
        ) {
          return prev;
        }
        return newSelected;
      });
    }
  }, [isAutoSelectPlatforms, recommendedKey, recommendation, setSelectedPlatforms]);

  const togglePlatformManual = (platformId: PlatformId) => {
    setIsAutoSelectPlatforms(false);
    togglePlatform(platformId);
  };

  const handleOpenPreview = () => {
    openContextualPanel("post_preview", {
      id: "preview-temp",
      title: title || "Untitled Post",
      baseContent,
      media: mediaList,
      hasAudio,
      targetPlatforms: selectedPlatforms,
      communityIds: selectedCommunityIds,
      platformOverrides,
      status: isScheduling ? "scheduled" : "published",
      scheduledFor: isScheduling ? new Date(scheduleDateIso).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      author: { name: "Gaurav" },
    });
  };

  const handlePublishOrSchedule = () => {
    const success = createPost({
      title: title || baseContent.slice(0, 40) + "...",
      baseContent,
      media: mediaList,
      hasAudio,
      targetPlatforms: selectedPlatforms,
      communityIds: selectedCommunityIds,
      platformOverrides,
      status: isScheduling ? "scheduled" : "published",
      scheduledFor: isScheduling ? new Date(scheduleDateIso).toISOString() : undefined,
      publishedAt: !isScheduling ? new Date().toISOString() : undefined,
      author: { name: "Gaurav" },
    });

    if (success) {
      resetComposer();
      setCurrentSection("posts");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Intelligent Composer
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Create Post
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Write your core message once. SocioConnect automatically adapts formatting, attachments,
            and length constraints per platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenPreview}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={handlePublishOrSchedule}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
          >
            {!isScheduling ? (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Publish Now</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Editor & Platform Customization */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Title / Internal Tag */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Post Title / Campaign Identifier (Internal)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SocioConnect 2.0 Engine Launch Announcement"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* Platform Tabs: Base + Specific Overrides */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <button
                  type="button"
                  onClick={() => setActiveOverrideTab("base")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeOverrideTab === "base"
                      ? "bg-rose-500/15 text-white border border-rose-500/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  All Platforms (Base)
                </button>

                {selectedPlatforms.map((p) => {
                  const hasOverride = platformOverrides[p]?.enabled;
                  const brand = getPlatformBrandColor(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActiveOverrideTab(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeOverrideTab === p
                          ? `${brand.bg} ${brand.text} ${brand.border} border`
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <PlatformIcon platformId={p} className="w-3.5 h-3.5" />
                      <span>{getPlatformDisplayName(p)}</span>
                      {hasOverride && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-neutral-500 hidden sm:block">
                {activeOverrideTab === "base"
                  ? `${baseContent.length} chars`
                  : `${platformOverrides[activeOverrideTab as PlatformId]?.caption?.length || baseContent.length} chars`}
              </div>
            </div>

            {/* BASE CONTENT TAB */}
            {activeOverrideTab === "base" && (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={baseContent}
                    onChange={(e) => setBaseContent(e.target.value)}
                    placeholder="What do you want to share across your network? Write once here..."
                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-sm text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/40 resize-y leading-relaxed font-sans"
                  />
                </div>

                {/* Editor Quick Tools Bar */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBaseContent(baseContent + " #SocioConnect #DevTools #Automation")
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition-colors cursor-pointer"
                    >
                      <Hash className="w-3 h-3 text-rose-400" />
                      <span>Hashtags</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseContent(baseContent + " 🚀✨")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition-colors cursor-pointer"
                    >
                      <Smile className="w-3 h-3 text-amber-400" />
                      <span>Emoji</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    Markdown supported on Telegram &amp; Reddit
                  </span>
                </div>
              </div>
            )}

            {/* REDDIT OVERRIDE TAB */}
            {activeOverrideTab === "reddit" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs">
                  <div className="flex items-center gap-2 text-orange-300">
                    <PlatformIcon platformId="reddit" className="w-4 h-4" />
                    <span>Custom Reddit dialect &amp; Subreddit target</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformOverrides.reddit?.enabled ?? true}
                      onChange={(e) =>
                        setPlatformOverride("reddit", {
                          enabled: e.target.checked,
                        })
                      }
                      className="rounded accent-rose-500"
                    />
                    <span className="text-[11px] text-neutral-300">
                      Enable Reddit Customization
                    </span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Reddit Post Title (Required for Reddit submissions)
                  </label>
                  <input
                    type="text"
                    value={platformOverrides.reddit?.title || ""}
                    onChange={(e) =>
                      setPlatformOverride("reddit", {
                        title: e.target.value,
                        enabled: true,
                      })
                    }
                    placeholder="Write an engaging title suited for developers/community..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Subreddit Target</label>
                    <select
                      value={platformOverrides.reddit?.subreddit || "r/programming"}
                      onChange={(e) =>
                        setPlatformOverride("reddit", {
                          subreddit: e.target.value,
                          enabled: true,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0e0e18] border border-white/10 text-xs text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="r/programming">r/programming (5.8M devs)</option>
                      <option value="r/webdev">r/webdev (2.1M devs)</option>
                      <option value="r/technology">r/technology (14M members)</option>
                      <option value="r/startups">r/startups (1.4M founders)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Flair Tag</label>
                    <input
                      type="text"
                      value={platformOverrides.reddit?.flair || "Showcase"}
                      onChange={(e) =>
                        setPlatformOverride("reddit", {
                          flair: e.target.value,
                          enabled: true,
                        })
                      }
                      placeholder="e.g. Showcase, Tutorial, Project"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* X / TWITTER OVERRIDE TAB */}
            {activeOverrideTab === "twitter" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-neutral-200">
                    <PlatformIcon platformId="twitter" className="w-4 h-4" />
                    <span>X (Twitter) 280-char Threading &amp; Dialect</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Custom X Tweet Text
                  </label>
                  <textarea
                    rows={4}
                    value={platformOverrides.twitter?.caption || baseContent}
                    onChange={(e) =>
                      setPlatformOverride("twitter", {
                        caption: e.target.value,
                        enabled: true,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TELEGRAM OVERRIDE TAB */}
            {activeOverrideTab === "telegram" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <PlatformIcon platformId="telegram" className="w-4 h-4" />
                    <span>Telegram Channel Broadcast Settings</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformOverrides.telegram?.silentBroadcast ?? false}
                      onChange={(e) =>
                        setPlatformOverride("telegram", {
                          silentBroadcast: e.target.checked,
                          enabled: true,
                        })
                      }
                      className="rounded accent-rose-500"
                    />
                    <span className="text-[11px] text-neutral-300">Silent Notification</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Telegram Message Format (Markdown Supported)
                  </label>
                  <textarea
                    rows={4}
                    value={platformOverrides.telegram?.caption || baseContent}
                    onChange={(e) =>
                      setPlatformOverride("telegram", {
                        caption: e.target.value,
                        enabled: true,
                      })
                    }
                    className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden leading-relaxed font-mono"
                  />
                </div>
              </div>
            )}

            {/* INSTAGRAM & LINKEDIN OVERRIDES */}
            {(activeOverrideTab === "instagram" ||
              activeOverrideTab === "linkedin" ||
              activeOverrideTab === "threads") && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">
                    Customize caption specifically for {getPlatformDisplayName(activeOverrideTab)}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={platformOverrides[activeOverrideTab]?.caption || baseContent}
                  onChange={(e) =>
                    setPlatformOverride(activeOverrideTab, {
                      caption: e.target.value,
                      enabled: true,
                    })
                  }
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-hidden leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Media Attachments Manager */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-white">
                  Media &amp; Soundtrack Attachments
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                {mediaList.length} Attached {mediaList.length > 1 ? "(Carousel)" : ""}
              </span>
            </div>

            {/* Attached Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-4/3 bg-black/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-mono text-neutral-300 truncate bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {m.name}
                  </div>
                </div>
              ))}

              {/* Add Media Slot */}
              <div className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl aspect-4/3 flex flex-col items-center justify-center p-3 text-center transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5 text-neutral-400">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <Video className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-[11px] font-medium text-neutral-300">Attach Asset</span>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {SAMPLE_MEDIA_LIBRARY.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => addMedia(sample)}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      + {sample.name.split("_")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio / Soundtrack Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Background Audio Soundtrack
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Auto-stripped for destinations that do not support soundtrack audio (e.g. X,
                    Reddit).
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAudio}
                  onChange={(e) => setHasAudio(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Intelligent Platform Compatibility Engine & Scheduling */}
        <div className="lg:col-span-4 space-y-6">
          {/* Compatibility Engine Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-white">
                  Platform Compatibility
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  openContextualPanel("compatibility_breakdown", currentContentPayload)
                }
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Spec</span>
                <Info className="w-3 h-3" />
              </button>
            </div>

            {/* Mode Switch: Auto-Select vs Choose Manually */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.03] border border-white/6 text-xs">
              <button
                type="button"
                onClick={() => setIsAutoSelectPlatforms(true)}
                className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isAutoSelectPlatforms
                    ? "bg-rose-500/20 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Auto-Select
              </button>
              <button
                type="button"
                onClick={() => setIsAutoSelectPlatforms(false)}
                className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  !isAutoSelectPlatforms
                    ? "bg-white/10 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Manual Override
              </button>
            </div>

            {/* Platform Compatibility Matrix List */}
            <div className="space-y-2">
              {compatibilityMap.map((analysis) => {
                const pid = analysis.platformId;
                const isSelected = selectedPlatforms.includes(pid);
                const brand = getPlatformBrandColor(pid);

                return (
                  <div
                    key={pid}
                    onClick={() => togglePlatformManual(pid)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.04] border-white/15"
                        : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center ${brand.bg} ${brand.border} ${brand.text}`}
                        >
                          <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {getPlatformDisplayName(pid)}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {analysis.status === "fully_compatible" && "Full Native Support"}
                            {analysis.status === "compatible_with_modifications" && "Auto-Adapted"}
                            {analysis.status === "incompatible" && "Incompatible format"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {analysis.status === "fully_compatible" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {analysis.status === "compatible_with_modifications" && (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        {analysis.status === "incompatible" && (
                          <X className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    </div>

                    {/* Explanatory banner for modifications */}
                    {analysis.modificationsSummary &&
                      analysis.modificationsSummary.length > 0 &&
                      isSelected && (
                        <p className="mt-2 text-[10px] text-amber-300/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-snug">
                          {analysis.modificationsSummary[0]}
                        </p>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Communities & Scheduling Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <h3 className="font-display text-sm font-semibold text-white border-b border-white/[0.06] pb-3">
              Distribution &amp; Timing
            </h3>

            {/* Target Communities */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Broadcast Community</label>
              <select
                value={selectedCommunityIds[0] || ""}
                onChange={(e) => setSelectedCommunityIds([e.target.value])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e18] border border-white/10 text-xs text-white focus:outline-hidden cursor-pointer"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.destinations.length} destinations)
                  </option>
                ))}
              </select>
            </div>

            {/* Publish Timing Selector */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className={`py-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    !isScheduling
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30 font-semibold"
                      : "bg-white/[0.02] text-neutral-400 border-white/5 hover:text-white"
                  }`}
                >
                  Publish Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduling(true)}
                  className={`py-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    isScheduling
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30 font-semibold"
                      : "bg-white/[0.02] text-neutral-400 border-white/5 hover:text-white"
                  }`}
                >
                  Schedule Slot
                </button>
              </div>

              {isScheduling && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-mono text-neutral-400">
                    Select Target Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDateIso}
                    onChange={(e) => setScheduleDateIso(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-hidden font-mono"
                  />
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    Recommended peak engagement slot
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
