import { createRoute, z } from "@hono/zod-openapi";
import { errorResponseSchemas } from "@repo/shared";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { createSocialProviderRegistry } from "@/modules/provider-registry";
import { createRouter } from "@repo/shared";

const providerRegistry = createSocialProviderRegistry();

export const listPlatformsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/platforms",
  tags: ["Platforms"],
  summary: "List platform capabilities",
  description:
    "Returns the registered provider metadata, including capabilities and per-platform limits.",
  responses: {
    200: {
      description: "Platforms retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              platforms: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  websiteUrl: z.string(),
                  docsUrl: z.string(),
                  iconName: z.string(),
                  defaultScopes: z.array(z.string()),
                  capabilities: z.record(z.string(), z.unknown()),
                  limits: z.record(z.string(), z.unknown()),
                }),
              ),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListPlatformsRoute = typeof listPlatformsRoute;

export const listPlatformsHandler: AppRouteHandler<ListPlatformsRoute> = (c) => {
  const platforms = providerRegistry.getAllMetadata().map((metadata) => ({
    id: metadata.id,
    name: metadata.name,
    websiteUrl: metadata.websiteUrl,
    docsUrl: metadata.docsUrl,
    iconName: metadata.iconName,
    defaultScopes: metadata.defaultScopes,
    capabilities: metadata.capabilities as unknown as Record<string, unknown>,
    limits: metadata.limits as unknown as Record<string, unknown>,
  }));

  return c.json({
    message: "Platforms retrieved successfully",
    payload: { platforms },
  });
};

export const platformRoutes = createRouter<AppBindings>();

platformRoutes.openapi(listPlatformsRoute, listPlatformsHandler);
