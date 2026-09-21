import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const REDDIT_LIMITS: PlatformLimits = {
  maxCharacters: 40000,
  maxTitleCharacters: 300,
  maxMediaCount: 1,
  maxImageSizeBytes: 20 * 1024 * 1024,
  maxVideoSizeBytes: 100 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export const redditPostSchema = universalPostSchema
  .extend({
    title: z
      .string()
      .min(1, "Reddit posts require a post title.")
      .max(
        REDDIT_LIMITS.maxTitleCharacters || 300,
        `Reddit title exceeds maximum of ${REDDIT_LIMITS.maxTitleCharacters} characters.`,
      ),
    media: createMediaValidator({
      maxCount: REDDIT_LIMITS.maxMediaCount,
      allowedImageMimes: REDDIT_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: REDDIT_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: REDDIT_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: REDDIT_LIMITS.maxVideoSizeBytes,
      platformName: "Reddit",
    }),
  })
  .superRefine(
    (
      data: { platformOptions?: { subreddit?: string }; content?: string },
      ctx: z.RefinementCtx,
    ) => {
      const subreddit = data.platformOptions?.subreddit;
      if (!subreddit || !subreddit.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reddit posts require a target subreddit (e.g. 'webdev' or 'sideproject').",
          path: ["platformOptions", "subreddit"],
        });
      }

      const text = data.content || "";
      const charCount = countCodeUnits(text);
      if (charCount > REDDIT_LIMITS.maxCharacters) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Reddit body text exceeds maximum of ${REDDIT_LIMITS.maxCharacters} characters.`,
          path: ["content"],
        });
      }
    },
  );

export function validateRedditPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(redditPostSchema, payload, REDDIT_LIMITS, "codeUnits");
}
