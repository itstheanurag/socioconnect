import { BaseSocialProvider } from "@/base/base.provider";
import type { ProviderMetadata } from "@/types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "@/types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "@/types/post.types";
import { THREADS_LIMITS, validateThreadsPost } from "./threads.validator";
import type {
  ThreadsContainerResponse,
  ThreadsPublishResponse,
  ThreadsTokenResponse,
  ThreadsUserResponse,
} from "./threads.types";

export class ThreadsProvider extends BaseSocialProvider {
  private appId: string;
  private appSecret: string;
  private apiBaseUrl = "https://graph.threads.net/v1.0";

  constructor(appId = "", appSecret = "") {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "threads",
    name: "Threads",
    websiteUrl: "https://threads.net",
    docsUrl: "https://developers.facebook.com/docs/threads",
    iconName: "threads",
    defaultScopes: ["threads_basic", "threads_content_publish", "threads_read_replies"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 10,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 1,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: true,
    },
    limits: THREADS_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.appId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      response_type: "code",
      state: options.state,
    });
    return `https://threads.net/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const shortLivedRes = await this.http.request<ThreadsTokenResponse>(
      "https://graph.threads.net/oauth/access_token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: this.appId,
          client_secret: this.appSecret,
          grant_type: "authorization_code",
          redirect_uri: options.redirectUri,
          code: options.code,
        }),
      },
    );

    // Exchange for long-lived access token
    const longLivedRes = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>("https://graph.threads.net/access_token", {
      method: "GET",
      params: {
        grant_type: "th_exchange_token",
        client_secret: this.appSecret,
        access_token: shortLivedRes.data.access_token,
      },
    });

    const accessToken = longLivedRes.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: accessToken,
      expiresAt: new Date(Date.now() + (longLivedRes.data.expires_in || 5184000) * 1000),
      scopes: this.metadata.defaultScopes,
      accountId: profile.id,
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    refreshToken: string,
    _currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>("https://graph.threads.net/refresh_access_token", {
      method: "GET",
      params: {
        grant_type: "th_refresh_token",
        access_token: refreshToken,
      },
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.access_token,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + (res.data.expires_in || 5184000) * 1000),
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<ThreadsUserResponse>(`${this.apiBaseUrl}/me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        fields: "id,username,name,threads_profile_picture_url,threads_biography",
      },
    });

    return {
      id: res.data.id,
      handle: `@${res.data.username}`,
      name: res.data.name || res.data.username,
      avatarUrl: res.data.threads_profile_picture_url,
      profileUrl: `https://threads.net/@${res.data.username}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateThreadsPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const userId = credentials.accountId || "me";
    const primaryMedia = payload.media?.[0];

    // Step 1: Create media/text container
    const containerParams: Record<string, string> = {};

    if (payload.content) {
      containerParams.text = payload.content;
    }

    if (payload.platformOptions?.topicTag) {
      containerParams.topic_tag = payload.platformOptions.topicTag;
    }

    if (payload.platformOptions?.replyToPostId) {
      containerParams.reply_to_id = payload.platformOptions.replyToPostId;
    }

    if (primaryMedia && primaryMedia.type === "image") {
      containerParams.media_type = "IMAGE";
      containerParams.image_url = primaryMedia.url;
    } else if (primaryMedia && primaryMedia.type === "video") {
      containerParams.media_type = "VIDEO";
      containerParams.video_url = primaryMedia.url;
    } else {
      containerParams.media_type = "TEXT";
    }

    const containerRes = await this.http.request<ThreadsContainerResponse>(
      `${this.apiBaseUrl}/${userId}/threads`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        params: containerParams,
      },
    );

    const creationId = containerRes.data.id;

    // Wait 1.5s for container readiness (required by Threads Graph API for video processing)
    if (containerParams.media_type === "VIDEO") {
      await new Promise((r) => setTimeout(r, 2500));
    }

    // Step 2: Publish container
    const publishRes = await this.http.request<ThreadsPublishResponse>(
      `${this.apiBaseUrl}/${userId}/threads_publish`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        params: {
          creation_id: creationId,
        },
      },
    );

    const threadId = publishRes.data.id;
    return {
      success: true,
      externalPostId: threadId,
      externalPostUrl: `https://threads.net/t/${threadId}`,
      publishedAt: new Date(),
      rawResponse: publishRes.data,
    };
  }
}
