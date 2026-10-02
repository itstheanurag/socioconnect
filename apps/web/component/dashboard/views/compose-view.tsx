"use client";

import React, { useEffect } from "react";
import {
  Send,
  Calendar,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Video,
  Music,
  Smile,
  Hash,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Eye,
} from "lucide-react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { useComposeStore, SAMPLE_MEDIA_LIBRARY } from "@/component/dashboard/store/use-compose-store";
import { useNotification } from "@/context/notification-context";
import { PlatformIcon, getPlatformBrandColor, getPlatformDisplayName } from "@/component/dashboard/ui/platform-icon";
import { PlatformId, PostMedia, PlatformOverride, PostItem } from "@/component/dashboard/types";
import { analyzePlatformCompatibility } from "@/component/dashboard/utils/compatibility-engine";

const ALL_PLATFORMS: PlatformId[] = [
  "twitter",
  "linkedin",
  "instagram",
  "telegram",
  "reddit",
  "threads",
];

export function ComposeView() {
  const {
    setCurrentSection,
    createPost,
    communities,
    openContextualPanel,
    composeDraft,
    setComposeDraft,
  } = useDashboard();

  const {
    title,
    setTitle,
    baseContent,
    setBaseContent,
    mediaList,
    addMedia,
    removeMedia,
    hasAudio,
    setHasAudio,
    isAutoSelectPlatforms,
    setIsAutoSelectPlatforms,
    selectedPlatforms,
    setSelectedPlatforms,
    togglePlatform,
    activeOverrideTab,
    setActiveOverrideTab,
    platformOverrides,
    setPlatformOverride,
    selectedCommunityIds,
    setSelectedCommunityIds,
    isScheduling,
    setIsScheduling,
    scheduleDateIso,
    setScheduleDateIso,
    applyDraft,
    resetComposer,
  } = useComposeStore();

  const { toast } = useNotification();

  // Apply draft if navigated with draft parameters
  useEffect(() => {
    if (composeDraft) {
      applyDraft(composeDraft);
      setComposeDraft(null);
    }
  }, [composeDraft, applyDraft, setComposeDraft]);

  // Compatibility analysis
  const contentInput = {
    text: baseContent,
    media: mediaList,
    hasAudio,
  };

  const compatibilityMap = ALL_PLATFORMS.map((pid) =>
    analyzePlatformCompatibility(pid, contentInput),
  );

  // Auto platform selection based on compatibility
  useEffect(() => {
    if (isAutoSelectPlatforms) {
      const compatible = compatibilityMap
        .filter(
          (c) => c.status === "fully_compatible" || c.status === "compatible_with_modifications",
        )
        .map((c) => c.platformId);
      if (compatible.length > 0) {
        setSelectedPlatforms(compatible);
      }
    }
  }, [baseContent, mediaList.length, hasAudio, isAutoSelectPlatforms]);

  const handlePublishOrSchedule = () => {
    if (!title.trim()) {
      toast.error("Title Required", "Please specify a campaign title for internal organization.");
      return;
    }
    if (!baseContent.trim()) {
      toast.error("Content Empty", "Please write master content to broadcast.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("No Platforms Selected", "Select at least one destination network.");
      return;
    }

    const ok = createPost({
      title,
      baseContent,
      author: {
        name: "Admin User",
      },
      targetPlatforms: selectedPlatforms,
      communityIds: selectedCommunityIds,
      media: mediaList,
      hasAudio,
      status: isScheduling ? "scheduled" : "published",
      scheduledFor: isScheduling ? scheduleDateIso : undefined,
      platformOverrides,
    });

    if (ok) {
      resetComposer();
      setCurrentSection("posts");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Universal Omnichannel Composer
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Craft your message once, tune dialect per network, and dispatch in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const previewItem: PostItem = {
                id: "preview-temp",
                title: title || "Untitled Post",
                baseContent,
                author: {
                  name: "Admin User",
                },
                targetPlatforms: selectedPlatforms,
                communityIds: selectedCommunityIds,
                media: mediaList,
                hasAudio,
                status: "draft",
                platformOverrides,
                createdAt: new Date().toISOString(),
              };
              openContextualPanel("post_preview", previewItem);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={handlePublishOrSchedule}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
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
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* Platform Tabs: Base + Specific Overrides */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <button
                  type="button"
                  onClick={() => setActiveOverrideTab("base")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeOverrideTab === "base"
                      ? "bg-rose-500/15 text-neutral-100 border border-rose-500/30"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
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
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
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
                    className="w-full p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/40 resize-y leading-relaxed font-sans"
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
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-100 border border-neutral-700/60 transition-colors cursor-pointer"
                    >
                      <Hash className="w-3 h-3 text-rose-400" />
                      <span>Hashtags</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseContent(baseContent + " 🚀✨")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-100 border border-neutral-700/60 transition-colors cursor-pointer"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-orange-500/50"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-hidden cursor-pointer"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* X / TWITTER OVERRIDE TAB */}
            {activeOverrideTab === "twitter" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
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
                    className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed"
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
                    className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed font-mono"
                  />
                </div>
              </div>
            )}

            {/* INSTAGRAM & LINKEDIN OVERRIDES */}
            {(activeOverrideTab === "instagram" ||
              activeOverrideTab === "linkedin" ||
              activeOverrideTab === "threads") && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs flex items-center justify-between">
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
                  className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Media Attachments Manager */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-neutral-100">
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
                  className="relative group rounded-2xl overflow-hidden border border-neutral-800 aspect-4/3 bg-neutral-950"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="p-1.5 rounded-lg bg-rose-600/90 text-neutral-100 hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-mono text-neutral-300 truncate bg-neutral-900/80 px-1.5 py-0.5 rounded backdrop-blur-xs border border-neutral-800">
                    {m.name}
                  </div>
                </div>
              ))}

              {/* Add Media Slot */}
              <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl aspect-4/3 flex flex-col items-center justify-center p-3 text-center transition-colors">
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
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                    >
                      + {sample.name.split("_")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio / Soundtrack Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100">
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
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-neutral-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-200 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Intelligent Platform Compatibility Engine & Scheduling */}
        <div className="lg:col-span-4 space-y-6">
          {/* Compatibility Engine Card */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-neutral-100">
                  Platform Compatibility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openContextualPanel("compatibility_breakdown", compatibilityMap)}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Spec</span>
                <Info className="w-3 h-3" />
              </button>
            </div>

            {/* Mode Switch: Auto-Select vs Choose Manually */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setIsAutoSelectPlatforms(true)}
                className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isAutoSelectPlatforms
                    ? "bg-rose-500/20 text-rose-300 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Auto-Select
              </button>
              <button
                type="button"
                onClick={() => setIsAutoSelectPlatforms(false)}
                className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  !isAutoSelectPlatforms
                    ? "bg-neutral-800 text-neutral-100 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
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
                    onClick={() => {
                      setIsAutoSelectPlatforms(false);
                      togglePlatform(pid);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-neutral-800/80 border-neutral-700 shadow-xs"
                        : "bg-neutral-950/40 border-neutral-800/80 opacity-60 hover:opacity-100"
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
                          <div className="text-xs font-semibold text-neutral-100">
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
                        <p className="mt-2 text-[10px] text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                          {analysis.modificationsSummary[0]}
                        </p>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Communities & Scheduling Card */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <h3 className="font-display text-sm font-semibold text-neutral-100 border-b border-neutral-800 pb-3">
              Distribution &amp; Timing
            </h3>

            {/* Target Communities */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Broadcast Community</label>
              <select
                value={selectedCommunityIds[0] || ""}
                onChange={(e) => setSelectedCommunityIds([e.target.value])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-hidden cursor-pointer"
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
                      : "bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200"
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
                      : "bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-hidden font-mono"
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
