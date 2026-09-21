import type { BotInboundMessage, BotOutboundReply } from "@/types/bot.types";
import type { DiscordInteraction } from "./discord.types";

export class DiscordBotAdapter {
  private botToken: string;
  private apiBaseUrl = "https://discord.com/api/v10";

  constructor(botToken = "") {
    this.botToken = botToken || process.env.DISCORD_BOT_TOKEN || "";
  }

  /**
   * Parses Discord Interaction webhook or gateway event into standard BotInboundMessage
   */
  public parseInteraction(interaction: DiscordInteraction): BotInboundMessage | null {
    const user = interaction.member?.user || interaction.user;
    if (!user) return null;

    let text = "";
    if (interaction.type === 2 && interaction.data?.options) {
      // Slash command e.g. /post draft:"my text"
      text = interaction.data.options.map((o) => `${o.name}: ${o.value}`).join(" ");
    } else if (interaction.type === 3 && interaction.data?.custom_id) {
      // Button click
      text = interaction.data.custom_id;
    }

    return {
      id: interaction.id,
      channel: "discord",
      sender: {
        channel: "discord",
        channelUserId: user.id,
        username: user.username,
        displayName: user.global_name || user.username,
      },
      text,
      replyToMessageId: interaction.message?.id,
      timestamp: new Date(),
      rawPayload: interaction,
    };
  }

  /**
   * Sends an outbound reply to Discord channel
   */
  public async sendReply(reply: BotOutboundReply): Promise<boolean> {
    if (!this.botToken) {
      throw new Error("DISCORD_BOT_TOKEN must be configured.");
    }

    const components: Array<Record<string, unknown>> = [];

    if (reply.buttons && reply.buttons.length > 0) {
      components.push({
        type: 1, // Action Row
        components: reply.buttons.slice(0, 5).map((b) => ({
          type: 2, // Button
          label: b.label,
          style: b.style === "danger" ? 4 : b.style === "secondary" ? 2 : 1,
          custom_id: b.payload,
        })),
      });
    }

    const body: Record<string, unknown> = {
      content: reply.text,
      components: components.length > 0 ? components : undefined,
    };

    const response = await fetch(`${this.apiBaseUrl}/channels/${reply.recipientId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.ok;
  }
}
