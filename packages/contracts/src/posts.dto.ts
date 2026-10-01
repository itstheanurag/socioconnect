import { z } from "zod";
import { PlatformIdSchema } from "./platforms.dto";

export const DispatchStatusSchema = z.enum([
  "pending",
  "queued",
  "in_progress",
  "published",
  "failed",
  "retrying",
  "cancelled",
]);
export type DispatchStatus = z.infer<typeof DispatchStatusSchema>;

export const PostStatusSchema = z.enum([
  "draft",
  "scheduled",
  "publishing",
  "published",
  "partially_published",
  "failed",
  "cancelled",
]);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const TimingStrategySchema = z.enum(["simultaneous", "staggered", "manual"]);
export type TimingStrategy = z.infer<typeof TimingStrategySchema>;

export const PostMediaSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video", "audio"]),
  url: z.string().url(),
  name: z.string(),
  sizeMb: z.number(),
  aspectRatio: z.string().optional(),
  durationSec: z.number().optional(),
});
export type PostMedia = z.infer<typeof PostMediaSchema>;

export const PlatformOverrideSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().optional(),
  caption: z.string().optional(),
  customHashtags: z.array(z.string()).optional(),
  subreddit: z.string().optional(),
  flair: z.string().optional(),
  firstComment: z.string().optional(),
  silentBroadcast: z.boolean().optional(),
});
export type PlatformOverride = z.infer<typeof PlatformOverrideSchema>;

export const PostItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  baseContent: z.string(),
  media: z.array(PostMediaSchema).default([]),
  hasAudio: z.boolean().default(false),
  targetPlatforms: z.array(PlatformIdSchema).min(1, "Select at least one destination platform"),
  communityIds: z.array(z.string()).default([]),
  platformOverrides: z.record(z.string(), PlatformOverrideSchema).optional().default({}),
  status: z.enum(["draft", "scheduled", "published", "failed"]).default("draft"),
  scheduledFor: z.string().optional(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
  metrics: z
    .object({
      views: z.number().default(0),
      likes: z.number().default(0),
      shares: z.number().default(0),
      comments: z.number().default(0),
    })
    .optional(),
  failureReason: z.string().optional(),
});
export type PostItem = z.infer<typeof PostItemSchema>;

export const CreatePostInputSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  baseContent: z.string(),
  media: z.array(PostMediaSchema).default([]),
  hasAudio: z.boolean().default(false),
  targetPlatforms: z.array(PlatformIdSchema).min(1, "Select at least one destination platform"),
  communityIds: z.array(z.string()).default([]),
  platformOverrides: z.record(z.string(), PlatformOverrideSchema).optional(),
  status: z.enum(["draft", "scheduled", "published", "failed"]).default("draft"),
  scheduledFor: z.string().optional(),
  publishedAt: z.string().optional(),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

export const CreateDispatchItemSchema = z.object({
  accountId: z.string().uuid().or(z.string()),
  destinationId: z.string().uuid().or(z.string()).optional(),
  platform: z.string(),
  customTitle: z.string().optional(),
  customContent: z.string().optional(),
  scheduledFor: z.string().datetime().or(z.string()).optional(),
});
export type CreateDispatchItem = z.infer<typeof CreateDispatchItemSchema>;

export const CreatePostRequestSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Post content cannot be empty"),
  mediaUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  timingStrategy: TimingStrategySchema.optional(),
  scheduledAt: z.string().datetime().or(z.string()).optional(),
  dispatches: z.array(CreateDispatchItemSchema).min(1, "Select at least one channel destination"),
});
export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

export const PostDispatchSummarySchema = z.object({
  id: z.string(),
  platform: z.string(),
  status: DispatchStatusSchema,
  scheduledFor: z.string().nullable(),
  publishedAt: z.string().nullable(),
  permalink: z.string().optional(),
  errorMessage: z.string().optional(),
});
export type PostDispatchSummary = z.infer<typeof PostDispatchSummarySchema>;

export const PostSummarySchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string(),
  tags: z.array(z.string()),
  status: PostStatusSchema,
  scheduledAt: z.string().nullable(),
  dispatches: z.array(PostDispatchSummarySchema),
  createdAt: z.string(),
});
export type PostSummary = z.infer<typeof PostSummarySchema>;
