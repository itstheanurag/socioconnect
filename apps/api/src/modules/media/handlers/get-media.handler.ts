import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { MediaRepository, MediaTypeEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. List Media Assets
export const getMediaRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/media",
  tags: ["Media Vault"],
  summary: "List creator media assets",
  description: "Retrieves uploaded media vault images, videos, and thumbnails",
  request: {
    query: z.object({
      type: z.nativeEnum(MediaTypeEnum).optional(),
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(24),
    }),
  },
  responses: {
    200: {
      description: "Media assets retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              media: z.array(
                z.object({
                  id: z.string().uuid(),
                  storageKey: z.string(),
                  url: z.string(),
                  thumbnailUrl: z.string().nullable(),
                  mimeType: z.string(),
                  type: z.enum(MediaTypeEnum),
                  sizeBytes: z.number().nullable(),
                  width: z.number().nullable(),
                  height: z.number().nullable(),
                  durationSeconds: z.number().nullable(),
                  createdAt: z.string(),
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

export type GetMediaRoute = typeof getMediaRoute;

export const getMediaHandler: AppRouteHandler<GetMediaRoute> = async (c) => {
  const { type, page, limit } = c.req.valid("query");
  const user = c.get("user");

  try {
    const rawMedia = await MediaRepository.findAllByUserId(user.id, {
      type,
      limit,
      offset: (page - 1) * limit,
    });

    const media = rawMedia.map((m) => ({
      id: m.id,
      storageKey: m.storageKey,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      mimeType: m.mimeType,
      type: m.type as MediaTypeEnum,
      sizeBytes: m.sizeBytes,
      width: m.width,
      height: m.height,
      durationSeconds: m.durationSeconds,
      createdAt: m.createdAt.toISOString(),
    }));

    return c.json({
      message: "Media assets retrieved successfully",
      payload: { media },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving media assets", {
      module: "media",
      action: "getMediaHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Delete Media Asset
export const deleteMediaRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/media/:id",
  tags: ["Media Vault"],
  summary: "Delete media asset",
  description: "Removes asset from creator vault and reclaims storage quota",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Media asset deleted successfully",
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

export type DeleteMediaRoute = typeof deleteMediaRoute;

export const deleteMediaHandler: AppRouteHandler<DeleteMediaRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const success = await MediaRepository.deleteAsset(id, user.id);

    if (!success) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Media asset not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    return c.json({
      message: "Media asset deleted successfully",
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error deleting media asset", {
      module: "media",
      action: "deleteMediaHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
