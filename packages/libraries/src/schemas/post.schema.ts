import { z } from "zod";
import { countGraphemes, countCodeUnits } from "../utils/text-counter";
import { mediaItemSchema } from "./media.schema";
import type { ValidationResult, ValidationError, UniversalPostPayload } from "../types/post.types";
import type { PlatformLimits } from "../types/provider.types";

export const platformOptionsSchema = z.object({
  subreddit: z.string().optional(),
  flairId: z.string().optional(),
  isNsfw: z.boolean().optional(),
  isSpoiler: z.boolean().optional(),
  boardId: z.string().optional(),
  pinLink: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  series: z.string().optional(),
  publishStatus: z.enum(["public", "draft", "unlisted"]).optional(),
  channelId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  privacyStatus: z.enum(["public", "private", "unlisted"]).optional(),
  madeForKids: z.boolean().optional(),
  teamId: z.string().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL", "REELS", "STORIES"]).optional(),
  langs: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "CONNECTIONS"]).optional(),
  pageId: z.string().optional(),
});

export const universalPostSchema = z.object({
  content: z.string().default(""),
  title: z.string().optional(),
  media: z.array(mediaItemSchema).optional(),
  tags: z.array(z.string()).optional(),
  linkUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  scheduledAt: z.date().optional(),
  idempotencyKey: z.string().optional(),
  platformOptions: platformOptionsSchema.optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export function buildZodValidationResult(
  schema: z.ZodTypeAny,
  payload: UniversalPostPayload,
  limits: PlatformLimits,
  charCountingMode: "graphemes" | "codeUnits" = "codeUnits",
): ValidationResult {
  const parseResult = schema.safeParse(payload);
  const text = payload.content || "";
  const charCount = charCountingMode === "graphemes" ? countGraphemes(text) : countCodeUnits(text);
  const maxChars = limits.maxCharacters;

  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!parseResult.success) {
    parseResult.error.issues.forEach((issue) => {
      const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "general";
      errors.push({
        field: fieldPath,
        message: issue.message,
        code: issue.code,
        critical: true,
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: maxChars,
    remainingCharacters: Math.max(0, maxChars - charCount),
  };
}
