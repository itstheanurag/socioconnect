"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Upload,
  Link as LinkIcon,
  Tag,
  BookOpen,
  MessageSquare,
  Shield,
  Film,
  Plus,
  Radio,
} from "lucide-react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import {
  useComposeStore,
  SAMPLE_MEDIA_LIBRARY,
} from "@/component/dashboard/store/use-compose-store";
import { useNotification } from "@/context/notification-context";
import {
  PlatformIcon,
  getPlatformBrandColor,
  getPlatformDisplayName,
} from "@/component/dashboard/ui/platform-icon";
import { CustomSelect, CustomSelectOption } from "@/component/dashboard/ui/custom-select";
import { PlatformId, PostMedia, PlatformOverride, PostItem } from "@/component/dashboard/types";
import { analyzePlatformCompatibility } from "@/component/dashboard/utils/compatibility-engine";

const POPULAR_PLATFORM_POOL: PlatformId[] = [
  "twitter",
  "linkedin",
  "instagram",
  "telegram",
  "reddit",
  "threads",
  "youtube",
  "tiktok",
  "discord",
  "slack",
  "medium",
  "devto",
  "hashnode",
  "wordpress",
  "github",
  "mastodon",
  "bluesky",
  "whatsapp",
];

const VISIBILITY_OPTIONS: CustomSelectOption[] = [
  { value: "public", label: "Public (Instant Broadcast)" },
  { value: "unlisted", label: "Unlisted (Shareable link only)" },
  { value: "private", label: "Private (Restricted)" },
];

const SUBREDDIT_OPTIONS: CustomSelectOption[] = [
  { value: "r/programming", label: "r/programming (5.8M devs)" },
  { value: "r/webdev", label: "r/webdev (2.1M devs)" },
  { value: "r/technology", label: "r/technology (14M members)" },
  { value: "r/startups", label: "r/startups (1.4M founders)" },
];

export function ComposeView() {
  const {
    setCurrentSection,
    createPost,
    communities,
    connectors,
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Derive dynamic platforms from user connectors + popular pool
  const allAvailablePlatformIds = useMemo(() => {
    const fromConnectors = connectors.map((c) => c.platformId);
    const combined = Array.from(new Set([...fromConnectors, ...POPULAR_PLATFORM_POOL]));
    return combined;
  }, [connectors]);

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

  const compatibilityMap = allAvailablePlatformIds.map((pid) =>
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

  // Simulated direct-to-R2 upload handler
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);

    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            const newMedia: PostMedia = {
              id: `upload-${Date.now()}`,
              type: isVideo ? "video" : isAudio ? "audio" : "image",
              url: URL.createObjectURL(file),
              name: file.name,
              sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
              aspectRatio: isVideo ? "16:9" : "1:1",
            };
            addMedia(newMedia);
            setIsUploading(false);
            setUploadProgress(0);
            toast.success(
              "Media Uploaded to R2",
              `${file.name} is ready for multi-channel dispatch.`,
            );
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

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

  // Helper to determine platform archetype
  const getPlatformArchetype = (
    pid: PlatformId,
  ): "publishing" | "video" | "community" | "developer" | "visual" | "social" => {
    if (
      [
        "medium",
        "devto",
        "hashnode",
        "wordpress",
        "ghost",
        "substack",
        "beehiiv",
        "tumblr",
      ].includes(pid)
    )
      return "publishing";
    if (["youtube", "tiktok", "twitch", "kick"].includes(pid)) return "video";
    if (
      [
        "reddit",
        "telegram",
        "whatsapp",
        "discord",
        "slack",
        "lemmy",
        "skool",
        "whop",
        "hackernews",
      ].includes(pid)
    )
      return "community";
    if (["github", "gitlab", "producthunt", "notion"].includes(pid)) return "developer";
    if (["pinterest", "dribbble", "behance"].includes(pid)) return "visual";
    return "social";
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
            Craft your message once, tune dialect per network, and dispatch across 40+ destinations.
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
          {/* Post Title / Internal Campaign Tag */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Campaign / Post Identifier (Internal)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SocioConnect 2.0 Engine Launch Announcement"
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* Platform Tabs: Base + Target-Specific Overrides */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-[calc(100%-80px)]">
                <button
                  type="button"
                  onClick={() => setActiveOverrideTab("base")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeOverrideTab === "base"
                      ? "bg-rose-500/15 text-neutral-100 border border-rose-500/30"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                  }`}
                >
                  All Platforms (Master)
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

            {/* MASTER BASE CONTENT TAB */}
            {activeOverrideTab === "base" && (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={baseContent}
                    onChange={(e) => setBaseContent(e.target.value)}
                    placeholder="Write your master content here. SocioConnect will automatically adapt character limits, hashtags, and media constraints per network..."
                    className="w-full p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/40 resize-y leading-relaxed font-sans"
                  />
                </div>

                {/* Editor Quick Tools Bar */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBaseContent(
                          baseContent +
                            (baseContent ? "\n\n" : "") +
                            "#SocioConnect #DeveloperTools #Automation",
                        )
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
                    Supports Markdown on Telegram, Reddit, Discord, Slack, Medium &amp; Dev.to
                  </span>
                </div>
              </div>
            )}

            {/* DYNAMIC PLATFORM-SPECIFIC OVERRIDE TABS */}
            {activeOverrideTab !== "base" &&
              (() => {
                const pid = activeOverrideTab as PlatformId;
                const archetype = getPlatformArchetype(pid);
                const override: Partial<PlatformOverride> = platformOverrides[pid] ?? {};

                return (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Platform Header Banner */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                      <div className="flex items-center gap-2 text-neutral-200">
                        <PlatformIcon platformId={pid} className="w-4 h-4" />
                        <span className="font-semibold">
                          {getPlatformDisplayName(pid)} Customization
                        </span>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={override.enabled ?? true}
                          onChange={(e) =>
                            setPlatformOverride(pid, {
                              enabled: e.target.checked,
                            })
                          }
                          className="rounded accent-rose-500"
                        />
                        <span className="text-[11px] text-neutral-300">Enable Custom Dialect</span>
                      </label>
                    </div>

                    {/* 1. BLOGGING & PUBLISHING ARCHETYPE (Medium, WordPress, Dev.to, Hashnode, Ghost, Substack, Beehiiv) */}
                    {archetype === "publishing" && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-rose-400" />
                              <span>Article Headline / Title</span>
                            </label>
                            <input
                              type="text"
                              value={override.title || title}
                              onChange={(e) =>
                                setPlatformOverride(pid, {
                                  title: e.target.value,
                                  enabled: true,
                                })
                              }
                              placeholder="Enter publication headline..."
                              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-sky-400" />
                              <span>Canonical URL (SEO Attribution)</span>
                            </label>
                            <input
                              type="url"
                              value={override.canonicalUrl || ""}
                              onChange={(e) =>
                                setPlatformOverride(pid, {
                                  canonicalUrl: e.target.value,
                                  enabled: true,
                                })
                              }
                              placeholder="https://mysite.com/blog/article-slug"
                              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                            <span>Article Body (Markdown / HTML)</span>
                            <span className="text-[10px] font-mono text-neutral-500">
                              Images are embedded inline in order
                            </span>
                          </label>
                          <textarea
                            rows={6}
                            value={override.caption || baseContent}
                            onChange={(e) =>
                              setPlatformOverride(pid, {
                                caption: e.target.value,
                                enabled: true,
                              })
                            }
                            className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. VIDEO ARCHETYPE (YouTube, TikTok, Twitch, Kick) */}
                    {archetype === "video" && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1">
                            <Film className="w-3 h-3 text-red-400" />
                            <span>Video Title (Required for YouTube / Clips)</span>
                          </label>
                          <input
                            type="text"
                            value={override.title || title}
                            onChange={(e) =>
                              setPlatformOverride(pid, {
                                title: e.target.value,
                                enabled: true,
                              })
                            }
                            placeholder="e.g. Next-Gen Cross-Platform Architecture Deep Dive"
                            className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300">
                              Visibility
                            </label>
                            <CustomSelect
                              value={override.privacyStatus || "public"}
                              onChange={(val) =>
                                setPlatformOverride(pid, {
                                  privacyStatus: val as "public" | "unlisted" | "private",
                                  enabled: true,
                                })
                              }
                              options={VISIBILITY_OPTIONS}
                              className="w-full"
                              buttonClassName="w-full py-2 bg-neutral-950/60"
                            />
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 self-end">
                            <span className="text-xs text-neutral-300">Made for Kids</span>
                            <input
                              type="checkbox"
                              checked={override.madeForKids ?? false}
                              onChange={(e) =>
                                setPlatformOverride(pid, {
                                  madeForKids: e.target.checked,
                                  enabled: true,
                                })
                              }
                              className="rounded accent-rose-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300">
                            Video Description &amp; Links
                          </label>
                          <textarea
                            rows={4}
                            value={override.caption || baseContent}
                            onChange={(e) =>
                              setPlatformOverride(pid, {
                                caption: e.target.value,
                                enabled: true,
                              })
                            }
                            className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* 3. COMMUNITY ARCHETYPE (Reddit, Telegram, WhatsApp, Discord, Slack, Lemmy, Hacker News) */}
                    {archetype === "community" && (
                      <div className="space-y-3.5">
                        {pid === "reddit" && (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-neutral-300">
                                Reddit Submission Title <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={override.title || title}
                                onChange={(e) =>
                                  setPlatformOverride("reddit", {
                                    title: e.target.value,
                                    enabled: true,
                                  })
                                }
                                placeholder="Write a clear title suited for developers..."
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-neutral-300">
                                  Subreddit Target
                                </label>
                                <CustomSelect
                                  value={override.subreddit || "r/programming"}
                                  onChange={(val) =>
                                    setPlatformOverride("reddit", {
                                      subreddit: val,
                                      enabled: true,
                                    })
                                  }
                                  options={SUBREDDIT_OPTIONS}
                                  className="w-full"
                                  buttonClassName="w-full py-2 bg-neutral-950/60"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-neutral-300">
                                  Flair Tag
                                </label>
                                <input
                                  type="text"
                                  value={override.flair || "Showcase"}
                                  onChange={(e) =>
                                    setPlatformOverride("reddit", {
                                      flair: e.target.value,
                                      enabled: true,
                                    })
                                  }
                                  placeholder="e.g. Showcase, Tutorial"
                                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {(pid === "telegram" || pid === "whatsapp") && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                            <span className="text-neutral-300">Silent Broadcast Notification</span>
                            <input
                              type="checkbox"
                              checked={override.silentBroadcast ?? false}
                              onChange={(e) =>
                                setPlatformOverride(pid, {
                                  silentBroadcast: e.target.checked,
                                  enabled: true,
                                })
                              }
                              className="rounded accent-rose-500"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300">
                            {pid.toUpperCase()} Channel Body Format
                          </label>
                          <textarea
                            rows={4}
                            value={override.caption || baseContent}
                            onChange={(e) =>
                              setPlatformOverride(pid, {
                                caption: e.target.value,
                                enabled: true,
                              })
                            }
                            className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. SOCIAL & MICROBLOGS (X, Threads, Bluesky, Mastodon, Warpcast, Nostr, VK, MeWe, LinkedIn, Facebook) */}
                    {(archetype === "social" ||
                      archetype === "developer" ||
                      archetype === "visual") && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                            <span>Custom Dialect for {getPlatformDisplayName(pid)}</span>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {(override.caption || baseContent).length} chars
                            </span>
                          </label>
                          <textarea
                            rows={4}
                            value={override.caption || baseContent}
                            onChange={(e) =>
                              setPlatformOverride(pid, {
                                caption: e.target.value,
                                enabled: true,
                              })
                            }
                            className="w-full p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>

          {/* Media & Cloudflare R2 Upload Manager */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-neutral-100">
                  Media &amp; Cloudflare R2 Attachments
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                {mediaList.length} Attached {mediaList.length > 1 ? "(Carousel)" : ""}
              </span>
            </div>

            {/* Upload Progress Bar if active */}
            {isUploading && (
              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-mono flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 animate-bounce text-rose-400" />
                    Uploading directly to Cloudflare R2...
                  </span>
                  <span className="text-rose-400 font-mono font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

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
                      title="Remove asset"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-mono text-neutral-300 truncate bg-neutral-900/80 px-1.5 py-0.5 rounded backdrop-blur-xs border border-neutral-800">
                    {m.name} ({m.sizeMb}MB)
                  </div>
                </div>
              ))}

              {/* Direct Upload Dropzone */}
              <label className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl aspect-4/3 flex flex-col items-center justify-center p-3 text-center transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center text-neutral-300 mb-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-[11px] font-medium text-neutral-200">Upload Asset</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">R2 Presigned Direct PUT</span>
              </label>
            </div>

            {/* Quick Presets Strip */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px] font-mono text-neutral-400">
              <span className="text-neutral-500">Sample Assets:</span>
              {SAMPLE_MEDIA_LIBRARY.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => addMedia(sample)}
                  className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                >
                  + {sample.name.split("_")[0]}
                </button>
              ))}
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
                    Auto-stripped for platforms without audio tracks (X, Reddit, LinkedIn).
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
                Manual Select
              </button>
            </div>

            {/* Platform Compatibility Matrix List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
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

            {/* Target Communities Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-300">
                Broadcast to Community Group
              </label>
              <div className="space-y-1.5">
                {communities.map((comm) => {
                  const isChecked = selectedCommunityIds.includes(comm.id);
                  return (
                    <div
                      key={comm.id}
                      onClick={() => {
                        setSelectedCommunityIds((prev) =>
                          prev.includes(comm.id)
                            ? prev.filter((id) => id !== comm.id)
                            : [...prev, comm.id],
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-neutral-800 border-neutral-700 text-neutral-100"
                          : "bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: comm.color }}
                        />
                        <span className="font-medium">{comm.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {comm.destinations.length} channels
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduling Toggle & Date Picker */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">Schedule for Later</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduling}
                    onChange={(e) => setIsScheduling(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-neutral-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-200 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
                </label>
              </div>

              {isScheduling && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-mono text-neutral-400">
                    Dispatch Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDateIso.slice(0, 16)}
                    onChange={(e) => setScheduleDateIso(new Date(e.target.value).toISOString())}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-100 focus:outline-hidden focus:border-rose-500/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
