import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const LINKEDIN_LIMITS: PlatformLimits = {
  maxCharacters: 3000,
  maxTitleCharacters: 200,
  maxMediaCount: 9,
  maxImageSizeBytes: 10 * 1024 * 1024,
  maxVideoSizeBytes: 200 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 20,
};

export const linkedinPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: LINKEDIN_LIMITS.maxMediaCount,
      allowedImageMimes: LINKEDIN_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: LINKEDIN_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: LINKEDIN_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: LINKEDIN_LIMITS.maxVideoSizeBytes,
      platformName: "LinkedIn",
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
          message: "LinkedIn posts require either text commentary, an attachment/media, or a link.",
          path: ["content"],
        });
      }

      const charCount = countCodeUnits(text);
      if (charCount > LINKEDIN_LIMITS.maxCharacters) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `LinkedIn post exceeds maximum limit of ${LINKEDIN_LIMITS.maxCharacters} characters.`,
          path: ["content"],
        });
      }
    },
  );

export function validateLinkedInPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(linkedinPostSchema, payload, LINKEDIN_LIMITS, "codeUnits");
}
