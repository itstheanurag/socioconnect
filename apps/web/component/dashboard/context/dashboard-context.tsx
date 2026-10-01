"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
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
  INITIAL_POSTS,
  INITIAL_CONNECTORS,
  INITIAL_COMMUNITIES,
  INITIAL_BOTS,
  INITIAL_AUTOMATIONS,
} from "../data/mock-data";
import { useNotification } from "@/context/notification-context";

interface WorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  avatar?: string;
}

interface DashboardContextType {
  currentSection: DashboardSection;
  setCurrentSection: (section: DashboardSection) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  contextualPanel: ContextualPanelState;
  openContextualPanel: (type: ContextualPanelState["type"], data?: any) => void;
  closeContextualPanel: () => void;

  // Data entities
  posts: PostItem[];
  connectors: ConnectorAccount[];
  communities: Community[];
  bots: TelegramBot[];
  automations: AutomationRule[];

  // Post mutations
  createPost: (post: Omit<PostItem, "id" | "createdAt">) => void;
  updatePost: (id: string, updates: Partial<PostItem>) => void;
  deletePost: (id: string) => void;
  reschedulePost: (id: string, newDateIso: string) => void;
  duplicatePost: (id: string) => void;

  // Community mutations
  createCommunity: (comm: Omit<Community, "id" | "createdAt" | "postCount">) => void;

  // Bot mutations
  createBot: (bot: Omit<TelegramBot, "id" | "scheduledQueueCount" | "lastActive">) => void;
  toggleBotStatus: (id: string) => void;

  // Automation mutations
  toggleAutomationStatus: (id: string) => void;
  createAutomation: (rule: Omit<AutomationRule, "id" | "executionsCount">) => void;

  // Connector actions
  toggleConnectorSync: (id: string) => void;

  // UI & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Workspace
  workspaces: WorkspaceInfo[];
  activeWorkspace: WorkspaceInfo;
  setActiveWorkspace: (ws: WorkspaceInfo) => void;

  // Quick compose jump
  navigateToCompose: (initialContent?: Partial<PostItem>) => void;
  composeDraft: Partial<PostItem> | null;
  setComposeDraft: (draft: Partial<PostItem> | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_WORKSPACES: WorkspaceInfo[] = [
  { id: "ws-1", name: "SocioConnect HQ", plan: "Enterprise Pro" },
  { id: "ws-2", name: "DevRel & Community", plan: "Pro Tier" },
  { id: "ws-3", name: "Personal Brand Studio", plan: "Starter" },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useState<DashboardSection>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contextualPanel, setContextualPanel] = useState<ContextualPanelState>({
    isOpen: false,
    type: null,
    data: null,
  });

  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [connectors, setConnectors] = useState<ConnectorAccount[]>(INITIAL_CONNECTORS);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [bots, setBots] = useState<TelegramBot[]>(INITIAL_BOTS);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);

  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [workspaces] = useState<WorkspaceInfo[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceInfo>(DEFAULT_WORKSPACES[0]);
  const [composeDraft, setComposeDraft] = useState<Partial<PostItem> | null>(null);

  const { toast } = useNotification();

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const openContextualPanel = useCallback((type: ContextualPanelState["type"], data?: any) => {
    setContextualPanel({
      isOpen: true,
      type,
      data,
    });
  }, []);

  const closeContextualPanel = useCallback(() => {
    setContextualPanel((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const navigateToCompose = useCallback((initialContent?: Partial<PostItem>) => {
    if (initialContent) {
      setComposeDraft(initialContent);
    }
    setCurrentSection("compose");
  }, []);

  const createPost = useCallback(
    (postData: Omit<PostItem, "id" | "createdAt">) => {
      const newPost: PostItem = {
        ...postData,
        id: `post-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      toast.success(
        postData.status === "published" ? "Post Published!" : "Post Scheduled!",
        `Dispatched to ${postData.targetPlatforms.length} platform destinations.`,
      );
    },
    [toast],
  );

  const updatePost = useCallback(
    (id: string, updates: Partial<PostItem>) => {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.info("Post Updated", "Changes have been saved successfully.");
    },
    [toast],
  );

  const deletePost = useCallback(
    (id: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (contextualPanel.isOpen && contextualPanel.data?.id === id) {
        closeContextualPanel();
      }
      toast.warning("Post Deleted", "The item was removed from your queue.");
    },
    [contextualPanel, closeContextualPanel, toast],
  );

  const reschedulePost = useCallback(
    (id: string, newDateIso: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, scheduledFor: newDateIso, status: "scheduled" } : p,
        ),
      );
      toast.success(
        "Schedule Updated",
        `Post rescheduled for ${new Date(newDateIso).toLocaleDateString()}`,
      );
    },
    [toast],
  );

  const duplicatePost = useCallback(
    (id: string) => {
      const original = posts.find((p) => p.id === id);
      if (!original) return;
      const copy: PostItem = {
        ...original,
        id: `post-${Date.now()}`,
        title: `${original.title} (Copy)`,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [copy, ...prev]);
      toast.success("Post Duplicated", "Saved as a new draft in your library.");
    },
    [posts, toast],
  );

  const createCommunity = useCallback(
    (commData: Omit<Community, "id" | "createdAt" | "postCount">) => {
      const newComm: Community = {
        ...commData,
        id: `comm-${Date.now()}`,
        postCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCommunities((prev) => [newComm, ...prev]);
      toast.success("Community Created", `"${newComm.name}" is now ready for broadcasts.`);
    },
    [toast],
  );

  const createBot = useCallback(
    (botData: Omit<TelegramBot, "id" | "scheduledQueueCount" | "lastActive">) => {
      const newBot: TelegramBot = {
        ...botData,
        id: `bot-${Date.now()}`,
        scheduledQueueCount: 0,
        lastActive: "Just now",
      };
      setBots((prev) => [newBot, ...prev]);
      toast.success("Telegram Bot Connected", `Webhook listening on ${newBot.username}`);
    },
    [toast],
  );

  const toggleBotStatus = useCallback(
    (id: string) => {
      setBots((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: b.status === "active" ? "paused" : "active" } : b,
        ),
      );
      toast.info("Bot Status Toggled", "Automation dispatch state updated.");
    },
    [toast],
  );

  const toggleAutomationStatus = useCallback(
    (id: string) => {
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a,
        ),
      );
      toast.info("Automation Updated", "Rule execution status changed.");
    },
    [toast],
  );

  const createAutomation = useCallback(
    (ruleData: Omit<AutomationRule, "id" | "executionsCount">) => {
      const newRule: AutomationRule = {
        ...ruleData,
        id: `auto-${Date.now()}`,
        executionsCount: 0,
      };
      setAutomations((prev) => [newRule, ...prev]);
      toast.success("Automation Created", `Rule "${newRule.name}" is active.`);
    },
    [toast],
  );

  const toggleConnectorSync = useCallback(
    (id: string) => {
      setConnectors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, lastSyncAt: "Just now", status: "connected" } : c)),
      );
      toast.success("Connector Synced", "Tokens and channel permissions refreshed.");
    },
    [toast],
  );

  const value = useMemo(
    () => ({
      currentSection,
      setCurrentSection,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebar,
      contextualPanel,
      openContextualPanel,
      closeContextualPanel,
      posts,
      connectors,
      communities,
      bots,
      automations,
      createPost,
      updatePost,
      deletePost,
      reschedulePost,
      duplicatePost,
      createCommunity,
      createBot,
      toggleBotStatus,
      toggleAutomationStatus,
      createAutomation,
      toggleConnectorSync,
      searchQuery,
      setSearchQuery,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      navigateToCompose,
      composeDraft,
      setComposeDraft,
    }),
    [
      currentSection,
      isSidebarCollapsed,
      toggleSidebar,
      contextualPanel,
      openContextualPanel,
      closeContextualPanel,
      posts,
      connectors,
      communities,
      bots,
      automations,
      createPost,
      updatePost,
      deletePost,
      reschedulePost,
      duplicatePost,
      createCommunity,
      createBot,
      toggleBotStatus,
      toggleAutomationStatus,
      createAutomation,
      toggleConnectorSync,
      searchQuery,
      isGlobalSearchOpen,
      workspaces,
      activeWorkspace,
      navigateToCompose,
      composeDraft,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
