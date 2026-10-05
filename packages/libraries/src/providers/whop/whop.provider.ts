import { BaseSocialProvider } from "@/base/base.provider";
import type { ProviderMetadata, SocialPlatform } from "@/types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "@/types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "@/types/post.types";
import { WHOP_LIMITS, validateWhopPost } from "./whop.validator";
import type { WhopPostResponse, WhopUserResponse } from "./whop.types";

export class WhopProvider extends BaseSocialProvider {
  private clientId?: string;
  private clientSecret?: string;
  private apiBaseUrl: string;

  constructor(
    clientId?: string,
    clientSecret?: string,
    apiBaseUrl = "https://api.whop.com/api/v2",
  ) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBaseUrl = apiBaseUrl;
  }

  public readonly metadata: ProviderMetadata = {
    id: "whop" as SocialPlatform,
    name: "Whop",
    websiteUrl: "https://whop.com",
    docsUrl: "https://docs.whop.com",
    iconName: "whop",
    defaultScopes: ["company:read", "notifications:send"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 5,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: true,
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: WHOP_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      response_type: "code",
      state: options.state,
    });
    return `https://whop.com/oauth?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const apiKey = options.code;
    const profile = await this.verifyCredentials({ accessToken: apiKey });

    return {
      accessToken: apiKey,
      refreshToken: options.codeVerifier,
      accountId: String(profile.id),
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    if (currentCredentials) {
      await this.verifyCredentials(currentCredentials);
      return {
        accessToken: currentCredentials.accessToken,
        refreshToken,
      };
    }
    return {
      accessToken: refreshToken,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${credentials.accessToken}`,
    };

    try {
      const res = await this.http.request<WhopUserResponse>(`${this.apiBaseUrl}/user/me`, {
        method: "GET",
        headers,
      });

      return {
        id: String(res.data.id || credentials.accountId || "whop_user"),
        handle: res.data.username || credentials.accountHandle || "whop_creator",
        name: res.data.name || credentials.accountName || "Whop Account",
        avatarUrl: res.data.avatar_url || credentials.avatarUrl,
        profileUrl: res.data.profile_url,
        rawProfile: res.data as unknown as Record<string, unknown>,
      };
    } catch {
      return {
        id: credentials.accountId || "whop_user",
        handle: credentials.accountHandle || "whop_creator",
        name: credentials.accountName || "Whop Account",
        avatarUrl: credentials.avatarUrl,
        profileUrl: `https://whop.com/${credentials.accountHandle || ""}`,
      };
    }
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateWhopPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const postPayload = {
      title: payload.title,
      text: payload.content,
      media: payload.media?.map((m) => m.url),
      tags: payload.tags,
      link: payload.linkUrl,
      options: payload.platformOptions,
    };

    const res = await this.http.request<WhopPostResponse>(`${this.apiBaseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: postPayload,
    });

    return {
      success: true,
      externalPostId: String(res.data.id || `whop_${Date.now()}`),
      externalPostUrl: res.data.url || `https://whop.com/post/${res.data.id || Date.now()}`,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
