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
import { FACEBOOK_LIMITS, validateFacebookPost } from "./facebook.validator";
import type {
  FacebookPage,
  FacebookPagePostResponse,
  FacebookUserResponse,
} from "./facebook.types";

export class FacebookProvider extends BaseSocialProvider {
  private appId: string;
  private appSecret: string;
  private apiBaseUrl = "https://graph.facebook.com/v19.0";

  constructor(appId = "", appSecret = "") {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "facebook",
    name: "Facebook",
    websiteUrl: "https://facebook.com",
    docsUrl: "https://developers.facebook.com/docs/graph-api",
    iconName: "facebook",
    defaultScopes: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "public_profile",
    ],
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
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: true,
      supportsDrafts: true,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: FACEBOOK_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.appId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      response_type: "code",
      state: options.state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const shortLivedRes = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>(`${this.apiBaseUrl}/oauth/access_token`, {
      method: "GET",
      params: {
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: options.redirectUri,
        code: options.code,
      },
    });

    const longLivedRes = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>(`${this.apiBaseUrl}/oauth/access_token`, {
      method: "GET",
      params: {
        grant_type: "fb_exchange_token",
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedRes.data.access_token,
      },
    });

    const userAccessToken = longLivedRes.data.access_token;
    const profile = await this.verifyCredentials({ accessToken: userAccessToken });
    const pages = await this.getUserPages(userAccessToken);
    const defaultPage = pages[0];

    return {
      accessToken: defaultPage ? defaultPage.access_token : userAccessToken,
      refreshToken: userAccessToken,
      expiresAt: new Date(Date.now() + (longLivedRes.data.expires_in || 5184000) * 1000),
      scopes: this.metadata.defaultScopes,
      accountId: defaultPage ? defaultPage.id : profile.id,
      accountHandle: defaultPage ? defaultPage.name : profile.handle,
      accountName: defaultPage ? defaultPage.name : profile.name,
      avatarUrl: profile.avatarUrl,
      extra: {
        userAccessToken,
        pageId: defaultPage?.id,
        pages,
      },
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
    }>(`${this.apiBaseUrl}/oauth/access_token`, {
      method: "GET",
      params: {
        grant_type: "fb_exchange_token",
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: refreshToken,
      },
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.access_token,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + (res.data.expires_in || 5184000) * 1000),
    };
  }

  public async getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    const res = await this.http.request<{ data: FacebookPage[] }>(
      `${this.apiBaseUrl}/me/accounts`,
      {
        method: "GET",
        bearerToken: userAccessToken,
        params: {
          fields: "id,name,access_token,category,tasks,picture",
        },
      },
    );

    return res.data.data.map((p: FacebookPage) => ({
      id: p.id,
      name: p.name,
      access_token: p.access_token,
      category: p.category,
      tasks: p.tasks,
      picture: p.picture,
    }));
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<FacebookUserResponse>(`${this.apiBaseUrl}/me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        fields: "id,name,email,picture.width(200).height(200)",
      },
    });

    return {
      id: res.data.id,
      handle: res.data.name,
      name: res.data.name,
      email: res.data.email,
      avatarUrl: res.data.picture?.data?.url,
      profileUrl: `https://facebook.com/${res.data.id}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateFacebookPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const pageId = payload.platformOptions?.pageId || credentials.accountId || "me";
    const primaryMedia = payload.media?.[0];

    // 1. Photo Post
    if (primaryMedia && primaryMedia.type === "image") {
      const res = await this.http.request<FacebookPagePostResponse>(
        `${this.apiBaseUrl}/${pageId}/photos`,
        {
          method: "POST",
          bearerToken: credentials.accessToken,
          params: {
            url: primaryMedia.url,
            message: payload.content,
          },
        },
      );

      const postId = res.data.post_id || res.data.id;
      return {
        success: true,
        externalPostId: postId,
        externalPostUrl: `https://facebook.com/${postId}`,
        publishedAt: new Date(),
        rawResponse: res.data,
      };
    }

    // 2. Video Post
    if (primaryMedia && primaryMedia.type === "video") {
      const res = await this.http.request<FacebookPagePostResponse>(
        `${this.apiBaseUrl}/${pageId}/videos`,
        {
          method: "POST",
          bearerToken: credentials.accessToken,
          params: {
            file_url: primaryMedia.url,
            description: payload.content,
            title: payload.title,
          },
        },
      );

      const postId = res.data.id;
      return {
        success: true,
        externalPostId: postId,
        externalPostUrl: `https://facebook.com/${postId}`,
        publishedAt: new Date(),
        rawResponse: res.data,
      };
    }

    // 3. Text or Link Feed Post
    const feedParams: Record<string, string> = {
      message: payload.content,
    };

    if (payload.linkUrl) {
      feedParams.link = payload.linkUrl;
    }

    if (payload.scheduledAt) {
      feedParams.published = "false";
      feedParams.scheduled_publish_time = String(Math.floor(payload.scheduledAt.getTime() / 1000));
    }

    const res = await this.http.request<FacebookPagePostResponse>(
      `${this.apiBaseUrl}/${pageId}/feed`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        params: feedParams,
      },
    );

    const postId = res.data.id;
    return {
      success: true,
      externalPostId: postId,
      externalPostUrl: `https://facebook.com/${postId}`,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }
}
