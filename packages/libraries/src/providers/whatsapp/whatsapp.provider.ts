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
import { WHATSAPP_LIMITS, validateWhatsAppPost } from "./whatsapp.validator";
import type { WhatsAppPostResponse, WhatsAppUserResponse } from "./whatsapp.types";

export class WhatsAppProvider extends BaseSocialProvider {
  private clientId?: string;
  private clientSecret?: string;
  private apiBaseUrl: string;

  constructor(clientId?: string, clientSecret?: string, apiBaseUrl = "https://graph.facebook.com/v19.0") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBaseUrl = apiBaseUrl;
  }

  public readonly metadata: ProviderMetadata = {
    id: "whatsapp" as SocialPlatform,
    name: "WhatsApp",
    websiteUrl: "https://business.whatsapp.com",
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
    iconName: "whatsapp",
    defaultScopes: ["whatsapp_business_messaging","whatsapp_business_management"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 1,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: false,
    },
    limits: WHATSAPP_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      response_type: "code",
      state: options.state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
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
      const res = await this.http.request<WhatsAppUserResponse>(`${this.apiBaseUrl}/user/me`, {
        method: "GET",
        headers,
      });

      return {
        id: String(res.data.id || credentials.accountId || "whatsapp_user"),
        handle: res.data.username || credentials.accountHandle || "whatsapp_creator",
        name: res.data.name || credentials.accountName || "WhatsApp Account",
        avatarUrl: res.data.avatar_url || credentials.avatarUrl,
        profileUrl: res.data.profile_url,
        rawProfile: res.data as unknown as Record<string, unknown>,
      };
    } catch {
      return {
        id: credentials.accountId || "whatsapp_user",
        handle: credentials.accountHandle || "whatsapp_creator",
        name: credentials.accountName || "WhatsApp Account",
        avatarUrl: credentials.avatarUrl,
        profileUrl: `https://business.whatsapp.com/${credentials.accountHandle || ""}`,
      };
    }
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateWhatsAppPost(payload);
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

    const res = await this.http.request<WhatsAppPostResponse>(`${this.apiBaseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: postPayload,
    });

    return {
      success: true,
      externalPostId: String(res.data.id || `whatsapp_${Date.now()}`),
      externalPostUrl: res.data.url || `https://business.whatsapp.com/post/${res.data.id || Date.now()}`,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
