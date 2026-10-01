import { verifyJwt, signJwt, logger } from "@repo/shared";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { OAuthService } from "../services";
import { oauthProviderFactory } from "../providers";
import { type SessionProvider } from "@repo/db";
import { env } from "@/env";
import { type AppBindings } from "@/types";
import { type Context } from "hono";

import { OAUTH_SESSION_TICKET_PURPOSE } from "./get-oauth-session-establish.handler";

function getApiOrigin(): string {
  return new URL(env.GOOGLE_REDIRECT_URI).origin;
}

function getDashboardRedirectUrl(): string {
  try {
    const frontend = new URL(env.FRONTEND_URL);
    frontend.pathname = "/dashboard";
    return frontend.toString();
  } catch {
    return `${env.FRONTEND_URL}/dashboard`;
  }
}

export interface OauthCallbackParams {
  provider: SessionProvider;
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  /** Apple form_post: first-time user JSON string */
  user?: string;
  /** Apple form_post: id_token may be included in callback body */
  id_token?: string;
}

/**
 * Shared OAuth callback processing for GET (query) and POST (form_post) callbacks.
 */
export async function processOauthCallback(
  c: Context<AppBindings>,
  params: OauthCallbackParams,
): Promise<Response> {
  const { provider, code, state, error, error_description, user, id_token } = params;

  if (!oauthProviderFactory.hasProvider(provider)) {
    const message = `OAuth provider "${provider}" is not supported`;
    if (state) {
      const redirectUrl = new URL(env.FRONTEND_URL);
      redirectUrl.searchParams.set("error", encodeURIComponent(message));
      return c.redirect(redirectUrl.toString());
    }
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      message,
      res: c.json({ message }),
    });
  }

  if (error) {
    logger.error(`OAuth error received from ${provider}`, {
      module: "auth",
      action: "oauth:callback:error",
      provider,
      error,
      error_description,
      state,
    });

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set(
      "error",
      encodeURIComponent(error_description || error || "OAuth authorization failed"),
    );
    return c.redirect(redirectUrl.toString());
  }

  if (!code) {
    logger.error(`OAuth callback missing authorization code for ${provider}`, {
      module: "auth",
      action: "oauth:callback:missing_code",
      provider,
      state,
    });

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set("error", encodeURIComponent("Authorization code is required"));
    return c.redirect(redirectUrl.toString());
  }

  if (!state) {
    logger.error(`OAuth callback missing state parameter for ${provider}`, {
      module: "auth",
      action: "oauth:callback:missing_state",
      provider,
    });

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set(
      "error",
      encodeURIComponent("State parameter is required for security"),
    );
    return c.redirect(redirectUrl.toString());
  }

  let decodedState: { state: string; redirect: "true" | "false" };
  try {
    decodedState = verifyJwt(state, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as { state: string; redirect: "true" | "false" };
  } catch (stateErr) {
    logger.error("Failed to verify OAuth state token", {
      module: "auth",
      action: "oauth:callback:invalid_state",
      provider,
      error: stateErr instanceof Error ? stateErr.message : String(stateErr),
    });

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set("error", encodeURIComponent("Invalid or expired login session"));
    return c.redirect(redirectUrl.toString());
  }

  if (!decodedState?.state) {
    logger.error("Invalid state token structure", {
      module: "auth",
      action: "oauth:callback:invalid_state_structure",
      provider,
    });

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set("error", encodeURIComponent("Invalid login state token"));
    return c.redirect(redirectUrl.toString());
  }

  try {
    const result = await OAuthService.handleCallback(provider, code, {
      callbackData: { user, idToken: id_token },
    });

    const { user: authUser, session } = result;

    logger.audit(`User authenticated via ${provider} OAuth`, {
      module: "auth",
      action: "oauth:authentication:success",
      provider,
      userId: authUser.id,
      email: authUser.email,
      providerAccountId: authUser.providerAccountId,
      sessionId: session.id,
    });

    const serverAccessToken = signJwt(
      { userId: authUser.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const serverRefreshToken = signJwt(
      { userId: authUser.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: "90d" },
    );

    if (decodedState.redirect === "false") {
      return c.json({
        message: "Logged in successfully",
        payload: {
          accessToken: serverAccessToken,
          refreshToken: serverRefreshToken,
        },
      });
    }

    const sessionTicket = signJwt(
      {
        accessToken: serverAccessToken,
        refreshToken: serverRefreshToken,
        purpose: OAUTH_SESSION_TICKET_PURPOSE,
      },
      env.JWT_SECRET,
      { expiresIn: "60s" },
    );

    const establishUrl = new URL("/v1/oauth/session/establish", getApiOrigin());
    establishUrl.searchParams.set("ticket", sessionTicket);
    establishUrl.searchParams.set("next", getDashboardRedirectUrl());

    return c.redirect(establishUrl.toString());
  } catch (err: unknown) {
    if (err instanceof HTTPException) {
      throw err;
    }

    const errorMessage = err instanceof Error ? err.message : "Authentication error occurred";

    logger.error(`Unexpected error during OAuth callback for ${provider}`, {
      module: "auth",
      action: "oauth:callback:error",
      provider,
      error: err instanceof Error ? err.stack || err.message : String(err),
    });

    if (decodedState?.redirect !== "false") {
      const redirectUrl = new URL(env.FRONTEND_URL);
      redirectUrl.searchParams.set("error", encodeURIComponent(errorMessage));
      return c.redirect(redirectUrl.toString());
    }

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: errorMessage,
      res: c.json({
        message: errorMessage,
      }),
    });
  }
}
