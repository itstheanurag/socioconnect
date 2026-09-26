import { z } from "zod";

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
