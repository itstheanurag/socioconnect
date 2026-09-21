import { z } from "zod";

export const ImageMimeTypeEnum = z.enum([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/svg+xml",
]);

export type ImageMimeType = z.infer<typeof ImageMimeTypeEnum>;

export const VideoMimeTypeEnum = z.enum([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
  "video/ogg",
]);

export type VideoMimeType = z.infer<typeof VideoMimeTypeEnum>;

export const AnyMediaMimeTypeEnum = z.union([ImageMimeTypeEnum, VideoMimeTypeEnum]);

export const mediaItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Media must have a valid HTTP/HTTPS URL"),
  type: z.enum(["image", "video", "gif"]),
  mimeType: z.string().min(1, "Media MIME type is required"),
  sizeBytes: z.number().int().positive("Size must be positive").optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().max(1000).optional(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.number().positive().optional(),
});

export type MediaItemSchemaType = z.infer<typeof mediaItemSchema>;

export function createMediaValidator(options: {
  maxCount: number;
  allowedImageMimes: string[];
  allowedVideoMimes?: string[];
  maxImageSizeBytes: number;
  maxVideoSizeBytes?: number;
  requireMedia?: boolean;
  requireImage?: boolean;
  requireVideo?: boolean;
  platformName: string;
}) {
  return z
    .array(mediaItemSchema)
    .optional()
    .superRefine((items, ctx) => {
      const mediaList = items || [];

      if (options.requireMedia && mediaList.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.platformName} requires at least one media item.`,
          path: [],
        });
        return;
      }

      if (options.requireImage && !mediaList.some((m) => m.type === "image" || m.type === "gif")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.platformName} requires an image to publish.`,
          path: [],
        });
      }

      if (options.requireVideo && !mediaList.some((m) => m.type === "video")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.platformName} requires a video to publish.`,
          path: [],
        });
      }

      if (mediaList.length > options.maxCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.platformName} allows maximum ${options.maxCount} media items (provided ${mediaList.length}).`,
          path: [],
        });
      }

      mediaList.forEach((item, idx) => {
        const mime = item.mimeType.toLowerCase();

        if (item.type === "image" || item.type === "gif") {
          if (options.allowedImageMimes.length > 0 && !options.allowedImageMimes.includes(mime)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Image format '${item.mimeType}' is not supported by ${options.platformName}. Allowed: ${options.allowedImageMimes.join(", ")}`,
              path: [idx, "mimeType"],
            });
          }

          if (item.sizeBytes && item.sizeBytes > options.maxImageSizeBytes) {
            const maxMb = (options.maxImageSizeBytes / (1024 * 1024)).toFixed(1);
            const actualMb = (item.sizeBytes / (1024 * 1024)).toFixed(1);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Image size (${actualMb} MB) exceeds ${options.platformName} maximum of ${maxMb} MB.`,
              path: [idx, "sizeBytes"],
            });
          }
        } else if (item.type === "video") {
          if (
            options.allowedVideoMimes &&
            options.allowedVideoMimes.length > 0 &&
            !options.allowedVideoMimes.includes(mime)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Video format '${item.mimeType}' is not supported by ${options.platformName}. Allowed: ${options.allowedVideoMimes.join(", ")}`,
              path: [idx, "mimeType"],
            });
          }

          if (
            options.maxVideoSizeBytes &&
            item.sizeBytes &&
            item.sizeBytes > options.maxVideoSizeBytes
          ) {
            const maxMb = (options.maxVideoSizeBytes / (1024 * 1024)).toFixed(1);
            const actualMb = (item.sizeBytes / (1024 * 1024)).toFixed(1);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Video size (${actualMb} MB) exceeds ${options.platformName} maximum of ${maxMb} MB.`,
              path: [idx, "sizeBytes"],
            });
          }
        }
      });
    });
}
