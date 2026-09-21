import type {
  BotInboundMessage,
  BotOutboundReply,
  BotReplyButton,
  BotSession,
} from "@/types/bot.types";
import { BotIntentClassifier } from "@/ai/intent-classifier";
import { InMemorySessionStore, type SessionStore } from "./session-store";
import {
  ProviderRegistry,
  type SocialPlatform,
  type UniversalPostPayload,
  type ValidationError,
} from "@repo/libraries";

export interface BotWorkflowConfig {
  sessionStore?: SessionStore;
  intentClassifier?: BotIntentClassifier;
  providerRegistry?: ProviderRegistry;
  onExecutePostAction?: (action: {
    creatorId?: string;
    action: "PUBLISH" | "SCHEDULE";
    payload: UniversalPostPayload;
    targetPlatforms: SocialPlatform[];
    scheduledAt?: Date;
  }) => Promise<{ success: boolean; message: string; trackingId?: string }>;
}

export class BotWorkflowEngine {
  private sessionStore: SessionStore;
  private classifier: BotIntentClassifier;
  private registry: ProviderRegistry;
  private onExecutePostAction?: BotWorkflowConfig["onExecutePostAction"];

  constructor(config: BotWorkflowConfig = {}) {
    this.sessionStore = config.sessionStore || new InMemorySessionStore();
    this.classifier = config.intentClassifier || new BotIntentClassifier();
    this.registry = config.providerRegistry || ProviderRegistry.createDefault();
    this.onExecutePostAction = config.onExecutePostAction;
  }

  public async processInboundMessage(message: BotInboundMessage): Promise<BotOutboundReply> {
    const { channel, sender, text } = message;

    // 1. Get or initialize user session
    let session = await this.sessionStore.getSession(channel, sender.channelUserId);
    if (!session) {
      session = {
        sessionId: `${channel}:${sender.channelUserId}:${Date.now()}`,
        channel,
        channelUserId: sender.channelUserId,
        creatorId: sender.userId,
        currentStep: "IDLE",
        recentMessages: [],
        lastActiveAt: new Date(),
      };
    }

    // 2. Classify intent via Guardrails + GPT Light model
    const aiResult = await this.classifier.classifyMessage(text, session);

    // Record interaction
    session.recentMessages.push({ role: "user", content: text, timestamp: new Date() });
    if (session.recentMessages.length > 10) {
      session.recentMessages.shift();
    }

    // 3. Process Intent
    let replyText = "";
    let buttons: BotReplyButton[] | undefined;

    switch (aiResult.intent) {
      case "REJECTED_SAFETY_VIOLATION":
      case "REJECTED_OUT_OF_SCOPE": {
        replyText =
          aiResult.replySuggestion ||
          "i can only assist with drafting, validating, and scheduling social media posts.";
        break;
      }

      case "HELP": {
        replyText =
          "👋 <b>socioconnect bot</b>\n\n" +
          "i can help you create and schedule posts across all your connected platforms.\n\n" +
          "<b>examples:</b>\n" +
          '• <i>"draft a post for linkedin and bluesky: launching our new version today!"</i>\n' +
          '• <i>"schedule for tomorrow at 3pm on instagram: new podcast episode is live"</i>\n' +
          '• <i>"publish now to discord: server maintenance in 15 mins"</i>';
        break;
      }

      case "CANCEL_ACTION": {
        session.pendingAction = undefined;
        session.currentStep = "IDLE";
        replyText = "action cancelled. your draft has been discarded.";
        break;
      }

      case "CONFIRM_ACTION": {
        if (!session.pendingAction) {
          replyText = "there is no pending post to confirm. send me a draft to get started!";
        } else {
          const action = session.pendingAction;
          if (this.onExecutePostAction) {
            try {
              const execRes = await this.onExecutePostAction({
                creatorId: session.creatorId,
                action: action.action,
                payload: action.payload,
                targetPlatforms: action.targetPlatforms,
                scheduledAt: action.scheduledAt,
              });

              replyText = execRes.success
                ? `✅ <b>post ${action.action === "SCHEDULE" ? "scheduled" : "published"} successfully!</b>\n\n${execRes.message}`
                : `❌ <b>failed to ${action.action.toLowerCase()}:</b> ${execRes.message}`;
            } catch (err) {
              replyText = `❌ error executing post: ${err instanceof Error ? err.message : String(err)}`;
            }
          } else {
            replyText = `✅ <b>post confirmed!</b>\n\nplatforms: ${action.targetPlatforms.join(", ")}\nstatus: queued for ${action.action.toLowerCase()}`;
          }

          session.pendingAction = undefined;
          session.currentStep = "IDLE";
        }
        break;
      }

      case "CREATE_DRAFT":
      case "SCHEDULE_POST":
      case "PUBLISH_IMMEDIATE": {
        const post = aiResult.extractedPost;
        if (!post || !post.content.trim()) {
          replyText = "could not extract post content. please send what you would like to post.";
          break;
        }

        const targetPlatforms =
          post.targetPlatforms.length > 0
            ? post.targetPlatforms
            : (["linkedin", "bluesky", "discord"] as SocialPlatform[]);

        const scheduledAt = post.scheduledTimeIso ? new Date(post.scheduledTimeIso) : undefined;
        const actionType =
          aiResult.intent === "SCHEDULE_POST" || scheduledAt ? "SCHEDULE" : "PUBLISH";

        const payload: UniversalPostPayload = {
          title: post.title,
          content: post.content,
          tags: post.tags,
          linkUrl: post.linkUrl,
          media: post.mediaUrls.map((url) => ({
            url,
            type: "image",
            mimeType: "image/jpeg",
          })),
          scheduledAt,
        };

        // Validate payload against target platforms
        const validation = await this.registry.validateMultiPlatform(payload, targetPlatforms);

        session.pendingAction = {
          action: actionType,
          payload,
          targetPlatforms,
          scheduledAt,
          validationResults: validation.results,
        };
        session.currentStep = "AWAITING_POST_CONFIRMATION";

        // Build preview response
        const platformBadges = targetPlatforms.map((p) => `• ${p}`).join("\n");
        const scheduleDisplay = scheduledAt
          ? `\n⏰ <b>scheduled for:</b> ${scheduledAt.toUTCString()}`
          : "\n⚡ <b>publish mode:</b> immediate";

        let validationNotice = "";
        if (!validation.allValid) {
          validationNotice = "\n\n⚠️ <b>platform warnings:</b>\n";
          for (const [plt, res] of Object.entries(validation.results)) {
            if (!res.valid) {
              validationNotice += `<b>${plt}:</b> ${res.errors.map((e: ValidationError) => e.message).join(", ")}\n`;
            }
          }
        }

        replyText =
          `📝 <b>post draft preview</b>\n\n` +
          `<b>content:</b>\n"${payload.content}"\n\n` +
          `<b>platforms:</b>\n${platformBadges}` +
          scheduleDisplay +
          validationNotice +
          `\n\nready to ${actionType.toLowerCase()}?`;

        buttons = [
          {
            id: "btn_confirm",
            label: actionType === "SCHEDULE" ? "⏰ Yes, Schedule" : "🚀 Yes, Publish Now",
            payload: "confirm",
            style: "primary",
          },
          {
            id: "btn_cancel",
            label: "❌ Cancel",
            payload: "cancel",
            style: "danger",
          },
        ];
        break;
      }

      default: {
        replyText =
          aiResult.replySuggestion || "how can i help with your social media posts today?";
        break;
      }
    }

    // Save updated session state
    await this.sessionStore.saveSession(session);

    return {
      channel,
      recipientId: sender.channelUserId,
      text: replyText,
      buttons,
      replyToMessageId: message.id,
    };
  }
}
