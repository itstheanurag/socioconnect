import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { countGraphemes } from "../../utils/text-counter";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";

export const BLUESKY_LIMITS: PlatformLimits = {
  maxCharacters: 300,
  maxMediaCount: 4,
  maxImageSizeBytes: 1000000,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxTags: 8,
};

export const blueskyPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: BLUESKY_LIMITS.maxMediaCount,
      allowedImageMimes: BLUESKY_LIMITS.allowedImageMimeTypes,
      maxImageSizeBytes: BLUESKY_LIMITS.maxImageSizeBytes,
      platformName: "Bluesky",
    }),
  })
  .superRefine((data: { content?: string }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const graphemeCount = countGraphemes(text);

    if (graphemeCount > BLUESKY_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Bluesky post exceeds maximum limit of ${BLUESKY_LIMITS.maxCharacters} graphemes (current: ${graphemeCount}).`,
        path: ["content"],
      });
    }

    if (graphemeCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bluesky post content cannot be empty.",
        path: ["content"],
      });
    }
  });

export function validateBlueskyPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(blueskyPostSchema, payload, BLUESKY_LIMITS, "graphemes");
}
