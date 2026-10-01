import { z } from "zod";

export const TelegramBotSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Bot name must be at least 2 characters"),
  username: z.string(),
  tokenMasked: z.string(),
  status: z.enum(["active", "paused", "error"]).default("active"),
  communityIds: z.array(z.string()).default([]),
  commandsCount: z.number().default(4),
  scheduledQueueCount: z.number().default(0),
  webhookStatus: z.enum(["healthy", "delayed", "inactive"]).default("healthy"),
  lastActive: z.string().default("Just now"),
});
export type TelegramBot = z.infer<typeof TelegramBotSchema>;

export const CreateTelegramBotInputSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  username: z.string().min(3, "Username is required"),
  tokenMasked: z.string().optional(),
  status: z.enum(["active", "paused", "error"]).default("active"),
  communityIds: z.array(z.string()).default([]),
  commandsCount: z.number().default(4),
  webhookStatus: z.enum(["healthy", "delayed", "inactive"]).default("healthy"),
});
export type CreateTelegramBotInput = z.infer<typeof CreateTelegramBotInputSchema>;
