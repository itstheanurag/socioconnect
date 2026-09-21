import type { BotInboundMessage, BotOutboundReply } from "@/types/bot.types";
import type { TelegramUpdate } from "./telegram.types";

export class TelegramBotAdapter {
  private botToken: string;
  private apiBaseUrl: string;

  constructor(botToken = "") {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.apiBaseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Converts a Telegram Update webhook payload into standard BotInboundMessage
   */
  public parseWebhookPayload(update: TelegramUpdate): BotInboundMessage | null {
    if (update.callback_query) {
      const cb = update.callback_query;
      return {
        id: cb.id,
        channel: "telegram",
        sender: {
          channel: "telegram",
          channelUserId: String(cb.from.id),
          username: cb.from.username,
          displayName: cb.from.first_name,
        },
        text: cb.data || "",
        replyToMessageId: cb.message ? String(cb.message.message_id) : undefined,
        timestamp: new Date(),
        rawPayload: update,
      };
    }

    if (update.message) {
      const msg = update.message;
      const text = msg.text || msg.caption || "";

      return {
        id: String(msg.message_id),
        channel: "telegram",
        sender: {
          channel: "telegram",
          channelUserId: String(msg.from?.id || msg.chat.id),
          username: msg.from?.username,
          displayName: msg.from?.first_name,
        },
        text,
        timestamp: new Date(msg.date * 1000),
        rawPayload: update,
      };
    }

    return null;
  }

  /**
   * Sends an outbound reply to Telegram
   */
  public async sendReply(reply: BotOutboundReply): Promise<boolean> {
    if (!this.botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
    }

    const body: Record<string, unknown> = {
      chat_id: reply.recipientId,
      text: reply.text,
      parse_mode: "HTML",
    };

    if (reply.replyToMessageId) {
      body.reply_to_message_id = parseInt(reply.replyToMessageId, 10);
    }

    if (reply.buttons && reply.buttons.length > 0) {
      const inlineKeyboard = reply.buttons.map((b) => [
        {
          text: b.label,
          callback_data: b.payload,
        },
      ]);
      body.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const response = await fetch(`${this.apiBaseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return response.ok;
  }
}
