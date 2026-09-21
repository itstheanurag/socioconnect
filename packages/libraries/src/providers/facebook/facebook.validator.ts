import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const FACEBOOK_LIMITS: PlatformLimits = {
  maxCharacters: 63206,
  maxMediaCount: 10,
  maxImageSizeBytes: 10 * 1024 * 1024,
  maxVideoSizeBytes: 1024 * 1024 * 1024, // 1GB
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export const facebookPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: FACEBOOK_LIMITS.maxMediaCount,
      allowedImageMimes: FACEBOOK_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: FACEBOOK_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: FACEBOOK_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: FACEBOOK_LIMITS.maxVideoSizeBytes,
      platformName: "Facebook",
    }),
  })
  .superRefine(
    (data: { content?: string; media?: unknown[]; linkUrl?: string }, ctx: z.RefinementCtx) => {
      const text = data.content || "";
      const media = data.media || [];
      const link = data.linkUrl || "";

      if (!text.trim() && media.length === 0 && !link.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Facebook post requires either text message, an image/video, or a link.",
          path: ["content"],
        });
      }

      const charCount = countCodeUnits(text);
      if (charCount > FACEBOOK_LIMITS.maxCharacters) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Facebook post content exceeds maximum limit of ${FACEBOOK_LIMITS.maxCharacters} characters.`,
          path: ["content"],
        });
      }
    },
  );

export function validateFacebookPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(facebookPostSchema, payload, FACEBOOK_LIMITS, "codeUnits");
}
