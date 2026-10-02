import { z } from "zod";
import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult } from "@/types/post.types";
import { buildZodValidationResult } from "@/schemas/post.schema";

export const TWITTER_LIMITS: PlatformLimits = {
  maxCharacters: 280,
  maxMediaCount: 4,
  maxImageSizeBytes: 5 * 1024 * 1024, // 5MB
  maxVideoSizeBytes: 512 * 1024 * 1024, // 512MB
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export const twitterPostSchema = z
  .object({
    content: z
      .string()
      .min(1, "Post content cannot be empty unless media is attached")
      .or(z.string().max(0)),
    media: z
      .array(
        z.object({
          url: z.string().url("Invalid media URL"),
          type: z.enum(["image", "video", "gif"]),
          mimeType: z.string(),
        }),
      )
      .max(4, "Twitter allows up to 4 images or 1 video")
      .optional(),
    platformOptions: z
      .object({
        replyToTweetId: z.string().optional(),
        quoteTweetId: z.string().optional(),
        pollOptions: z.array(z.string().max(25, "Poll option max 25 chars")).min(2).max(4).optional(),
        pollDurationMinutes: z.number().min(5).max(10080).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasText = data.content && data.content.trim().length > 0;
    const hasMedia = data.media && data.media.length > 0;
    const hasPoll = data.platformOptions?.pollOptions && data.platformOptions.pollOptions.length > 0;

    if (!hasText && !hasMedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Twitter posts require either text or media attachments",
      });
    }

    if (data.media && data.media.length > 0) {
      const videoCount = data.media.filter((m) => m.type === "video").length;
      const imageCount = data.media.filter((m) => m.type === "image" || m.type === "gif").length;

      if (videoCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["media"],
          message: "Twitter only allows a maximum of 1 video per tweet",
        });
      }

      if (videoCount > 0 && imageCount > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["media"],
          message: "Cannot mix video and images in a single tweet",
        });
      }

      if (hasPoll) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platformOptions", "pollOptions"],
          message: "Cannot include media and a poll in the same tweet",
        });
      }
    }
  });

export function validateTwitterPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(twitterPostSchema, payload, TWITTER_LIMITS, "codeUnits");
}
