import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const YOUTUBE_LIMITS: PlatformLimits = {
  maxCharacters: 5000,
  maxTitleCharacters: 100,
  maxMediaCount: 1, // Video file
  maxImageSizeBytes: 5 * 1024 * 1024, // Thumbnail size
  maxVideoSizeBytes: 256 * 1024 * 1024 * 1024, // 256GB
  allowedImageMimeTypes: ["image/jpeg", "image/png"],
  allowedVideoMimeTypes: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
  ],
  maxTags: 50,
};

export const youtubePostSchema = universalPostSchema
  .extend({
    title: z
      .string()
      .min(1, "YouTube uploads require a video title.")
      .max(
        YOUTUBE_LIMITS.maxTitleCharacters || 100,
        `YouTube title exceeds maximum of ${YOUTUBE_LIMITS.maxTitleCharacters} characters.`,
      ),
    media: createMediaValidator({
      maxCount: YOUTUBE_LIMITS.maxMediaCount,
      allowedImageMimes: YOUTUBE_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: YOUTUBE_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: YOUTUBE_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: YOUTUBE_LIMITS.maxVideoSizeBytes,
      platformName: "YouTube",
    }),
    tags: z
      .array(z.string())
      .max(YOUTUBE_LIMITS.maxTags || 50, `YouTube allows maximum ${YOUTUBE_LIMITS.maxTags} tags.`)
      .optional(),
  })
  .superRefine((data: { content?: string; tags?: string[] }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const charCount = countCodeUnits(text);
    if (charCount > YOUTUBE_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `YouTube description exceeds maximum of ${YOUTUBE_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }

    if (data.tags && data.tags.length > 0) {
      const totalTagLength = data.tags.reduce((acc: number, t: string) => acc + t.length, 0);
      if (totalTagLength > 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total YouTube tags length exceeds 500 characters.",
          path: ["tags"],
        });
      }
    }
  });

export function validateYouTubePost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(youtubePostSchema, payload, YOUTUBE_LIMITS, "codeUnits");
}
