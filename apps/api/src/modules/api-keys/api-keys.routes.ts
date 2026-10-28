import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { createRouter, errorResponseSchemas, logger } from "@repo/shared";
import { ApiKeysRepository, AccountsRepository, WorkspacesRepository } from "@repo/db";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { enforceSessionMiddleware } from "@/middlewares/enforce-session.middleware";
import { recordAuditEvent } from "@/utils/events";
import { API_KEY_SCOPES, generateApiKey, isValidScope } from "./api-keys.service";

const apiKeySummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  prefix: z.string(),
  scopes: z.array(z.string()),
  accountIds: z.array(z.uuid()),
  environment: z.string(),
  lastUsedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

export const listApiKeysRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware, enforceSessionMiddleware],
  path: "/v1/api-keys",
  tags: ["API Keys"],
  summary: "List API keys",
  description: "Lists active API keys for the current workspace. Secrets are never returned.",
  responses: {
    200: {
      description: "API keys retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              keys: z.array(apiKeySummarySchema),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListApiKeysRoute = typeof listApiKeysRoute;

export const listApiKeysHandler: AppRouteHandler<ListApiKeysRoute> = async (c) => {
  const user = c.get("user");
  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(user.id);
  const keys = await ApiKeysRepository.listByWorkspace(workspace.id);

  return c.json({
    message: "API keys retrieved successfully",
    payload: {
      keys: keys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        scopes: key.scopes,
        accountIds: key.accountIds,
        environment: key.environment,
        lastUsedAt: key.lastUsedAt ? key.lastUsedAt.toISOString() : null,
        expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
        createdAt: key.createdAt.toISOString(),
      })),
    },
  });
};

export const createApiKeyRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware, enforceSessionMiddleware],
  path: "/v1/api-keys",
  tags: ["API Keys"],
  summary: "Create an API key",
  description:
    "Creates a scoped API key. The plaintext token is returned once and cannot be retrieved again.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(1).max(100),
            scopes: z.array(z.string()).min(1),
            accountIds: z.array(z.uuid()).optional().default([]),
            expiresAt: z.string().datetime().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "API key created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              key: apiKeySummarySchema,
              token: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreateApiKeyRoute = typeof createApiKeyRoute;

export const createApiKeyHandler: AppRouteHandler<CreateApiKeyRoute> = async (c) => {
  const user = c.get("user");
  const { name, scopes, accountIds, expiresAt } = c.req.valid("json");

  const invalidScopes = scopes.filter((scope) => !isValidScope(scope));
  if (invalidScopes.length > 0) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        {
          message: "Unknown API key scope",
          code: "INVALID_SCOPE",
          invalidScopes,
          allowedScopes: API_KEY_SCOPES,
        },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }

  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
    user.id,
    `${user.firstName}'s workspace`,
  );

  if (accountIds.length > 0) {
    const accounts = await Promise.all(
      accountIds.map((accountId) => AccountsRepository.findById(accountId)),
    );
    const hasInvalidAccount = accounts.some(
      (account: { userId: string } | null | undefined) => !account || account.userId !== user.id,
    );

    if (hasInvalidAccount) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json(
          {
            message: "One or more account IDs are invalid",
            code: "INVALID_ACCOUNT_ALLOWLIST",
          },
          StatusCodes.HTTP_400_BAD_REQUEST,
        ),
      });
    }
  }

  const generated = generateApiKey();
  const created = await ApiKeysRepository.create({
    workspaceId: workspace.id,
    createdByUserId: user.id,
    name,
    prefix: generated.prefix,
    keyHash: generated.keyHash,
    scopes,
    accountIds,
    environment: generated.prefix.includes("_live_") ? "live" : "test",
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  logger.audit("api key created via dashboard", {
    module: "api-keys",
    action: "handler:create",
    userId: user.id,
    workspaceId: workspace.id,
    apiKeyId: created.id,
  });

  await recordAuditEvent(c, {
    action: "api_key.created",
    resourceType: "api_key",
    resourceId: created.id,
    metadata: {
      scopes: created.scopes,
      accountIds: created.accountIds,
      environment: created.environment,
    },
  });

  return c.json(
    {
      message: "API key created successfully. Copy it now; it will not be shown again.",
      payload: {
        key: {
          id: created.id,
          name: created.name,
          prefix: created.prefix,
          scopes: created.scopes,
          accountIds: created.accountIds,
          environment: created.environment,
          lastUsedAt: null,
          expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
          createdAt: created.createdAt.toISOString(),
        },
        token: generated.token,
      },
    },
    StatusCodes.HTTP_201_CREATED,
  );
};

export const revokeApiKeyRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware, enforceSessionMiddleware],
  path: "/v1/api-keys/{id}",
  tags: ["API Keys"],
  summary: "Revoke an API key",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: {
      description: "API key revoked successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type RevokeApiKeyRoute = typeof revokeApiKeyRoute;

export const revokeApiKeyHandler: AppRouteHandler<RevokeApiKeyRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(user.id);
  const revoked = await ApiKeysRepository.revoke(id, workspace.id);

  if (!revoked) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "API key not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  await recordAuditEvent(c, {
    action: "api_key.revoked",
    resourceType: "api_key",
    resourceId: revoked.id,
    metadata: { name: revoked.name, prefix: revoked.prefix },
  });

  return c.json({ message: "API key revoked successfully" });
};

export const rotateApiKeyRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware, enforceSessionMiddleware],
  path: "/v1/api-keys/{id}/rotate",
  tags: ["API Keys"],
  summary: "Rotate an API key",
  description:
    "Creates a replacement key with the same scopes and revokes the old key immediately.",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    201: {
      description: "API key rotated successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              key: apiKeySummarySchema,
              token: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type RotateApiKeyRoute = typeof rotateApiKeyRoute;

export const rotateApiKeyHandler: AppRouteHandler<RotateApiKeyRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(user.id);
  const existing = await ApiKeysRepository.findById(id);

  if (!existing || existing.workspaceId !== workspace.id) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "API key not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  const generated = generateApiKey();
  const created = await ApiKeysRepository.create({
    workspaceId: existing.workspaceId,
    createdByUserId: user.id,
    name: existing.name,
    prefix: generated.prefix,
    keyHash: generated.keyHash,
    scopes: existing.scopes,
    accountIds: existing.accountIds,
    environment: existing.environment,
    expiresAt: existing.expiresAt,
  });

  await ApiKeysRepository.revoke(existing.id, workspace.id);

  await recordAuditEvent(c, {
    action: "api_key.rotated",
    resourceType: "api_key",
    resourceId: created.id,
    metadata: { replacedKeyId: existing.id, name: created.name },
  });

  return c.json(
    {
      message: "API key rotated successfully. Copy the new token now.",
      payload: {
        key: {
          id: created.id,
          name: created.name,
          prefix: created.prefix,
          scopes: created.scopes,
          accountIds: created.accountIds,
          environment: created.environment,
          lastUsedAt: null,
          expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
          createdAt: created.createdAt.toISOString(),
        },
        token: generated.token,
      },
    },
    StatusCodes.HTTP_201_CREATED,
  );
};

export const apiKeyRoutes = createRouter<AppBindings>();

apiKeyRoutes.openapi(listApiKeysRoute, listApiKeysHandler);
apiKeyRoutes.openapi(createApiKeyRoute, createApiKeyHandler);
apiKeyRoutes.openapi(revokeApiKeyRoute, revokeApiKeyHandler);
apiKeyRoutes.openapi(rotateApiKeyRoute, rotateApiKeyHandler);
