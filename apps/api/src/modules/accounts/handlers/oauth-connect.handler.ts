import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { AccountsRepository, SocialPlatformEnum, ConnectedAccountStatus } from "@repo/db";
import { errorResponseSchemas, encrypt, logger, signJwt, verifyJwt } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { env } from "@/env";
import { createSocialProviderRegistry, providerIdForPlatform } from "@/modules/provider-registry";
import { createHash, randomBytes } from "crypto";
import type { SocialPlatform } from "@repo/libraries";

const providerRegistry = createSocialProviderRegistry();

function getProvider(platform: string) {
  const providerId = providerIdForPlatform(platform) as SocialPlatform;
  if (!providerRegistry.has(providerId)) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      message: `Publishing is not supported for ${platform}`,
    });
  }
  return providerRegistry.get(providerId);
}

// 1. Get OAuth Authorization URL Route
export const getOAuthUrlRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/oauth/:platform/url",
  tags: ["Accounts"],
  summary: "Generate OAuth authorization URL",
  description: "Generates a secure PKCE authorization URL for the selected social media platform",
  request: {
    params: z.object({
      platform: z.enum(SocialPlatformEnum).openapi({ example: SocialPlatformEnum.YOUTUBE }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            redirectUri: z
              .string()
              .url()
              .openapi({ example: "https://socioconnect.app/auth/callback" }),
            scopes: z.array(z.string()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "OAuth URL generated successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "OAuth URL generated" }),
            payload: z.object({
              authUrl: z
                .string()
                .openapi({ example: "https://accounts.google.com/o/oauth2/v2/auth?..." }),
              state: z.string().openapi({ example: "state_token_xyz" }),
              codeVerifier: z.string().optional(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetOAuthUrlRoute = typeof getOAuthUrlRoute;

export const getOAuthUrlHandler: AppRouteHandler<GetOAuthUrlRoute> = async (c) => {
  const { platform } = c.req.valid("param");
  const { redirectUri, scopes } = c.req.valid("json");
  const user = c.get("user");

  try {
    const provider = getProvider(platform);
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const state = signJwt(
      { userId: user.id, platform, redirectUri, codeChallenge },
      env.JWT_SECRET,
      { expiresIn: "10m" },
    );
    const authUrl = provider.getAuthUrl({
      state,
      redirectUri,
      scopes: scopes?.length ? scopes : provider.metadata.defaultScopes,
      codeVerifier,
      codeChallenge,
    });

    return c.json({
      message: "OAuth URL generated",
      payload: {
        authUrl,
        state,
        codeVerifier,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    logger.error("Error generating OAuth URL", {
      module: "accounts",
      action: "getOAuthUrlHandler",
      error: err,
    });
    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to generate authorization URL" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 2. Complete OAuth Callback & Encrypt Tokens Route
export const postOAuthCallbackRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/oauth/:platform/callback",
  tags: ["Accounts"],
  summary: "Exchange OAuth code and connect account",
  description:
    "Exchanges authorization code for credentials and securely stores encrypted tokens in the token vault",
  request: {
    params: z.object({
      platform: z.enum(SocialPlatformEnum).openapi({ example: SocialPlatformEnum.YOUTUBE }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.string().optional().openapi({ example: "4/0AeanS0..." }),
            botToken: z.string().optional(),
            redirectUri: z.url().optional(),
            state: z.string().optional(),
            codeVerifier: z.string().optional(),
            chatId: z.string().optional(),
          }).refine((value) => Boolean(value.code || value.botToken), {
            message: "An OAuth code or Telegram bot token is required",
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Account connected successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Account connected successfully" }),
            payload: z.object({
              accountId: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
              platform: z.enum(SocialPlatformEnum),
              username: z.string(),
              status: z.enum(ConnectedAccountStatus),
              telegramLinkCode: z.string().optional(),
              telegramWebhookConfigured: z.boolean().optional(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type PostOAuthCallbackRoute = typeof postOAuthCallbackRoute;

export const postOAuthCallbackHandler: AppRouteHandler<PostOAuthCallbackRoute> = async (c) => {
  const { platform } = c.req.valid("param");
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    if (platform !== SocialPlatformEnum.TELEGRAM) {
      if (!body.state) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          message: "OAuth state is required",
        });
      }
      const state = verifyJwt<{
        userId?: string;
        platform?: string;
        redirectUri?: string;
        codeChallenge?: string;
      }>(body.state, env.JWT_SECRET);
      const verifierChallenge = body.codeVerifier
        ? createHash("sha256").update(body.codeVerifier).digest("base64url")
        : undefined;
      if (
        !state ||
        state.userId !== user.id ||
        state.platform !== platform ||
        state.redirectUri !== body.redirectUri ||
        state.codeChallenge !== verifierChallenge
      ) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          message: "OAuth state does not match the signed-in user and platform",
        });
      }
    }

    const provider = getProvider(platform);
    const credentials = await provider.exchangeCode({
      code:
        platform === SocialPlatformEnum.TELEGRAM
          ? body.botToken || body.code || ""
          : body.code || "",
      redirectUri: body.redirectUri || "",
      codeVerifier: body.codeVerifier,
    });
    const profile = await provider.verifyCredentials(credentials);
    const encryptedAccess = encrypt(credentials.accessToken, env.ENCRYPTION_KEY);
    const encryptedRefresh = credentials.refreshToken
      ? encrypt(credentials.refreshToken, env.ENCRYPTION_KEY)
      : undefined;
    const platformAccountId = credentials.accountId || profile.id;
    const username = profile.handle;
    const telegramLinkCode =
      platform === SocialPlatformEnum.TELEGRAM ? randomBytes(16).toString("base64url") : undefined;
    const telegramWebhookSecret =
      platform === SocialPlatformEnum.TELEGRAM ? randomBytes(32).toString("base64url") : undefined;

    const account = await AccountsRepository.upsert({
      userId: user.id,
      platform: platform as SocialPlatformEnum,
      platformAccountId,
      username,
      displayName: credentials.accountName || profile.name,
      avatarUrl: credentials.avatarUrl || profile.avatarUrl || null,
      profileUrl: profile.profileUrl || null,
      status: ConnectedAccountStatus.ACTIVE,
      accessToken: encryptedAccess.data,
      accessTokenIv: encryptedAccess.iv,
      accessTokenTag: encryptedAccess.tag,
      accessTokenExpiresAt: credentials.expiresAt ? new Date(credentials.expiresAt) : null,
      refreshToken: encryptedRefresh?.data || null,
      refreshTokenIv: encryptedRefresh?.iv || null,
      refreshTokenTag: encryptedRefresh?.tag || null,
      scopes: credentials.scopes || [],
      metadata: {
        ...(credentials.extra || {}),
        ...(platform === SocialPlatformEnum.TELEGRAM && body.chatId
          ? { telegramChatId: body.chatId }
          : {}),
        ...(telegramLinkCode
          ? {
              telegramLinkCodeHash: createHash("sha256").update(telegramLinkCode).digest("hex"),
              telegramLinkCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              telegramWebhookSecret,
            }
          : {}),
      },
      lastHealthCheckAt: new Date(),
      lastHealthStatus: "200_OK",
    });

    let telegramWebhookConfigured = false;
    if (platform === SocialPlatformEnum.TELEGRAM && telegramWebhookSecret) {
      const webhookBase = process.env.TELEGRAM_WEBHOOK_BASE_URL;
      if (webhookBase) {
        const base = new URL(webhookBase);
        if (base.protocol !== "https:") throw new Error("Telegram webhook URL must use HTTPS");
        const webhookUrl = new URL(`/v1/bots/telegram/${account.id}/webhook`, base).toString();
        const webhookResponse = await fetch(
          `https://api.telegram.org/bot${credentials.accessToken}/setWebhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: webhookUrl, secret_token: telegramWebhookSecret }),
          },
        );
        telegramWebhookConfigured =
          webhookResponse.ok && Boolean(((await webhookResponse.json()) as { ok?: boolean }).ok);
        if (!telegramWebhookConfigured) throw new Error("Telegram rejected the webhook configuration");
      }
    }

    return c.json(
      {
        message: "Account connected successfully",
        payload: {
          accountId: account.id,
          platform: account.platform as SocialPlatformEnum,
          username: account.username,
          status: account.status as ConnectedAccountStatus,
          ...(telegramLinkCode ? { telegramLinkCode } : {}),
          ...(platform === SocialPlatformEnum.TELEGRAM
            ? { telegramWebhookConfigured }
            : {}),
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    logger.error("Error exchanging OAuth code", {
      module: "accounts",
      action: "postOAuthCallbackHandler",
      error: err,
    });
    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to connect account" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
