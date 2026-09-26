/**
 * SocioConnect Frontend Typed API Client
 * Seamlessly interfaces with apps/api backend endpoints with automatic Bearer token injection
 * and token refresh capabilities.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export interface ApiResponse<T = unknown> {
  message: string;
  payload: T;
}

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
}

export interface PostDispatchSummary {
  id: string;
  platform: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  permalink?: string;
  errorMessage?: string;
}

export interface PostSummary {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  status: string;
  scheduledAt: string | null;
  dispatches: PostDispatchSummary[];
  createdAt: string;
}

export interface ConnectedAccountSummary {
  id: string;
  platform: string;
  accountName: string;
  accountHandle: string | null;
  avatarUrl: string | null;
  connectedAt: string;
  isActive: boolean;
}

export interface CommunityGroupSummary {
  id: string;
  name: string;
  platform: string;
  destinationIds: string[];
  staggerMinutes: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CommunityAutomationSummary {
  id: string;
  groupId: string;
  groupName: string;
  platform: string;
  title: string;
  scheduleType: string;
  cronSchedule: string;
  contentTemplate: string;
  topicPool: string[];
  autoAdaptTone: boolean;
  status: string;
  totalRuns: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = getCookie("access_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure = true,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...(options.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401 && retryOnAuthFailure) {
      // Try refreshing access token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || `API request failed with status ${res.status}`);
    }

    return data as ApiResponse<T>;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.payload?.accessToken) {
          setCookie("access_token", data.payload.accessToken);
          return true;
        }
      }
    } catch {
      // Refresh token failed
    }
    return false;
  }

  // 1. Auth Methods
  public auth = {
    getMe: async (): Promise<ApiUser> => {
      const res = await this.request<{ user: ApiUser }>("/v1/auth/me");
      return res.payload.user;
    },

    getOAuthUrl: async (provider: string, redirect = "false"): Promise<string> => {
      const res = await this.request<{ link: string }>(
        `/v1/oauth/${provider}?redirect=${redirect}`,
      );
      return res.payload.link;
    },

    logout: async (): Promise<void> => {
      try {
        await this.request("/v1/auth/logout", { method: "GET" });
      } finally {
        removeCookie("access_token");
        removeCookie("socioconnect_user");
        removeCookie("socioconnect_ticket");
      }
    },
  };

  // 2. Posts & Schedules
  public posts = {
    list: async (params?: { page?: number; limit?: number; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.status) query.set("status", params.status);

      return this.request<{ posts: PostSummary[]; total: number }>(`/v1/posts?${query.toString()}`);
    },

    create: async (body: {
      title?: string;
      content: string;
      tags?: string[];
      timingStrategy?: string;
      scheduledAt?: string;
      dispatches: Array<{
        accountId: string;
        destinationId?: string;
        platform: string;
        customTitle?: string;
        customContent?: string;
        scheduledFor?: string;
      }>;
    }) => {
      return this.request<{ post: { id: string } }>("/v1/posts", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    getById: async (id: string) => {
      return this.request<{ post: PostSummary }>(`/v1/posts/${id}`);
    },

    delete: async (id: string) => {
      return this.request<{ message: string }>(`/v1/posts/${id}`, {
        method: "DELETE",
      });
    },
  };

  // 3. Connected Accounts & Destinations
  public accounts = {
    list: async () => {
      return this.request<{ accounts: ConnectedAccountSummary[] }>("/v1/accounts");
    },

    disconnect: async (id: string) => {
      return this.request<{ message: string }>(`/v1/accounts/${id}`, {
        method: "DELETE",
      });
    },
  };

  // 4. Communities & Hubs
  public communities = {
    listGroups: async () => {
      return this.request<{ groups: CommunityGroupSummary[] }>("/v1/communities/groups");
    },

    createGroup: async (body: {
      accountId: string;
      name: string;
      platform: string;
      destinationIds: string[];
      staggerMinutes?: number;
      tags?: string[];
    }) => {
      return this.request<{ group: { id: string; name: string } }>("/v1/communities/groups", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    deleteGroup: async (id: string) => {
      return this.request<{ message: string }>(`/v1/communities/groups/${id}`, {
        method: "DELETE",
      });
    },

    listAutomations: async () => {
      return this.request<{ automations: CommunityAutomationSummary[] }>(
        "/v1/communities/automations",
      );
    },

    createAutomation: async (
      groupId: string,
      body: {
        title: string;
        scheduleType?: string;
        cronSchedule?: string;
        contentTemplate: string;
        titleTemplate?: string;
        topicPool?: string[];
        autoAdaptTone?: boolean;
      },
    ) => {
      return this.request<{ automation: { id: string; title: string } }>(
        `/v1/communities/groups/${groupId}/automations`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
    },

    triggerAutomationNow: async (id: string) => {
      return this.request<{
        postId: string;
        dispatchesScheduled: number;
        nextTopicIndex: number;
      }>(`/v1/communities/automations/${id}/trigger`, {
        method: "POST",
      });
    },
  };

  // 5. Subscription & Quotas
  public subscriptions = {
    getCurrent: async () => {
      return this.request<{
        subscription: {
          id: string;
          tier: string;
          status: string;
          postsRemaining: number;
          maxAccounts: number;
        };
      }>("/v1/subscriptions/current");
    },
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
