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
import { TELEGRAM_LIMITS, validateTelegramPost } from "./telegram.validator";
import type {
  TelegramMediaGroupResponse,
  TelegramMessageResponse,
  TelegramUserResponse,
} from "./telegram.types";

export class TelegramProvider extends BaseSocialProvider {
  private botToken?: string;
  private defaultChatId?: string;

  constructor(botToken = "", defaultChatId = "") {
    super();
    this.botToken = botToken;
    this.defaultChatId = defaultChatId;
  }

  public readonly metadata: ProviderMetadata = {
    id: "telegram",
    name: "Telegram",
    websiteUrl: "https://telegram.org",
    docsUrl: "https://core.telegram.org/bots/api",
    iconName: "telegram",
    defaultScopes: ["bot"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 10,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 10,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 20,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: false,
    },
    limits: TELEGRAM_LIMITS,
  };

  public getAuthUrl(_options: AuthUrlOptions): string {
    return "https://t.me/BotFather";
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const token = options.code;
    const profile = await this.verifyCredentials({ accessToken: token });

    return {
      accessToken: token,
      accountId: profile.id,
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    _refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    const token = currentCredentials?.accessToken || "";
    return {
      accessToken: token,
      refreshToken: token,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const token = credentials.accessToken || this.botToken;
    const res = await this.http.request<TelegramUserResponse>(
      `https://api.telegram.org/bot${token}/getMe`,
      { method: "GET" },
    );

    const bot = res.data.result;
    return {
      id: String(bot.id),
      handle: bot.username ? `@${bot.username}` : bot.first_name,
      name: bot.first_name,
      profileUrl: bot.username ? `https://t.me/${bot.username}` : undefined,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateTelegramPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const token = credentials.accessToken || this.botToken;
    const chatId =
      payload.platformOptions?.chatId ||
      credentials.extra?.chatId ||
      this.defaultChatId ||
      credentials.accountId;

    if (!chatId) {
      throw new Error(
        "[TELEGRAM] Target chatId or channel username is required to broadcast message.",
      );
    }

    const parseMode = payload.platformOptions?.parseMode || "HTML";
    const isSilent = payload.platformOptions?.silent || false;
    const disableWebPreview = payload.platformOptions?.disableWebPagePreview || false;

    let messageId: string;
    let chatUsername: string | undefined;
    let rawResponse: TelegramMessageResponse | TelegramMediaGroupResponse;

    // 1. Single Image
    if (payload.media && payload.media.length === 1 && payload.media[0]?.type === "image") {
      const res = await this.http.request<TelegramMessageResponse>(
        `https://api.telegram.org/bot${token}/sendPhoto`,
        {
          method: "POST",
          body: {
            chat_id: chatId,
            photo: payload.media[0].url,
            caption: payload.content,
            parse_mode: parseMode,
            disable_notification: isSilent,
          },
        },
      );
      rawResponse = res.data;
      messageId = String(res.data.result.message_id);
      chatUsername = res.data.result.chat.username;
    }
    // 2. Single Video
    else if (payload.media && payload.media.length === 1 && payload.media[0]?.type === "video") {
      const res = await this.http.request<TelegramMessageResponse>(
        `https://api.telegram.org/bot${token}/sendVideo`,
        {
          method: "POST",
          body: {
            chat_id: chatId,
            video: payload.media[0].url,
            caption: payload.content,
            parse_mode: parseMode,
            disable_notification: isSilent,
          },
        },
      );
      rawResponse = res.data;
      messageId = String(res.data.result.message_id);
      chatUsername = res.data.result.chat.username;
    } else if (payload.media && payload.media.length > 1) {
      const media = payload.media.map((item, index) => ({
        type: item.type === "video" ? "video" : "photo",
        media: item.url,
        ...(index === 0 && payload.content
          ? { caption: payload.content, parse_mode: parseMode }
          : {}),
      }));
      const res = await this.http.request<TelegramMediaGroupResponse>(
        `https://api.telegram.org/bot${token}/sendMediaGroup`,
        {
          method: "POST",
          body: { chat_id: chatId, media, disable_notification: isSilent },
        },
      );
      rawResponse = res.data;
      const firstMessage = res.data.result[0];
      messageId = String(firstMessage.message_id);
      chatUsername = firstMessage.chat.username;
    }
    // 3. Text message
    else {
      let messageText = payload.content;
      if (payload.linkUrl && !messageText.includes(payload.linkUrl)) {
        messageText = `${messageText}\n\n${payload.linkUrl}`.trim();
      }

      const res = await this.http.request<TelegramMessageResponse>(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          body: {
            chat_id: chatId,
            text: messageText,
            parse_mode: parseMode,
            disable_web_page_preview: disableWebPreview,
            disable_notification: isSilent,
          },
        },
      );
      rawResponse = res.data;
      messageId = String(res.data.result.message_id);
      chatUsername = res.data.result.chat.username;
    }

    if (payload.platformOptions?.pinMessage) {
      await this.http.request(`https://api.telegram.org/bot${token}/pinChatMessage`, {
        method: "POST",
        body: { chat_id: chatId, message_id: messageId, disable_notification: isSilent },
      });
    }
    const postUrl = chatUsername ? `https://t.me/${chatUsername}/${messageId}` : undefined;

    return {
      success: true,
      externalPostId: messageId,
      externalPostUrl: postUrl,
      publishedAt: new Date(),
      rawResponse,
    };
  }
}
