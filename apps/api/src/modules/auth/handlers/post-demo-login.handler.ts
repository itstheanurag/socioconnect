import { timingSafeEqual } from "node:crypto";
import { createRoute, z } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import {
  SessionProvider,
  SessionService,
  SessionStatus,
  UsersRepository,
  WorkspacesRepository,
} from "@repo/db";
import { encrypt, errorResponseSchemas, logger, signJwt } from "@repo/shared";
import { StatusCodes } from "@repo/config";
import { env } from "@/env";
import type { AppRouteHandler } from "@/types";

const DEMO_SESSION_DAYS = 7;

function passwordsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const postDemoLoginRoute = createRoute({
  method: "post",
  path: "/v1/auth/demo/login",
  tags: ["Auth"],
  summary: "Demo account login for marketplace review",
  description:
    "Password login for the seeded review account. Disabled unless DEMO_LOGIN_ENABLED=true.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.email(),
            password: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logged in to the demo account",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              user: z.object({
                email: z.string(),
                firstName: z.string(),
                lastName: z.string().nullable(),
                role: z.string(),
                avatar: z.string().nullable(),
              }),
              redirectTo: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type PostDemoLoginRoute = typeof postDemoLoginRoute;

export const postDemoLoginHandler: AppRouteHandler<PostDemoLoginRoute> = async (c) => {
  if (!env.DEMO_LOGIN_ENABLED || !env.DEMO_ACCOUNT_PASSWORD) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  const { email, password } = c.req.valid("json");

  if (
    email.toLowerCase() !== env.DEMO_ACCOUNT_EMAIL.toLowerCase() ||
    !passwordsMatch(password, env.DEMO_ACCOUNT_PASSWORD)
  ) {
    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      res: c.json(
        { message: "Invalid demo credentials" },
        StatusCodes.HTTP_401_UNAUTHORIZED,
      ),
    });
  }

  const user = await UsersRepository.findByEmail(env.DEMO_ACCOUNT_EMAIL);
  if (!user) {
    logger.error("demo account is enabled but not seeded", {
      module: "auth",
      action: "demo:login:missing_user",
      email: env.DEMO_ACCOUNT_EMAIL,
    });
    throw new HTTPException(StatusCodes.HTTP_503_SERVICE_UNAVAILABLE, {
      res: c.json(
        { message: "Demo account is not provisioned" },
        StatusCodes.HTTP_503_SERVICE_UNAVAILABLE,
      ),
    });
  }

  await WorkspacesRepository.ensurePersonalWorkspace(
    user.id,
    `${env.DEMO_ACCOUNT_NAME}'s workspace`,
  );

  const provisioned = encrypt("demo-provider-token", env.ENCRYPTION_KEY);
  const refresh = encrypt("demo-provider-refresh", env.ENCRYPTION_KEY);
  const expiresAt = new Date(Date.now() + DEMO_SESSION_DAYS * 24 * 60 * 60 * 1000);

  const session = await SessionService.create({
    userId: user.id,
    status: SessionStatus.ACTIVE,
    provider: SessionProvider.GOOGLE,
    providerAccessToken: provisioned.data,
    providerAccessTokenIv: provisioned.iv,
    providerAccessTokenTag: provisioned.tag,
    providerAccessTokenExpiresAt: expiresAt,
    providerRefreshToken: refresh.data,
    providerRefreshTokenIv: refresh.iv,
    providerRefreshTokenTag: refresh.tag,
    providerScope: "demo",
    providerRefreshTokenExpiresAt: expiresAt,
    providerAccountId: user.providerAccountId,
    expiresAt,
    lastAccessedAt: new Date(),
    metadata: {
      ipAddress: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: c.req.header("user-agent"),
      device: "Marketplace review",
    },
  });

  const accessToken = signJwt(
    { userId: user.id, sessionId: session.id },
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  const refreshToken = signJwt(
    { userId: user.id, sessionId: session.id },
    env.JWT_SECRET,
    { expiresIn: `${DEMO_SESSION_DAYS}d` },
  );

  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_SESSION_DAYS * 24 * 60 * 60,
  });
  setCookie(c, "access_token", accessToken, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  logger.audit("demo account logged in", {
    module: "auth",
    action: "demo:login:success",
    userId: user.id,
    sessionId: session.id,
  });

  return c.json({
    message: "Logged in to the demo account",
    payload: {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      redirectTo: "/dashboard",
    },
  });
};
