import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const DRIBBBLE_LIMITS: PlatformLimits = {
  maxCharacters: 3000,
  maxTitleCharacters: 255,
  maxMediaCount: 1,
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedImageMimeTypes: ["image/png", "image/jpeg", "image/gif"],
  maxTags: 12,
};

export const dribbblePostSchema = universalPostSchema
  .extend({
    title: z
      .string()
      .min(1, "Dribbble shots require a title.")
      .max(
        DRIBBBLE_LIMITS.maxTitleCharacters || 255,
        `Dribbble title exceeds maximum of ${DRIBBBLE_LIMITS.maxTitleCharacters} characters.`,
      ),
    media: createMediaValidator({
      maxCount: DRIBBBLE_LIMITS.maxMediaCount,
      allowedImageMimes: DRIBBBLE_LIMITS.allowedImageMimeTypes,
      maxImageSizeBytes: DRIBBBLE_LIMITS.maxImageSizeBytes,
      requireImage: true,
      platformName: "Dribbble",
    }),
    tags: z
      .array(z.string())
      .max(
        DRIBBBLE_LIMITS.maxTags || 12,
        `Dribbble allows maximum ${DRIBBBLE_LIMITS.maxTags} tags per shot.`,
      )
      .optional(),
  })
  .superRefine((data: { content?: string }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const charCount = countCodeUnits(text);
    if (charCount > DRIBBBLE_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Dribbble description exceeds limit of ${DRIBBBLE_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }
  });

export function validateDribbblePost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(dribbblePostSchema, payload, DRIBBBLE_LIMITS, "codeUnits");
}
