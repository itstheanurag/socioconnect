import { create } from "zustand";
import { apiClient } from "../api-client";
import type {
  CommunityGroupSummary,
  CommunityAutomationSummary,
  CreateCommunityGroupRequest,
  CreateCommunityAutomationRequest,
} from "@repo/contracts";

export interface CommunitiesState {
  groups: CommunityGroupSummary[];
  automations: CommunityAutomationSummary[];
  selectedGroupId: string | null;
  isLoading: boolean;
  isTriggering: Record<string, boolean>;

  // Actions
  fetchGroups: () => Promise<void>;
  fetchAutomations: () => Promise<void>;
  setSelectedGroupId: (id: string | null) => void;
  createGroup: (req: CreateCommunityGroupRequest) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  createAutomation: (groupId: string, req: CreateCommunityAutomationRequest) => Promise<boolean>;
  triggerAutomationNow: (automationId: string) => Promise<{ success: boolean; postId?: string }>;
}

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
  groups: [],
  automations: [],
  selectedGroupId: null,
  isLoading: false,
  isTriggering: {},

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.communities.listGroups();
      set({ groups: res.payload.groups, isLoading: false });
      if (!get().selectedGroupId && res.payload.groups.length > 0) {
        set({ selectedGroupId: res.payload.groups[0].id });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchAutomations: async () => {
    try {
      const res = await apiClient.communities.listAutomations();
      set({ automations: res.payload.automations });
    } catch {
      // Ignored
    }
  },

  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),

  createGroup: async (req) => {
    try {
      await apiClient.communities.createGroup(req);
      await get().fetchGroups();
      return true;
    } catch {
      return false;
    }
  },

  deleteGroup: async (id) => {
    try {
      await apiClient.communities.deleteGroup(id);
      await get().fetchGroups();
      return true;
    } catch {
      return false;
    }
  },

  createAutomation: async (groupId, req) => {
    try {
      await apiClient.communities.createAutomation(groupId, req);
      await get().fetchAutomations();
      return true;
    } catch {
      return false;
    }
  },

  triggerAutomationNow: async (automationId) => {
    set({ isTriggering: { ...get().isTriggering, [automationId]: true } });
    try {
      const res = await apiClient.communities.triggerAutomationNow(automationId);
      await get().fetchAutomations();
      set({ isTriggering: { ...get().isTriggering, [automationId]: false } });
      return { success: true, postId: res.payload.postId };
    } catch {
      set({ isTriggering: { ...get().isTriggering, [automationId]: false } });
      return { success: false };
    }
  },
}));
