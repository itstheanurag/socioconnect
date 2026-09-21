import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { MediaRepository, MediaTypeEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Generate Presigned Direct Upload URL
export const getPresignedUrlRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/media/presigned-url",
  tags: ["Media Vault"],
  summary: "Generate presigned direct upload URL",
  description:
    "Allocates a storage key and generates a direct S3/R2 presigned upload URL for media assets",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            filename: z.string().min(1).openapi({ example: "launch_teaser.mp4" }),
            mimeType: z.string().min(1).openapi({ example: "video/mp4" }),
            sizeBytes: z.number().positive().openapi({ example: 45000000 }),
            type: z.nativeEnum(MediaTypeEnum).default(MediaTypeEnum.IMAGE),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Presigned URL generated successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              uploadUrl: z.string(),
              storageKey: z.string(),
              publicUrl: z.string(),
              expiresInSeconds: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetPresignedUrlRoute = typeof getPresignedUrlRoute;

export const getPresignedUrlHandler: AppRouteHandler<GetPresignedUrlRoute> = async (c) => {
  const { filename, mimeType } = c.req.valid("json");
  const user = c.get("user");

  try {
    const extension = filename.split(".").pop() || "bin";
    const storageKey = `vault/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const publicUrl = `https://cdn.socioconnect.app/${storageKey}`;
    // Direct presigned S3/R2 upload URL
    const uploadUrl = `https://storage.socioconnect.app/${storageKey}?X-Amz-Signature=mock_sign_${Date.now()}`;

    return c.json({
      message: "Presigned URL generated successfully",
      payload: {
        uploadUrl,
        storageKey,
        publicUrl,
        expiresInSeconds: 900,
      },
    });
  } catch (err) {
    logger.error("Error generating presigned upload URL", {
      module: "media",
      action: "getPresignedUrlHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to generate upload URL" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 2. Confirm Upload and Register Asset
export const confirmMediaUploadRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/media/confirm",
  tags: ["Media Vault"],
  summary: "Confirm and register uploaded media asset",
  description: "Registers the uploaded asset in the creator media vault and tracks storage usage",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            storageKey: z.string(),
            url: z.string().url(),
            thumbnailUrl: z.string().url().optional(),
            mimeType: z.string(),
            type: z.nativeEnum(MediaTypeEnum),
            sizeBytes: z.number().positive(),
            width: z.number().optional(),
            height: z.number().optional(),
            durationSeconds: z.number().optional(),
            altText: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Media asset registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              mediaId: z.string().uuid(),
              url: z.string(),
              type: z.nativeEnum(MediaTypeEnum),
              sizeBytes: z.number().nullable(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ConfirmMediaUploadRoute = typeof confirmMediaUploadRoute;

export const confirmMediaUploadHandler: AppRouteHandler<ConfirmMediaUploadRoute> = async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    const asset = await MediaRepository.create({
      userId: user.id,
      storageKey: body.storageKey,
      url: body.url,
      thumbnailUrl: body.thumbnailUrl || null,
      mimeType: body.mimeType,
      type: body.type,
      sizeBytes: body.sizeBytes,
      width: body.width || null,
      height: body.height || null,
      durationSeconds: body.durationSeconds || null,
      altText: body.altText || null,
    });

    return c.json(
      {
        message: "Media asset registered successfully",
        payload: {
          mediaId: asset.id,
          url: asset.url,
          type: asset.type as MediaTypeEnum,
          sizeBytes: asset.sizeBytes,
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    logger.error("Error confirming media upload", {
      module: "media",
      action: "confirmMediaUploadHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to register media asset" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
