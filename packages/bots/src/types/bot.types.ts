import type { SocialPlatform } from "@repo/libraries";
import type { UniversalPostPayload, ValidationResult } from "@repo/libraries";

export type BotChannel = "telegram" | "whatsapp" | "discord";

export interface BotUserIdentity {
  channel: BotChannel;
  channelUserId: string;
  username?: string;
  displayName?: string;
  userId?: string; // Connected SocioConnect creator account ID
}

export interface BotInboundMessage {
  id: string;
  channel: BotChannel;
  sender: BotUserIdentity;
  text: string;
  mediaUrls?: string[];
  replyToMessageId?: string;
  timestamp: Date;
  rawPayload?: unknown;
}

export interface BotReplyButton {
  id: string;
  label: string;
  payload: string;
  style?: "primary" | "secondary" | "danger";
}

export interface BotOutboundReply {
  channel: BotChannel;
  recipientId: string;
  text: string;
  buttons?: BotReplyButton[];
  mediaUrl?: string;
  replyToMessageId?: string;
}

export type BotIntentType =
  | "CREATE_DRAFT"
  | "SCHEDULE_POST"
  | "PUBLISH_IMMEDIATE"
  | "CONFIRM_ACTION"
  | "CANCEL_ACTION"
  | "LIST_SCHEDULED"
  | "HELP"
  | "REJECTED_OUT_OF_SCOPE"
  | "REJECTED_SAFETY_VIOLATION";

export interface ExtractedPostDetails {
  title?: string;
  content: string;
  targetPlatforms: SocialPlatform[];
  tags: string[];
  mediaUrls: string[];
  linkUrl?: string;
  scheduledTimeIso?: string; // Parsed ISO timestamp if scheduling was requested
  rawScheduleText?: string;
}

export interface GuardrailDecision {
  allowed: boolean;
  reason?: string;
  safetyCategory?: "PROMPT_INJECTION" | "OUT_OF_SCOPE" | "HARMFUL_CONTENT" | "SENSITIVE_DATA";
  sanitizedInput?: string;
}

export interface AIExtractedIntent {
  intent: BotIntentType;
  confidence: number;
  extractedPost?: ExtractedPostDetails;
  replySuggestion: string;
  missingInformation?: string[];
}

export interface PendingPostAction {
  action: "PUBLISH" | "SCHEDULE";
  payload: UniversalPostPayload;
  targetPlatforms: SocialPlatform[];
  scheduledAt?: Date;
  validationResults?: Record<SocialPlatform, ValidationResult>;
}

export interface BotSession {
  sessionId: string;
  channel: BotChannel;
  channelUserId: string;
  creatorId?: string;
  currentStep:
    | "IDLE"
    | "AWAITING_POST_CONFIRMATION"
    | "AWAITING_PLATFORM_SELECTION"
    | "AWAITING_SCHEDULE_TIME";
  pendingAction?: PendingPostAction;
  recentMessages: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>;
  lastActiveAt: Date;
}
