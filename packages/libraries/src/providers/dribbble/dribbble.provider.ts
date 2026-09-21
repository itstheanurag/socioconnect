import { BaseSocialProvider } from "../../base/base.provider";
import type { ProviderMetadata } from "../../types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "../../types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "../../types/post.types";
import { DRIBBBLE_LIMITS, validateDribbblePost } from "./dribbble.validator";
import type { DribbbleShotResponse, DribbbleUserResponse } from "./dribbble.types";

export class DribbbleProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://api.dribbble.com/v2";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "dribbble",
    name: "Dribbble",
    websiteUrl: "https://dribbble.com",
    docsUrl: "https://developer.dribbble.com/v2",
    iconName: "dribbble",
    defaultScopes: ["public", "upload"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: true,
      requiresImage: true,
      maxImages: 1,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: false,
      supportsTags: true,
      maxTags: 12,
      supportsScheduling: false,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: DRIBBBLE_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      state: options.state,
      response_type: "code",
    });
    return `https://dribbble.com/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      scope: string;
      created_at: number;
    }>("https://dribbble.com/oauth/token", {
      method: "POST",
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: options.code,
        redirect_uri: options.redirectUri,
      },
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      scopes: res.data.scope.split(" "),
      accountId: String(profile.id),
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    _refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    if (currentCredentials) {
      await this.verifyCredentials(currentCredentials);
      return {
        accessToken: currentCredentials.accessToken,
        refreshToken: currentCredentials.refreshToken,
      };
    }
    return {
      accessToken: "",
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<DribbbleUserResponse>(`${this.apiBaseUrl}/user`, {
      method: "GET",
      bearerToken: credentials.accessToken,
    });

    return {
      id: String(res.data.id),
      handle: res.data.login,
      name: res.data.name,
      avatarUrl: res.data.avatar_url,
      profileUrl: res.data.html_url,
      followerCount: res.data.followers_count,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateDribbblePost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const primaryMedia = payload.media?.[0];

    const body: Record<string, unknown> = {
      title: payload.title,
      description: payload.content,
      image: primaryMedia?.url,
      tags: payload.tags || [],
    };

    if (payload.platformOptions?.teamId) {
      body.team_id = payload.platformOptions.teamId;
    }

    const res = await this.http.request<DribbbleShotResponse>(`${this.apiBaseUrl}/shots`, {
      method: "POST",
      bearerToken: credentials.accessToken,
      body,
    });

    return {
      success: true,
      externalPostId: String(res.data.id),
      externalPostUrl: res.data.html_url,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
