import { createRoute, z } from "@hono/zod-openapi";
import { BotWorkflowEngine, type BotSession, type SessionStore } from "@repo/bots";
import { TelegramBotAdapter, type TelegramUpdate } from "@repo/bots/channels";
import {
  AccountsRepository,
  ConnectedAccountStatus,
  DispatchStatusEnum,
  PostStatusEnum,
  PostsRepository,
  SocialPlatformEnum,
  TelegramBotSessionsRepository,
  TimingStrategyEnum,
} from "@repo/db";
import { decrypt, logger } from "@repo/shared";
import { ProviderRegistry, type SocialPlatform } from "@repo/libraries";
import { StatusCodes } from "@repo/config";
import { HTTPException } from "hono/http-exception";
import { createHash, timingSafeEqual } from "crypto";
import type { AppRouteHandler } from "@/types";
import { env } from "@/env";

export const telegramWebhookRoute = createRoute({
  method: "post",
  path: "/v1/bots/telegram/:accountId/webhook",
  tags: ["Bots & AI"],
  summary: "Receive a linked Telegram bot update",
  request: {
    params: z.object({ accountId: z.uuid() }),
    body: {
      content: {
        "application/json": { schema: z.record(z.string(), z.unknown()) },
      },
    },
  },
  responses: {
    200: {
      description: "Telegram update handled",
      content: { "application/json": { schema: z.object({ ok: z.boolean() }) } },
    },
  },
});

export type TelegramWebhookRoute = typeof telegramWebhookRoute;

function secureEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function restoreSession(value: Record<string, unknown>): BotSession {
  const session = value as unknown as BotSession;
  session.lastActiveAt = new Date(session.lastActiveAt);
  session.recentMessages = session.recentMessages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  }));
  if (session.pendingAction?.scheduledAt) {
    session.pendingAction.scheduledAt = new Date(session.pendingAction.scheduledAt);
  }
  if (session.pendingAction?.payload.scheduledAt) {
    session.pendingAction.payload.scheduledAt = new Date(session.pendingAction.payload.scheduledAt);
  }
  return session;
}

async function executePostAction(input: {
  creatorId?: string;
  action: "PUBLISH" | "SCHEDULE";
  payload: import("@repo/libraries").UniversalPostPayload;
  targetPlatforms: SocialPlatform[];
  scheduledAt?: Date;
  originChannel: "telegram" | "whatsapp" | "discord";
  originChatId?: string;
  botAccountId?: string;
}) {
  if (!input.creatorId) return { success: false, message: "The bot is not linked to an owner." };
  const platforms = [...new Set(input.targetPlatforms)];
  const registry = ProviderRegistry.createDefault();
  const validation = await registry.validateMultiPlatform(input.payload, platforms);
  if (!validation.allValid) {
    const messages = Object.entries(validation.results)
      .filter(([, result]) => !result.valid)
      .map(
        ([platform, result]) =>
          `${platform}: ${result.errors.map((error: { message: string }) => error.message).join(", ")}`,
      )
      .join("; ");
    return {
      success: false,
      message: messages || "The post is not valid for the selected platforms.",
    };
  }

  const accounts = (await AccountsRepository.findAllByUserId(input.creatorId)).filter(
    (account) => account.status === ConnectedAccountStatus.ACTIVE,
  );
  const targets = [];
  for (const requestedPlatform of platforms) {
    const databasePlatform = requestedPlatform === "twitter" ? "x" : requestedPlatform;
    const account = accounts.find((candidate) => {
      if (candidate.platform !== databasePlatform) return false;
      return requestedPlatform !== "telegram" || candidate.id === input.botAccountId;
    });
    if (!account) {
      return { success: false, message: `Connect an active ${requestedPlatform} account first.` };
    }
    targets.push({ account, requestedPlatform });
  }

  if (input.action === "SCHEDULE" && (!input.scheduledAt || input.scheduledAt <= new Date())) {
    return { success: false, message: "Choose a future date and time to schedule this post." };
  }

  const scheduledAt = input.action === "SCHEDULE" ? input.scheduledAt! : new Date();
  const { post, dispatches } = await PostsRepository.createWithDispatches({
    post: {
      userId: input.creatorId,
      title: input.payload.title || null,
      content: input.payload.content,
      tags: input.payload.tags || [],
      linkUrl: input.payload.linkUrl || null,
      mediaIds: [],
      status: input.action === "SCHEDULE" ? PostStatusEnum.SCHEDULED : PostStatusEnum.DISPATCHING,
      timingStrategy: TimingStrategyEnum.SIMULTANEOUS,
      scheduledAt,
      metadata: {
        source: "telegram_bot",
        providerMedia: input.payload.media || [],
      },
    },
    dispatches: targets.map(({ account, requestedPlatform }) => ({
      accountId: account.id,
      platform: account.platform,
      status: DispatchStatusEnum.PENDING,
      scheduledFor: scheduledAt,
      customContent: null,
      customTitle: null,
      platformOptions: {
        ...(input.payload.platformOptions || {}),
        ...(requestedPlatform === "telegram" && input.originChatId
          ? { chatId: input.originChatId }
          : {}),
      },
      retryCount: 0,
      maxRetries: 3,
    })),
  });

  return {
    success: true,
    trackingId: post.id,
    message: `${dispatches.length} platform dispatch${dispatches.length === 1 ? "" : "es"} queued for ${scheduledAt.toUTCString()}.`,
  };
}

export const telegramWebhookHandler: AppRouteHandler<TelegramWebhookRoute> = async (c) => {
  const { accountId } = c.req.valid("param");
  const update = c.req.valid("json") as unknown as TelegramUpdate;

  try {
    const account = await AccountsRepository.findById(accountId);
    if (
      !account ||
      account.platform !== SocialPlatformEnum.TELEGRAM ||
      account.status !== ConnectedAccountStatus.ACTIVE
    ) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        message: "Telegram bot not found",
      });
    }

    const metadata = account.metadata || {};
    const expectedSecret = metadata.telegramWebhookSecret;
    const receivedSecret = c.req.header("X-Telegram-Bot-Api-Secret-Token");
    if (
      typeof expectedSecret !== "string" ||
      !receivedSecret ||
      !secureEqual(expectedSecret, receivedSecret)
    ) {
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        message: "Invalid webhook secret",
      });
    }

    const accessToken = decrypt(
      account.accessToken,
      account.accessTokenIv,
      account.accessTokenTag,
      env.ENCRYPTION_KEY,
    );
    const adapter = new TelegramBotAdapter(accessToken);
    const message = adapter.parseWebhookPayload(update);
    if (!message) return c.json({ ok: true });

    const linkMatch = message.text.match(/^\/link(?:@[A-Za-z0-9_]+)?\s+([A-Za-z0-9_-]+)$/i);
    if (linkMatch) {
      const codeHash = createHash("sha256").update(linkMatch[1]).digest("hex");
      const expectedHash = metadata.telegramLinkCodeHash;
      const expiresAt = new Date(String(metadata.telegramLinkCodeExpiresAt || 0));
      if (
        typeof expectedHash === "string" &&
        secureEqual(codeHash, expectedHash) &&
        expiresAt > new Date()
      ) {
        const nextMetadata = { ...metadata };
        delete nextMetadata.telegramLinkCodeHash;
        delete nextMetadata.telegramLinkCodeExpiresAt;
        nextMetadata.telegramLinkedUserId = message.sender.channelUserId;
        await AccountsRepository.updateMetadata(account.id, nextMetadata);
        await adapter.sendReply({
          channel: "telegram",
          recipientId: message.chatId || message.sender.channelUserId,
          text: "This Telegram user is linked. You can now draft and schedule posts here.",
          replyToMessageId: message.replyToMessageId,
        });
        return c.json({ ok: true });
      }
    }

    if (String(metadata.telegramLinkedUserId || "") !== message.sender.channelUserId) {
      await adapter.sendReply({
        channel: "telegram",
        recipientId: message.chatId || message.sender.channelUserId,
        text: "This bot is not linked to this Telegram user. Link it from your SocioConnect account settings first.",
        replyToMessageId: message.replyToMessageId,
      });
      return c.json({ ok: true });
    }

    message.sender.userId = account.userId;
    message.botAccountId = account.id;
    const sessionStore: SessionStore = {
      async getSession(channel, channelUserId) {
        if (channel !== "telegram") return null;
        const stored = await TelegramBotSessionsRepository.find(account.id, channelUserId);
        return stored ? restoreSession(stored) : null;
      },
      async saveSession(session) {
        await TelegramBotSessionsRepository.save(
          account.id,
          session.channelUserId,
          session as unknown as Record<string, unknown>,
          new Date(Date.now() + 30 * 60 * 1000),
        );
      },
      async clearSession(channel, channelUserId) {
        if (channel === "telegram") {
          await TelegramBotSessionsRepository.remove(account.id, channelUserId);
        }
      },
    };
    const engine = new BotWorkflowEngine({ sessionStore, onExecutePostAction: executePostAction });
    const reply = await engine.processInboundMessage(message);
    await adapter.sendReply(reply);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    logger.error("Error handling Telegram bot update", {
      module: "bots",
      action: "telegramWebhook",
      accountId,
      error: err,
    });
    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to handle Telegram update",
    });
  }
};
