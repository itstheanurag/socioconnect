import { create } from "zustand";
import { apiClient } from "../api-client";
import type { TimingStrategy } from "@repo/contracts";

export interface PlatformOverride {
  customTitle?: string;
  customContent?: string;
  scheduledFor?: string;
}

export interface ComposerState {
  title: string;
  content: string;
  tags: string[];
  selectedPlatforms: string[];
  timingStrategy: TimingStrategy;
  scheduledAt: string | null;
  platformOverrides: Record<string, PlatformOverride>;
  isSubmitting: boolean;
  lastCreatedPostId: string | null;

  // Actions
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  togglePlatform: (platform: string) => void;
  setSelectedPlatforms: (platforms: string[]) => void;
  setTimingStrategy: (strategy: TimingStrategy) => void;
  setScheduledAt: (date: string | null) => void;
  setPlatformOverride: (platform: string, override: Partial<PlatformOverride>) => void;
  publishPost: (accountId: string) => Promise<{ success: boolean; postId?: string; error?: string }>;
  reset: () => void;
}

const INITIAL_STATE = {
  title: "",
  content: "",
  tags: ["creator", "launch"],
  selectedPlatforms: ["youtube", "instagram", "x", "linkedin"],
  timingStrategy: "simultaneous" as TimingStrategy,
  scheduledAt: null,
  platformOverrides: {},
  isSubmitting: false,
  lastCreatedPostId: null,
};

export const useComposerStore = create<ComposerState>((set, get) => ({
  ...INITIAL_STATE,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setTags: (tags) => set({ tags }),
  addTag: (tag) => {
    const clean = tag.replace(/^#/, "").trim();
    if (clean && !get().tags.includes(clean)) {
      set({ tags: [...get().tags, clean] });
    }
  },
  removeTag: (tag) => set({ tags: get().tags.filter((t) => t !== tag) }),

  togglePlatform: (platform) => {
    const current = get().selectedPlatforms;
    const exists = current.includes(platform);
    set({
      selectedPlatforms: exists
        ? current.filter((p) => p !== platform)
        : [...current, platform],
    });
  },

  setSelectedPlatforms: (selectedPlatforms) => set({ selectedPlatforms }),
  setTimingStrategy: (timingStrategy) => set({ timingStrategy }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),

  setPlatformOverride: (platform, override) => {
    const currentOverrides = get().platformOverrides;
    set({
      platformOverrides: {
        ...currentOverrides,
        [platform]: {
          ...(currentOverrides[platform] || {}),
          ...override,
        },
      },
    });
  },

  publishPost: async (accountId: string) => {
    const { title, content, tags, selectedPlatforms, timingStrategy, scheduledAt, platformOverrides } =
      get();

    if (!content.trim() || selectedPlatforms.length === 0) {
      return { success: false, error: "Content and at least one channel are required." };
    }

    set({ isSubmitting: true });

    try {
      const dispatches = selectedPlatforms.map((platform) => {
        const override = platformOverrides[platform];
        return {
          accountId,
          platform,
          customTitle: override?.customTitle || title || undefined,
          customContent: override?.customContent || content,
          scheduledFor: override?.scheduledFor || scheduledAt || undefined,
        };
      });

      const response = await apiClient.posts.create({
        title: title || undefined,
        content,
        tags,
        timingStrategy,
        scheduledAt: scheduledAt || undefined,
        dispatches,
      });

      const postId = response.payload.post.id;
      set({ lastCreatedPostId: postId, isSubmitting: false });
      return { success: true, postId };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to publish post";
      set({ isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },

  reset: () => set(INITIAL_STATE),
}));
