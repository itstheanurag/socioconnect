const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: string;
  avatar?: string | null;
}

export interface ApiResponse<T> {
  message: string;
  payload?: T;
  error?: string;
}

export async function getGoogleOAuthUrl(): Promise<string> {
  // redirect=true ensures the backend callback establishes HttpOnly session cookies and redirects to /dashboard
  const url = `${API_BASE_URL}/v1/oauth/google?redirect=true`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to initialize Google OAuth");
  }

  const data = (await response.json()) as ApiResponse<{ link: string }>;
  if (!data.payload?.link) {
    throw new Error("Invalid OAuth link received from server");
  }

  return data.payload.link;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Handle both payload.user and direct user response shapes
    if (data.payload?.user) {
      return data.payload.user;
    }
    if (data.user) {
      return data.user;
    }
    if (data.email) {
      return data as UserProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// API keys, workspaces, and agent activity
// ---------------------------------------------------------------------------

export interface ApiKeySummary {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  accountIds: string[];
  environment: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatedApiKey {
  key: ApiKeySummary;
  token: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  role: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  actorType: "user" | "api_key" | "oauth_client" | "system";
  actorId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityPayload {
  events: ActivityEvent[];
  usage: {
    publishesThisMonth: number;
    draftsThisMonth: number;
    aiCreditsThisMonth: number;
  };
  generatedAt: string;
}

export interface QuotaSummary {
  tier: string;
  channels: { connected: number; max: number };
  monthlyDrops: { used: number; max: number };
  aiAdaptations: { used: number; max: number };
  cdnStorage: { usedBytes: number; maxBytes: number };
  cycleResetsAt: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorBody = body as { message?: string; code?: string } | null;
    throw new Error(errorBody?.message || `Request failed with ${response.status}`);
  }

  return body as T;
}

export async function getApiKeys(): Promise<ApiKeySummary[]> {
  const data = await apiFetch<{ payload: { keys: ApiKeySummary[] } }>("/v1/api-keys");
  return data.payload.keys;
}

export async function createApiKey(input: {
  name: string;
  scopes: string[];
  accountIds?: string[];
  expiresAt?: string;
}): Promise<CreatedApiKey> {
  const data = await apiFetch<{ payload: CreatedApiKey }>("/v1/api-keys", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.payload;
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiFetch(`/v1/api-keys/${id}`, { method: "DELETE" });
}

export async function rotateApiKey(id: string): Promise<CreatedApiKey> {
  const data = await apiFetch<{ payload: CreatedApiKey }>(`/v1/api-keys/${id}/rotate`, {
    method: "POST",
  });
  return data.payload;
}

export async function getCurrentWorkspace(): Promise<WorkspaceSummary | null> {
  try {
    const data = await apiFetch<{ payload: { workspace: WorkspaceSummary } }>(
      "/v1/workspaces/current",
    );
    return data.payload.workspace;
  } catch {
    return null;
  }
}

export async function getActivity(limit = 20): Promise<ActivityPayload> {
  const data = await apiFetch<{ payload: ActivityPayload }>(`/v1/activity?limit=${limit}`);
  return data.payload;
}

export async function getQuotaSummary(): Promise<QuotaSummary> {
  const data = await apiFetch<{ payload: QuotaSummary }>("/v1/quotas/summary");
  return data.payload;
}

export interface AccountSummary {
  id: string;
  platform: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
}

export async function getAccounts(): Promise<AccountSummary[]> {
  const data = await apiFetch<{ payload: { accounts: AccountSummary[] } }>("/v1/accounts");
  return data.payload.accounts;
}
