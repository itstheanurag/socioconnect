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
import { DISCORD_LIMITS, validateDiscordPost } from "./discord.validator";
import type { DiscordMessageResponse, DiscordUserResponse } from "./discord.types";

export class DiscordProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://discord.com/api/v10";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "discord",
    name: "Discord",
    websiteUrl: "https://discord.com",
    docsUrl: "https://discord.com/developers/docs/reference",
    iconName: "discord",
    defaultScopes: ["identify", "guilds", "messages.read", "webhook.incoming"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 10,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 10,
      supportsLinks: true,
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: false,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: true,
    },
    limits: DISCORD_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      response_type: "code",
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      state: options.state,
      prompt: "consent",
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
      webhook?: {
        id: string;
        token: string;
        channel_id: string;
        url: string;
      };
    }>(`${this.apiBaseUrl}/oauth2/token`, {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        code: options.code,
        redirect_uri: options.redirectUri,
      }),
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope.split(" "),
      accountId: profile.id,
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
      extra: {
        webhook: res.data.webhook,
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
      refresh_token: string;
      scope: string;
    }>(`${this.apiBaseUrl}/oauth2/token`, {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(" ") : undefined,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<DiscordUserResponse>(`${this.apiBaseUrl}/users/@me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
    });

    const avatarUrl = res.data.avatar
      ? `https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    return {
      id: res.data.id,
      handle: res.data.username,
      name: res.data.global_name || res.data.username,
      email: res.data.email,
      avatarUrl,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateDiscordPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const webhookUrl =
      payload.platformOptions?.webhookUrl ||
      (credentials.extra?.webhook as { url?: string } | undefined)?.url;

    const channelId =
      payload.platformOptions?.channelId ||
      (credentials.extra?.webhook as { channel_id?: string } | undefined)?.channel_id;

    const embeds: Array<Record<string, unknown>> = [];

    if (payload.title || payload.linkUrl) {
      embeds.push({
        title: payload.title,
        url: payload.linkUrl,
        description: payload.content.length > 2000 ? payload.content.slice(0, 4000) : undefined,
        color: 0x5865f2,
        image: payload.media?.[0]?.url ? { url: payload.media[0].url } : undefined,
      });
    }

    const messageBody: Record<string, unknown> = {
      content: payload.title ? "" : payload.content,
      embeds: embeds.length > 0 ? embeds : undefined,
    };

    let endpointUrl: string;
    const headers: Record<string, string> = {};

    if (webhookUrl) {
      endpointUrl = webhookUrl;
    } else if (channelId) {
      endpointUrl = `${this.apiBaseUrl}/channels/${channelId}/messages`;
      headers["Authorization"] = `Bearer ${credentials.accessToken}`;
    } else {
      throw new Error(
        "Discord publishing requires either a webhook URL or target channel ID in platformOptions or credentials.",
      );
    }

    const res = await this.http.request<DiscordMessageResponse>(endpointUrl, {
      method: "POST",
      headers,
      body: messageBody,
    });

    const messageId = res.data?.id || `msg_${Date.now()}`;
    const postUrl = channelId
      ? `https://discord.com/channels/@me/${channelId}/${messageId}`
      : undefined;

    return {
      success: true,
      externalPostId: messageId,
      externalPostUrl: postUrl,
      publishedAt: new Date(res.data?.timestamp || Date.now()),
      rawResponse: res.data,
    };
  }
}
