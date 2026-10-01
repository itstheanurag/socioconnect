import { z } from "zod";
import { PlatformIdSchema } from "./platforms.dto";

export const AutomationRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Automation rule name is required"),
  description: z.string().default(""),
  sourceType: z.enum(["post_published", "reddit_new", "rss_feed", "scheduled_trigger"]),
  sourcePlatform: PlatformIdSchema.optional(),
  sourceTarget: z.string().optional(),
  actionType: z.enum(["cross_post", "telegram_notify", "summary_generate", "archive"]),
  targetPlatform: PlatformIdSchema.optional(),
  targetDestination: z.string().optional(),
  status: z.enum(["active", "paused"]).default("active"),
  executionsCount: z.number().default(0),
  lastExecutedAt: z.string().optional(),
});
export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

export const CreateAutomationRuleInputSchema = AutomationRuleSchema.omit({
  id: true,
  executionsCount: true,
});
export type CreateAutomationRuleInput = z.infer<typeof CreateAutomationRuleInputSchema>;
