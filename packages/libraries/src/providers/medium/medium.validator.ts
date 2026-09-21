import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const MEDIUM_LIMITS: PlatformLimits = {
  maxCharacters: 100000,
  maxTitleCharacters: 100,
  maxMediaCount: 0,
  maxImageSizeBytes: 10 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  maxTags: 5,
};

export const mediumPostSchema = universalPostSchema
  .extend({
    title: z
      .string()
      .min(1, "Medium stories require a title.")
      .max(
        MEDIUM_LIMITS.maxTitleCharacters || 100,
        `Medium title exceeds maximum of ${MEDIUM_LIMITS.maxTitleCharacters} characters.`,
      ),
    content: z.string().min(1, "Medium story requires story body content."),
    tags: z
      .array(z.string())
      .max(
        MEDIUM_LIMITS.maxTags || 5,
        `Medium allows maximum ${MEDIUM_LIMITS.maxTags} tags per story.`,
      )
      .optional(),
  })
  .superRefine((data: { content?: string }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const charCount = countCodeUnits(text);
    if (charCount > MEDIUM_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Medium story body exceeds limit of ${MEDIUM_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }
  });

export function validateMediumPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(mediumPostSchema, payload, MEDIUM_LIMITS, "codeUnits");
}
