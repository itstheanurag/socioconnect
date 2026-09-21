import type { BotInboundMessage, BotOutboundReply } from "@/types/bot.types";
import type { WhatsAppWebhookPayload } from "./whatsapp.types";

export class WhatsAppBotAdapter {
  private accessToken: string;
  private phoneNumberId: string;
  private apiBaseUrl = "https://graph.facebook.com/v19.0";

  constructor(accessToken = "", phoneNumberId = "") {
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  }

  /**
   * Parses WhatsApp Cloud API Webhook payload into standard BotInboundMessage
   */
  public parseWebhookPayload(payload: WhatsAppWebhookPayload): BotInboundMessage | null {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const contact = change?.value?.contacts?.[0];

    if (!message) return null;

    let text = "";
    if (message.type === "text" && message.text) {
      text = message.text.body;
    } else if (message.type === "interactive" && message.interactive) {
      text =
        message.interactive.button_reply?.id ||
        message.interactive.button_reply?.title ||
        message.interactive.list_reply?.id ||
        "";
    }

    return {
      id: message.id,
      channel: "whatsapp",
      sender: {
        channel: "whatsapp",
        channelUserId: message.from,
        displayName: contact?.profile?.name || message.from,
      },
      text,
      timestamp: new Date(parseInt(message.timestamp, 10) * 1000),
      rawPayload: payload,
    };
  }

  /**
   * Sends an outbound reply to WhatsApp user via Meta Cloud API
   */
  public async sendReply(reply: BotOutboundReply): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID must be configured.");
    }

    const recipient = reply.recipientId;
    let body: Record<string, unknown>;

    if (reply.buttons && reply.buttons.length > 0) {
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: reply.text },
          action: {
            buttons: reply.buttons.slice(0, 3).map((b) => ({
              type: "reply",
              reply: {
                id: b.payload,
                title: b.label.slice(0, 20),
              },
            })),
          },
        },
      };
    } else {
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { body: reply.text },
      };
    }

    const response = await fetch(`${this.apiBaseUrl}/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.ok;
  }
}
