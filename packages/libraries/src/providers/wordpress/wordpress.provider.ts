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
import { WORDPRESS_LIMITS, validateWordPressPost } from "./wordpress.validator";
import type { WordPressPostResponse, WordPressUserResponse } from "./wordpress.types";

export class WordPressProvider extends BaseSocialProvider {
  private clientId?: string;
  private clientSecret?: string;
  private apiBaseUrl: string;

  constructor(
    clientId?: string,
    clientSecret?: string,
    apiBaseUrl = "https://public-api.wordpress.com/wp/v2",
  ) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBaseUrl = apiBaseUrl;
  }

  public readonly metadata: ProviderMetadata = {
    id: "wordpress" as SocialPlatform,
    name: "WordPress",
    websiteUrl: "https://wordpress.org",
    docsUrl: "https://developer.wordpress.org/rest-api/",
    iconName: "wordpress",
    defaultScopes: ["posts:write", "media:write"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: true,
      requiresImage: false,
      maxImages: 20,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 20,
      supportsScheduling: true,
      supportsDrafts: true,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: WORDPRESS_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      response_type: "code",
      state: options.state,
    });
    return `https://wordpress.com/oauth2/authorize?${params.toString()}`;
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
      const res = await this.http.request<WordPressUserResponse>(`${this.apiBaseUrl}/user/me`, {
        method: "GET",
        headers,
      });

      return {
        id: String(res.data.id || credentials.accountId || "wordpress_user"),
        handle: res.data.username || credentials.accountHandle || "wordpress_creator",
        name: res.data.name || credentials.accountName || "WordPress Account",
        avatarUrl: res.data.avatar_url || credentials.avatarUrl,
        profileUrl: res.data.profile_url,
        rawProfile: res.data as unknown as Record<string, unknown>,
      };
    } catch {
      return {
        id: credentials.accountId || "wordpress_user",
        handle: credentials.accountHandle || "wordpress_creator",
        name: credentials.accountName || "WordPress Account",
        avatarUrl: credentials.avatarUrl,
        profileUrl: `https://wordpress.org/${credentials.accountHandle || ""}`,
      };
    }
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateWordPressPost(payload);
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

    const res = await this.http.request<WordPressPostResponse>(`${this.apiBaseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: postPayload,
    });

    return {
      success: true,
      externalPostId: String(res.data.id || `wordpress_${Date.now()}`),
      externalPostUrl: res.data.url || `https://wordpress.org/post/${res.data.id || Date.now()}`,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
