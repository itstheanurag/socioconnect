import { z } from "zod";

export const CommunityGroupSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.string(),
  destinationIds: z.array(z.string()),
  staggerMinutes: z.number(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type CommunityGroupSummary = z.infer<typeof CommunityGroupSummarySchema>;

export const CreateCommunityGroupRequestSchema = z.object({
  accountId: z.string().uuid().or(z.string()),
  name: z.string().min(1, "Group name is required"),
  platform: z.string(),
  destinationIds: z.array(z.string()).min(1, "Select at least 1 destination"),
  staggerMinutes: z.number().min(0).max(120).optional().default(5),
  tags: z.array(z.string()).optional().default([]),
});
export type CreateCommunityGroupRequest = z.infer<typeof CreateCommunityGroupRequestSchema>;

export const CommunityAutomationSummarySchema = z.object({
  id: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  platform: z.string(),
  title: z.string(),
  scheduleType: z.string(),
  cronSchedule: z.string(),
  contentTemplate: z.string(),
  topicPool: z.array(z.string()),
  autoAdaptTone: z.boolean(),
  status: z.string(),
  totalRuns: z.number(),
  lastRunAt: z.string().nullable(),
  nextRunAt: z.string().nullable(),
  createdAt: z.string(),
});
export type CommunityAutomationSummary = z.infer<typeof CommunityAutomationSummarySchema>;

export const CreateCommunityAutomationRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  scheduleType: z.enum(["cron", "interval", "rotational_topic"]).optional().default("rotational_topic"),
  cronSchedule: z.string().optional().default("0 10 * * 1,3,5"),
  contentTemplate: z.string().min(1, "Template is required"),
  titleTemplate: z.string().optional(),
  topicPool: z.array(z.string()).optional().default([]),
  autoAdaptTone: z.boolean().optional().default(true),
});
export type CreateCommunityAutomationRequest = z.infer<typeof CreateCommunityAutomationRequestSchema>;
