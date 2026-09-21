import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const PINTEREST_LIMITS: PlatformLimits = {
  maxCharacters: 500, // Description max length
  maxTitleCharacters: 100, // Pin title max length
  maxMediaCount: 1, // 1 primary pin image
  maxImageSizeBytes: 20 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png"],
  maxTags: 0,
};

export const pinterestPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: PINTEREST_LIMITS.maxMediaCount,
      allowedImageMimes: PINTEREST_LIMITS.allowedImageMimeTypes,
      maxImageSizeBytes: PINTEREST_LIMITS.maxImageSizeBytes,
      requireImage: true,
      platformName: "Pinterest",
    }),
  })
  .superRefine(
    (
      data: { platformOptions?: { boardId?: string }; title?: string; content?: string },
      ctx: z.RefinementCtx,
    ) => {
      const boardId = data.platformOptions?.boardId;
      if (!boardId || !boardId.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pinterest pins require a target boardId in platformOptions.",
          path: ["platformOptions", "boardId"],
        });
      }

      if (data.title && countCodeUnits(data.title) > (PINTEREST_LIMITS.maxTitleCharacters || 100)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Pinterest title exceeds maximum of ${PINTEREST_LIMITS.maxTitleCharacters} characters.`,
          path: ["title"],
        });
      }

      const text = data.content || "";
      const charCount = countCodeUnits(text);
      if (charCount > PINTEREST_LIMITS.maxCharacters) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Pinterest description exceeds limit of ${PINTEREST_LIMITS.maxCharacters} characters.`,
          path: ["content"],
        });
      }
    },
  );

export function validatePinterestPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(pinterestPostSchema, payload, PINTEREST_LIMITS, "codeUnits");
}
