import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const DEVTO_LIMITS: PlatformLimits = {
  maxCharacters: 100000,
  maxTitleCharacters: 128,
  maxMediaCount: 1, // Cover image
  maxImageSizeBytes: 10 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxTags: 4,
};

export const devtoPostSchema = universalPostSchema
  .extend({
    title: z
      .string()
      .min(1, "Dev.to articles require a title.")
      .max(
        DEVTO_LIMITS.maxTitleCharacters || 128,
        `Dev.to title exceeds maximum of ${DEVTO_LIMITS.maxTitleCharacters} characters.`,
      ),
    content: z.string().min(1, "Dev.to article requires markdown body content."),
    media: createMediaValidator({
      maxCount: DEVTO_LIMITS.maxMediaCount,
      allowedImageMimes: DEVTO_LIMITS.allowedImageMimeTypes,
      maxImageSizeBytes: DEVTO_LIMITS.maxImageSizeBytes,
      platformName: "Dev.to",
    }),
    tags: z
      .array(z.string())
      .max(
        DEVTO_LIMITS.maxTags || 4,
        `Dev.to allows a maximum of ${DEVTO_LIMITS.maxTags} tags per article.`,
      )
      .optional(),
  })
  .superRefine((data: { content?: string }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const charCount = countCodeUnits(text);
    if (charCount > DEVTO_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Dev.to body content exceeds maximum limit of ${DEVTO_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }
  });

export function validateDevToPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(devtoPostSchema, payload, DEVTO_LIMITS, "codeUnits");
}
