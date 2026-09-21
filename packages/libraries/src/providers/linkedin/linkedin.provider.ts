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
import { LINKEDIN_LIMITS, validateLinkedInPost } from "./linkedin.validator";
import type { LinkedInUGCPostResponse, LinkedInUserInfoResponse } from "./linkedin.types";

export class LinkedInProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://api.linkedin.com";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "linkedin",
    name: "LinkedIn",
    websiteUrl: "https://linkedin.com",
    docsUrl:
      "https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin",
    iconName: "linkedin",
    defaultScopes: ["openid", "profile", "email", "w_member_social"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 9,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 20,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: false,
    },
    limits: LINKEDIN_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      state: options.state,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const res = await this.http.request<{
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      refresh_token_expires_in?: number;
      scope: string;
    }>("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: options.code,
        redirect_uri: options.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope.split(","),
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
      expires_in: number;
      refresh_token?: string;
      scope: string;
    }>("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(",") : undefined,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<LinkedInUserInfoResponse>(
      `${this.apiBaseUrl}/v2/userinfo`,
      {
        method: "GET",
        bearerToken: credentials.accessToken,
      },
    );

    return {
      id: res.data.sub,
      handle: res.data.email || res.data.sub,
      name: res.data.name,
      email: res.data.email,
      avatarUrl: res.data.picture,
      profileUrl: `https://linkedin.com/in/me`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateLinkedInPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const authorUrn = `urn:li:person:${credentials.accountId || (await this.verifyCredentials(credentials)).id}`;
    const visibility = payload.platformOptions?.visibility || "PUBLIC";

    let shareMediaCategory = "NONE";
    const mediaList: Array<Record<string, unknown>> = [];

    if (payload.linkUrl) {
      shareMediaCategory = "ARTICLE";
      mediaList.push({
        status: "READY",
        description: { text: payload.content.slice(0, 200) },
        originalUrl: payload.linkUrl,
        title: { text: payload.title || payload.linkUrl },
      });
    }

    const ugcPayload = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: payload.content,
          },
          shareMediaCategory,
          media: mediaList.length > 0 ? mediaList : undefined,
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility,
      },
    };

    const res = await this.http.request<LinkedInUGCPostResponse>(`${this.apiBaseUrl}/v2/ugcPosts`, {
      method: "POST",
      bearerToken: credentials.accessToken,
      headers: {
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: ugcPayload,
    });

    const postUrn = res.data.id;
    const postUrl = `https://www.linkedin.com/feed/update/${postUrn}`;

    return {
      success: true,
      externalPostId: postUrn,
      externalPostUrl: postUrl,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }
}
