"use client";

import { create } from "zustand";
import { PlatformId, PostMedia, PlatformOverride } from "../types";

export const SAMPLE_MEDIA_LIBRARY: PostMedia[] = [
  {
    id: "lib-1",
    type: "image",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    name: "launch_gradient_visual.png",
    sizeMb: 2.1,
  },
  {
    id: "lib-2",
    type: "image",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    name: "feature_matrix.png",
    sizeMb: 1.8,
  },
  {
    id: "lib-3",
    type: "image",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    name: "architecture_diagram.png",
    sizeMb: 3.4,
  },
];

export interface ComposeState {
  title: string;
  baseContent: string;
  mediaList: PostMedia[];
  hasAudio: boolean;
  isAutoSelectPlatforms: boolean;
  selectedPlatforms: PlatformId[];
  activeOverrideTab: "base" | PlatformId;
  platformOverrides: Partial<Record<PlatformId, PlatformOverride>>;
  selectedCommunityIds: string[];
  isScheduling: boolean;
  scheduleDateIso: string;
  isAiOptimizing: boolean;

  // Setters & Actions
  setTitle: (title: string) => void;
  setBaseContent: (content: string) => void;
  setMediaList: (media: PostMedia[] | ((prev: PostMedia[]) => PostMedia[])) => void;
  addMedia: (media: PostMedia) => void;
  removeMedia: (mediaId: string) => void;
  setHasAudio: (hasAudio: boolean) => void;
  setIsAutoSelectPlatforms: (autoSelect: boolean) => void;
  setSelectedPlatforms: (platforms: PlatformId[] | ((prev: PlatformId[]) => PlatformId[])) => void;
  togglePlatform: (platformId: PlatformId) => void;
  setActiveOverrideTab: (tab: "base" | PlatformId) => void;
  setPlatformOverride: (platformId: PlatformId, updates: Partial<PlatformOverride>) => void;
  setSelectedCommunityIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  toggleCommunity: (communityId: string) => void;
  setIsScheduling: (scheduling: boolean) => void;
  setScheduleDateIso: (dateIso: string) => void;
  setIsAiOptimizing: (optimizing: boolean) => void;
  resetComposer: () => void;
  applyDraft: (
    draft: Partial<{
      title: string;
      baseContent: string;
      media: PostMedia[];
      hasAudio: boolean;
      targetPlatforms: PlatformId[];
      communityIds: string[];
      scheduledFor: string;
      platformOverrides: Partial<Record<PlatformId, PlatformOverride>>;
    }>,
  ) => void;
}

const DEFAULT_BASE_CONTENT =
  "🚀 Introducing SocioConnect 2.0 — create content once, and Socioconnect intelligently adapts it to the platforms where it makes sense.\n\nExperience platform-aware formatting, autonomous Telegram bots, and unified scheduling.";

export const useComposeStore = create<ComposeState>((set) => ({
  title: "",
  baseContent: DEFAULT_BASE_CONTENT,
  mediaList: [SAMPLE_MEDIA_LIBRARY[0], SAMPLE_MEDIA_LIBRARY[1]],
  hasAudio: true,
  isAutoSelectPlatforms: true,
  selectedPlatforms: ["instagram", "twitter", "linkedin", "reddit", "telegram"],
  activeOverrideTab: "base",
  platformOverrides: {
    reddit: {
      enabled: true,
      subreddit: "r/programming",
      flair: "Showcase",
      title: "SocioConnect 2.0: Platform-aware social orchestration engine",
      caption:
        "Built a tool to solve social publishing nuances across disparate platforms. Supports auto media extraction and Telegram bot routing.",
    },
    twitter: {
      enabled: false,
      caption: "SocioConnect 2.0 is live! Publish everywhere without looking generic ⚡",
    },
    telegram: {
      enabled: false,
      silentBroadcast: false,
      caption: "🚨 **SocioConnect v2 Announcement**\nNew updates available in the repository.",
    },
  },
  selectedCommunityIds: ["comm-1"],
  isScheduling: false,
  scheduleDateIso: "2026-10-04T10:00",
  isAiOptimizing: false,

  setTitle: (title) => set({ title }),
  setBaseContent: (baseContent) => set({ baseContent }),
  setMediaList: (media) =>
    set((state) => ({
      mediaList: typeof media === "function" ? media(state.mediaList) : media,
    })),
  addMedia: (media) => set((state) => ({ mediaList: [...state.mediaList, media] })),
  removeMedia: (mediaId) =>
    set((state) => ({ mediaList: state.mediaList.filter((m) => m.id !== mediaId) })),
  setHasAudio: (hasAudio) => set({ hasAudio }),
  setIsAutoSelectPlatforms: (isAutoSelectPlatforms) => set({ isAutoSelectPlatforms }),
  setSelectedPlatforms: (platforms) =>
    set((state) => ({
      selectedPlatforms:
        typeof platforms === "function" ? platforms(state.selectedPlatforms) : platforms,
    })),
  togglePlatform: (platformId) =>
    set((state) => {
      const exists = state.selectedPlatforms.includes(platformId);
      return {
        selectedPlatforms: exists
          ? state.selectedPlatforms.filter((p) => p !== platformId)
          : [...state.selectedPlatforms, platformId],
      };
    }),
  setActiveOverrideTab: (activeOverrideTab) => set({ activeOverrideTab }),
  setPlatformOverride: (platformId, updates) =>
    set((state) => ({
      platformOverrides: {
        ...state.platformOverrides,
        [platformId]: {
          ...(state.platformOverrides[platformId] || { enabled: true }),
          ...updates,
        },
      },
    })),
  setSelectedCommunityIds: (ids) =>
    set((state) => ({
      selectedCommunityIds: typeof ids === "function" ? ids(state.selectedCommunityIds) : ids,
    })),
  toggleCommunity: (communityId) =>
    set((state) => {
      const exists = state.selectedCommunityIds.includes(communityId);
      return {
        selectedCommunityIds: exists
          ? state.selectedCommunityIds.filter((id) => id !== communityId)
          : [...state.selectedCommunityIds, communityId],
      };
    }),
  setIsScheduling: (isScheduling) => set({ isScheduling }),
  setScheduleDateIso: (scheduleDateIso) => set({ scheduleDateIso }),
  setIsAiOptimizing: (isAiOptimizing) => set({ isAiOptimizing }),
  resetComposer: () =>
    set({
      title: "",
      baseContent: DEFAULT_BASE_CONTENT,
      mediaList: [SAMPLE_MEDIA_LIBRARY[0], SAMPLE_MEDIA_LIBRARY[1]],
      hasAudio: true,
      isAutoSelectPlatforms: true,
      selectedPlatforms: ["instagram", "twitter", "linkedin", "reddit", "telegram"],
      activeOverrideTab: "base",
      isScheduling: false,
      isAiOptimizing: false,
    }),
  applyDraft: (draft) =>
    set((state) => ({
      title: draft.title !== undefined ? draft.title : state.title,
      baseContent: draft.baseContent !== undefined ? draft.baseContent : state.baseContent,
      mediaList: draft.media && draft.media.length > 0 ? draft.media : state.mediaList,
      hasAudio: draft.hasAudio !== undefined ? draft.hasAudio : state.hasAudio,
      selectedPlatforms:
        draft.targetPlatforms && draft.targetPlatforms.length > 0
          ? draft.targetPlatforms
          : state.selectedPlatforms,
      selectedCommunityIds:
        draft.communityIds && draft.communityIds.length > 0
          ? draft.communityIds
          : state.selectedCommunityIds,
      scheduleDateIso: draft.scheduledFor || state.scheduleDateIso,
      isScheduling: Boolean(draft.scheduledFor),
      platformOverrides: draft.platformOverrides
        ? { ...state.platformOverrides, ...draft.platformOverrides }
        : state.platformOverrides,
    })),
}));
