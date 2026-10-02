"use client";

import { create } from "zustand";
import {
  DashboardSection,
  ContextualPanelState,
  PostItem,
  ConnectorAccount,
  Community,
  TelegramBot,
  AutomationRule,
  PlatformId,
} from "../types";
import {
  DashboardSectionSchema,
  CreatePostInputSchema,
  CreateCommunityInputSchema,
  CreateTelegramBotInputSchema,
  CreateAutomationRuleInputSchema,
} from "../schemas";
import {
  INITIAL_POSTS,
  INITIAL_CONNECTORS,
  INITIAL_COMMUNITIES,
  INITIAL_BOTS,
  INITIAL_AUTOMATIONS,
} from "../data/mock-data";

interface NotificationHandler {
  success?: (title: string, message?: string) => void;
  error?: (title: string, message?: string) => void;
  info?: (title: string, message?: string) => void;
}

// Global notification listener hook point
let globalNotifier: NotificationHandler = {};

export function setDashboardStoreNotifier(notifier: NotificationHandler) {
  globalNotifier = notifier;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

const WORKSPACES_INITIAL: Workspace[] = [
  {
    id: "ws-1",
    name: "SocioConnect HQ",
    slug: "socioconnect-hq",
    plan: "Enterprise",
    memberCount: 12,
  },
  { id: "ws-2", name: "Personal Brand", slug: "personal", plan: "Pro", memberCount: 1 },
];

export interface DashboardState {
  // Navigation
  currentSection: DashboardSection;
  isSidebarCollapsed: boolean;
  setCurrentSection: (section: DashboardSection) => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Contextual Panel
  contextualPanel: ContextualPanelState;
  openContextualPanel: (type: ContextualPanelState["type"], data?: any) => void;
  closeContextualPanel: () => void;

  // Search & Workspace
  searchQuery: string;
  isGlobalSearchOpen: boolean;
  setSearchQuery: (q: string) => void;
  setIsGlobalSearchOpen: (open: boolean) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;

  // Drafts & Composer Navigation
  composeDraft: Partial<PostItem> | null;
  setComposeDraft: (draft: Partial<PostItem> | null) => void;
  navigateToCompose: (preset?: {
    communityIds?: string[];
    targetPlatforms?: PlatformId[];
    initialText?: string;
    scheduledFor?: string;
  }) => void;

  // Collections
  posts: PostItem[];
  connectors: ConnectorAccount[];
  communities: Community[];
  bots: TelegramBot[];
  automations: AutomationRule[];

  // Post Actions (Zod-validated)
  createPost: (post: Omit<PostItem, "id" | "createdAt">) => boolean;
  updatePost: (id: string, updates: Partial<PostItem>) => void;
  deletePost: (id: string) => void;
  reschedulePost: (id: string, newDateIso: string) => void;
  duplicatePost: (id: string) => void;

  // Community Actions (Zod-validated)
  createCommunity: (comm: Omit<Community, "id" | "createdAt" | "postCount">) => boolean;
  addCommunity: (comm: Omit<Community, "id" | "createdAt" | "postCount">) => boolean;
  deleteCommunity: (id: string) => void;

  // Telegram Bot Actions (Zod-validated)
  createBot: (bot: Omit<TelegramBot, "id" | "scheduledQueueCount" | "lastActive">) => boolean;
  addBot: (bot: Omit<TelegramBot, "id">) => boolean;
  deleteBot: (id: string) => void;
  toggleBotStatus: (id: string) => void;

  // Automation Actions (Zod-validated)
  createAutomation: (rule: Omit<AutomationRule, "id" | "executionsCount">) => boolean;
  toggleAutomation: (id: string) => void;
  toggleAutomationStatus: (id: string) => void;
  deleteAutomation: (id: string) => void;

  // Connector Actions
  toggleConnectorSync: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Navigation Initial State
  currentSection: "overview",
  isSidebarCollapsed: false,
  setCurrentSection: (section) => {
    const parsed = DashboardSectionSchema.safeParse(section);
    if (parsed.success) {
      set({ currentSection: parsed.data });
    }
  },
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setIsSidebarCollapsed: (collapsed) =>
    set((state) => ({
      isSidebarCollapsed:
        typeof collapsed === "function" ? collapsed(state.isSidebarCollapsed) : collapsed,
    })),

  // Contextual Drawer Initial State
  contextualPanel: {
    isOpen: false,
    type: null,
    data: null,
  },
  openContextualPanel: (type, data = null) =>
    set({
      contextualPanel: {
        isOpen: true,
        type,
        data,
      },
    }),
  closeContextualPanel: () =>
    set({
      contextualPanel: {
        isOpen: false,
        type: null,
        data: null,
      },
    }),

  // Search & Workspace State
  searchQuery: "",
  isGlobalSearchOpen: false,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setIsGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  workspaces: WORKSPACES_INITIAL,
  activeWorkspace: WORKSPACES_INITIAL[0],
  setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),

  // Compose State
  composeDraft: null,
  setComposeDraft: (draft) => set({ composeDraft: draft }),
  navigateToCompose: (preset) => {
    if (preset) {
      set({
        composeDraft: {
          communityIds: preset.communityIds,
          targetPlatforms: preset.targetPlatforms,
          baseContent: preset.initialText,
          scheduledFor: preset.scheduledFor,
        },
        currentSection: "compose",
      });
    } else {
      set({ currentSection: "compose" });
    }
  },

  // Collections Initial State
  posts: INITIAL_POSTS,
  connectors: INITIAL_CONNECTORS,
  communities: INITIAL_COMMUNITIES,
  bots: INITIAL_BOTS,
  automations: INITIAL_AUTOMATIONS,

  // Post Actions
  createPost: (postInput) => {
    const validation = CreatePostInputSchema.safeParse(postInput);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid post data";
      globalNotifier.error?.("Failed to create post", errorMsg);
      return false;
    }

    const newPost: PostItem = {
      ...postInput,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
    }));

    if (newPost.status === "scheduled") {
      globalNotifier.success?.(
        "Post Scheduled",
        `Scheduled for ${newPost.scheduledFor ? new Date(newPost.scheduledFor).toLocaleString() : "selected date"}`,
      );
    } else {
      globalNotifier.success?.("Post Published", "Broadcast dispatched across target platforms.");
    }
    return true;
  },

  updatePost: (id, updates) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    globalNotifier.success?.("Post Updated", "Your changes have been saved.");
  },

  deletePost: (id) => {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    }));
    globalNotifier.info?.("Post Deleted", "The post has been removed from your queue.");
  },

  reschedulePost: (id, newDateIso) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, scheduledFor: newDateIso, status: "scheduled" as const } : p,
      ),
    }));
    globalNotifier.success?.(
      "Rescheduled",
      `Post updated to ${new Date(newDateIso).toLocaleString()}`,
    );
  },

  duplicatePost: (id) => {
    const existing = get().posts.find((p) => p.id === id);
    if (!existing) return;
    const copy: PostItem = {
      ...existing,
      id: `post-copy-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      status: "draft",
      scheduledFor: undefined,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      posts: [copy, ...state.posts],
    }));
    globalNotifier.success?.(
      "Post Duplicated",
      "A draft copy has been added to your content library.",
    );
  },

  // Community Actions
  createCommunity: (commInput) => {
    const validation = CreateCommunityInputSchema.safeParse(commInput);
    if (!validation.success) {
      globalNotifier.error?.(
        "Invalid Community",
        validation.error.issues[0]?.message || "Validation failed",
      );
      return false;
    }

    const newCommunity: Community = {
      ...commInput,
      id: `comm-${Date.now()}`,
      postCount: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      communities: [...state.communities, newCommunity],
    }));
    globalNotifier.success?.(
      "Community Created",
      `${newCommunity.name} is now available for broadcasting.`,
    );
    return true;
  },

  addCommunity: (commInput) => {
    return get().createCommunity(commInput);
  },

  deleteCommunity: (id) => {
    set((state) => ({
      communities: state.communities.filter((c) => c.id !== id),
    }));
    globalNotifier.info?.("Community Removed", "Community group was deleted.");
  },

  // Telegram Bot Actions
  createBot: (botInput) => {
    const validation = CreateTelegramBotInputSchema.safeParse(botInput);
    if (!validation.success) {
      globalNotifier.error?.(
        "Invalid Bot Credentials",
        validation.error.issues[0]?.message || "Check token format",
      );
      return false;
    }

    const newBot: TelegramBot = {
      name: botInput.name,
      username: botInput.username,
      tokenMasked: botInput.tokenMasked || "bot_tok_***",
      status: botInput.status || "active",
      communityIds: botInput.communityIds || [],
      commandsCount: botInput.commandsCount || 4,
      webhookStatus: botInput.webhookStatus || "healthy",
      id: `bot-${Date.now()}`,
      scheduledQueueCount: 0,
      lastActive: "Just now",
    };

    set((state) => ({
      bots: [...state.bots, newBot],
    }));
    globalNotifier.success?.(
      "Telegram Bot Connected",
      `${newBot.name} (${newBot.username}) is active.`,
    );
    return true;
  },

  addBot: (botInput) => {
    const newBot: TelegramBot = {
      id: `bot-${Date.now()}`,
      name: botInput.name,
      username: botInput.username,
      tokenMasked: botInput.tokenMasked || "bot_tok_***",
      status: botInput.status || "active",
      communityIds: botInput.communityIds || [],
      commandsCount: botInput.commandsCount || 4,
      webhookStatus: botInput.webhookStatus || "healthy",
      scheduledQueueCount: botInput.scheduledQueueCount || 0,
      lastActive: botInput.lastActive || "Just now",
    };
    set((state) => ({
      bots: [...state.bots, newBot],
    }));
    globalNotifier.success?.(
      "Telegram Bot Connected",
      `${newBot.name} (${newBot.username}) is active.`,
    );
    return true;
  },

  deleteBot: (id) => {
    set((state) => ({
      bots: state.bots.filter((b) => b.id !== id),
    }));
    globalNotifier.info?.("Bot Removed", "Telegram bot credentials were removed.");
  },

  toggleBotStatus: (id) => {
    set((state) => ({
      bots: state.bots.map((b) => {
        if (b.id === id) {
          const nextStatus = b.status === "active" ? ("paused" as const) : ("active" as const);
          globalNotifier.info?.("Bot Status Updated", `${b.name} is now ${nextStatus}.`);
          return { ...b, status: nextStatus };
        }
        return b;
      }),
    }));
  },

  // Automation Actions
  createAutomation: (ruleInput) => {
    const validation = CreateAutomationRuleInputSchema.safeParse(ruleInput);
    if (!validation.success) {
      globalNotifier.error?.(
        "Invalid Rule",
        validation.error.issues[0]?.message || "Validation failed",
      );
      return false;
    }

    const fullRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: ruleInput.name,
      description: ruleInput.description || "",
      sourceType: ruleInput.sourceType,
      sourcePlatform: ruleInput.sourcePlatform,
      sourceTarget: ruleInput.sourceTarget,
      actionType: ruleInput.actionType,
      targetPlatform: ruleInput.targetPlatform,
      targetDestination: ruleInput.targetDestination,
      status: ruleInput.status || "active",
      lastExecutedAt: ruleInput.lastExecutedAt,
      executionsCount: 0,
    };

    set((state) => ({
      automations: [...state.automations, fullRule],
    }));
    globalNotifier.success?.(
      "Automation Configured",
      `${fullRule.name} is now monitoring triggers.`,
    );
    return true;
  },

  toggleAutomationStatus: (id) => {
    set((state) => ({
      automations: state.automations.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === "active" ? ("paused" as const) : ("active" as const);
          globalNotifier.info?.("Automation Rule", `${a.name} is now ${nextStatus}.`);
          return { ...a, status: nextStatus };
        }
        return a;
      }),
    }));
  },

  toggleAutomation: (id) => {
    get().toggleAutomationStatus(id);
  },

  deleteAutomation: (id) => {
    set((state) => ({
      automations: state.automations.filter((a) => a.id !== id),
    }));
    globalNotifier.info?.("Rule Removed", "Automation rule has been deleted.");
  },

  // Connector Actions
  toggleConnectorSync: (id) => {
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id ? { ...c, lastSyncAt: "Just now", status: "connected" as const } : c,
      ),
    }));
    globalNotifier.success?.("Sync Complete", "Platform OAuth tokens refreshed and synced.");
  },
}));
