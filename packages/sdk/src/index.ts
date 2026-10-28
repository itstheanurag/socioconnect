export interface SocioConnectClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface Account {
  id: string;
  platform: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
}

export interface Destination {
  id: string;
  externalId: string;
  platform: string;
  type: string;
  name: string;
  canPost: boolean;
}

export interface PostTargetInput {
  accountId: string;
  platform: string;
  destinationId?: string;
  scheduledFor?: string;
  customContent?: string;
  customTitle?: string;
  platformOptions?: Record<string, unknown>;
}

export interface CreateDraftInput {
  content: string;
  title?: string;
  linkUrl?: string;
  tags?: string[];
  mediaIds?: string[];
  targets: PostTargetInput[];
  idempotencyKey?: string;
}

export interface PublishIntentInput {
  postId: string;
  mode: "publish" | "schedule";
  scheduledAt?: string;
  expiresInSeconds?: number;
  idempotencyKey?: string;
}

export interface UsageSummary {
  tier: string;
  channels: { connected: number; max: number };
  monthlyDrops: { used: number; max: number };
  aiAdaptations: { used: number; max: number };
  cdnStorage: { usedBytes: number; maxBytes: number };
  cycleResetsAt: string;
}

export interface ActivityPayload {
  events: Array<{
    id: string;
    actorType: string;
    actorId: string | null;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>;
  usage: {
    publishesThisMonth: number;
    draftsThisMonth: number;
    aiCreditsThisMonth: number;
  };
  generatedAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  status: string;
  createdAt: string;
}

export class SocioConnectError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "SocioConnectError";
  }
}

interface Envelope<T> {
  message: string;
  payload: T;
}

function idempotencyKey(prefix: string): string {
  const suffix =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

export class SocioConnectClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SocioConnectClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.socioconnect.app").replace(/\/$/, "");
    this.fetchImpl = options.fetch ?? fetch;
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    options?: {
      body?: unknown;
      idempotencyKey?: string;
      query?: Record<string, string | number | undefined>;
    },
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(options?.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
    if (options?.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

    const response = await this.fetchImpl(url.toString(), {
      method,
      headers,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
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
      throw new SocioConnectError(
        errorBody?.message ?? `SocioConnect request failed with ${response.status}`,
        response.status,
        errorBody?.code,
      );
    }

    return (body as Envelope<T>)?.payload as T;
  }

  async getProfile() {
    return this.request<{ user: { email: string; firstName: string; lastName: string | null } }>(
      "GET",
      "/v1/auth/me",
    );
  }

  async getWorkspace() {
    return this.request<{ workspace: { id: string; name: string; role: string } }>(
      "GET",
      "/v1/workspaces/current",
    );
  }

  async listAccounts() {
    return this.request<{ accounts: Account[] }>("GET", "/v1/accounts");
  }

  async listDestinations(accountId: string) {
    return this.request<{ destinations: Destination[] }>(
      "GET",
      `/v1/accounts/${encodeURIComponent(accountId)}/destinations`,
    );
  }

  async listPlatforms() {
    return this.request<{ platforms: Array<Record<string, unknown>> }>("GET", "/v1/platforms");
  }

  async listPosts(filters?: { status?: string; page?: number; limit?: number }) {
    return this.request<{ posts: Array<Record<string, unknown>> }>("GET", "/v1/posts", {
      query: filters,
    });
  }

  async getPost(postId: string) {
    return this.request<{ post: Record<string, unknown> }>(
      "GET",
      `/v1/posts/${encodeURIComponent(postId)}`,
    );
  }

  async createDraft(input: CreateDraftInput) {
    return this.request<{ postId: string; status: string; dispatchesCount: number }>(
      "POST",
      "/v1/posts",
      {
        body: {
          content: input.content,
          title: input.title,
          linkUrl: input.linkUrl,
          tags: input.tags,
          mediaIds: input.mediaIds,
          targets: input.targets,
        },
        idempotencyKey: input.idempotencyKey ?? idempotencyKey("draft"),
      },
    );
  }

  async updateDraft(
    postId: string,
    input: Partial<Omit<CreateDraftInput, "idempotencyKey">> & { idempotencyKey?: string },
  ) {
    return this.request<{ postId: string; status: string; dispatchesCount: number }>(
      "PATCH",
      `/v1/posts/${encodeURIComponent(postId)}`,
      {
        body: {
          content: input.content,
          title: input.title,
          linkUrl: input.linkUrl,
          tags: input.tags,
          mediaIds: input.mediaIds,
          targets: input.targets,
        },
        idempotencyKey: input.idempotencyKey ?? idempotencyKey("update"),
      },
    );
  }

  async reschedulePost(postId: string, scheduledAt: string, idempotencyKeyValue?: string) {
    return this.request<{ postId: string; status: string; scheduledAt: string | null }>(
      "PATCH",
      `/v1/posts/${encodeURIComponent(postId)}`,
      {
        body: { scheduledAt },
        idempotencyKey: idempotencyKeyValue ?? idempotencyKey("reschedule"),
      },
    );
  }

  async createMediaUploadUrl(input: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    type: "image" | "video" | "gif" | "audio";
  }) {
    return this.request<{
      uploadUrl: string;
      storageKey: string;
      publicUrl: string;
      expiresInSeconds: number;
    }>("POST", "/v1/media/presigned-url", { body: input });
  }

  async confirmMediaUpload(input: {
    storageKey: string;
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    type: "image" | "video" | "gif" | "audio";
    sizeBytes: number;
    width?: number;
    height?: number;
    durationSeconds?: number;
    altText?: string;
    idempotencyKey?: string;
  }) {
    const { idempotencyKey: key, ...body } = input;
    return this.request<{ mediaId: string; url: string; type: string; sizeBytes: number | null }>(
      "POST",
      "/v1/media/confirm",
      {
        body,
        idempotencyKey: key ?? idempotencyKey("media"),
      },
    );
  }

  async cancelPost(postId: string, idempotencyKeyValue?: string) {
    return this.request<{ postId: string; status: string; cancelledAt: string }>(
      "POST",
      `/v1/posts/${encodeURIComponent(postId)}/cancel`,
      { idempotencyKey: idempotencyKeyValue ?? `cancel-${postId}` },
    );
  }

  async createPublishIntent(input: PublishIntentInput) {
    return this.request<{
      intent: Record<string, unknown>;
      preview: Record<string, unknown>;
    }>("POST", "/v1/publish-intents", {
      body: {
        postId: input.postId,
        mode: input.mode,
        scheduledAt: input.scheduledAt,
        expiresInSeconds: input.expiresInSeconds,
      },
      idempotencyKey: input.idempotencyKey ?? idempotencyKey("intent"),
    });
  }

  async getPublishIntent(intentId: string) {
    return this.request<{ intent: Record<string, unknown>; preview?: Record<string, unknown> }>(
      "GET",
      `/v1/publish-intents/${encodeURIComponent(intentId)}`,
    );
  }

  async confirmPublishIntent(intentId: string, idempotencyKeyValue?: string) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/v1/publish-intents/${encodeURIComponent(intentId)}/confirm`,
      { idempotencyKey: idempotencyKeyValue ?? `confirm-${intentId}` },
    );
  }

  async retryDispatch(dispatchId: string, idempotencyKeyValue?: string) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/v1/dispatches/${encodeURIComponent(dispatchId)}/retry`,
      { idempotencyKey: idempotencyKeyValue ?? idempotencyKey("retry") },
    );
  }

  async getUsage() {
    return this.request<UsageSummary>("GET", "/v1/quotas/summary");
  }

  async getActivity(limit = 20) {
    return this.request<ActivityPayload>("GET", "/v1/activity", { query: { limit } });
  }

  async listWebhooks() {
    return this.request<{ webhooks: WebhookEndpoint[] }>("GET", "/v1/webhooks");
  }

  async createWebhook(input: { url: string; events: string[]; description?: string }) {
    return this.request<{ webhook: WebhookEndpoint; secret: string }>("POST", "/v1/webhooks", {
      body: input,
    });
  }

  async deleteWebhook(id: string) {
    return this.request<{ message: string }>("DELETE", `/v1/webhooks/${encodeURIComponent(id)}`);
  }

  async testWebhook(id: string) {
    return this.request<{ status: string; responseStatus: number | null; error: string | null }>(
      "POST",
      `/v1/webhooks/${encodeURIComponent(id)}/test`,
      { idempotencyKey: idempotencyKey("webhook-test") },
    );
  }
}

export function createClient(options: SocioConnectClientOptions): SocioConnectClient {
  return new SocioConnectClient(options);
}
