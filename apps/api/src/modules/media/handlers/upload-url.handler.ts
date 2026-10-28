import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { MediaRepository, MediaTypeEnum } from "@repo/db";
import { R2StorageService } from "@repo/storage";
import { env } from "@/env";
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
            type: z.enum(MediaTypeEnum).default(MediaTypeEnum.IMAGE),
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

function r2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  );
}

export const getPresignedUrlHandler: AppRouteHandler<GetPresignedUrlRoute> = async (c) => {
  const { filename, mimeType, sizeBytes } = c.req.valid("json");
  const user = c.get("user");

  try {
    if (r2Configured()) {
      const storage = R2StorageService.fromEnv(process.env);
      const upload = await storage.createPresignedUploadUrl({
        userId: user.id,
        fileName: filename,
        contentType: mimeType,
        sizeBytes,
        folder: "vault",
        expiresInSec: 900,
      });

      return c.json({
        message: "Presigned URL generated successfully",
        payload: {
          uploadUrl: upload.uploadUrl,
          storageKey: upload.fileKey,
          publicUrl: upload.publicUrl,
          expiresInSeconds: upload.expiresInSec,
        },
      });
    }

    if (env.NODE_ENV === "production") {
      throw new HTTPException(StatusCodes.HTTP_503_SERVICE_UNAVAILABLE, {
        res: c.json(
          { message: "Media storage is not configured" },
          StatusCodes.HTTP_503_SERVICE_UNAVAILABLE,
        ),
      });
    }

    const extension = filename.split(".").pop() || "bin";
    const storageKey = `vault/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const publicUrl = `https://cdn.socioconnect.app/${storageKey}`;
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
            url: z.url(),
            thumbnailUrl: z.url().optional(),
            mimeType: z.string(),
            type: z.enum(MediaTypeEnum),
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
              mediaId: z.uuid(),
              url: z.string(),
              type: z.enum(MediaTypeEnum),
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
    if (!body.storageKey.startsWith(`vault/${user.id}/`)) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        res: c.json(
          { message: "Storage key does not belong to this user" },
          StatusCodes.HTTP_403_FORBIDDEN,
        ),
      });
    }

    let sizeBytes = body.sizeBytes;
    let mimeType = body.mimeType;

    if (r2Configured()) {
      const storage = R2StorageService.fromEnv(process.env);
      const metadata = await storage.getFileMetadata(body.storageKey);

      if (!metadata) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          res: c.json(
            { message: "Uploaded file was not found in storage" },
            StatusCodes.HTTP_400_BAD_REQUEST,
          ),
        });
      }

      sizeBytes = metadata.sizeBytes || body.sizeBytes;
      mimeType = metadata.contentType || body.mimeType;
    }

    const asset = await MediaRepository.create({
      userId: user.id,
      storageKey: body.storageKey,
      url: body.url,
      thumbnailUrl: body.thumbnailUrl || null,
      mimeType,
      type: body.type,
      sizeBytes,
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
