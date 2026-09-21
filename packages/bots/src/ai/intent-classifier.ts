import { z } from "zod";
import type { AIExtractedIntent, BotSession } from "@/types/bot.types";
import type { SocialPlatform } from "@repo/libraries";
import { BotInputGuardrails } from "./guardrails";
import { LightAIClient } from "./ai-client";
import { BOT_SYSTEM_PROMPT, buildIntentUserPrompt } from "./prompts";

const extractedPostDetailsSchema = z.object({
  title: z.string().nullable().optional(),
  content: z.string().default(""),
  targetPlatforms: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string()).default([]),
  linkUrl: z.string().nullable().optional(),
  scheduledTimeIso: z.string().nullable().optional(),
  rawScheduleText: z.string().nullable().optional(),
});

const aiIntentOutputSchema = z.object({
  intent: z.enum([
    "CREATE_DRAFT",
    "SCHEDULE_POST",
    "PUBLISH_IMMEDIATE",
    "CONFIRM_ACTION",
    "CANCEL_ACTION",
    "LIST_SCHEDULED",
    "HELP",
    "REJECTED_OUT_OF_SCOPE",
  ]),
  confidence: z.number().min(0).max(1).default(0.9),
  extractedPost: extractedPostDetailsSchema.optional(),
  replySuggestion: z.string().default(""),
  missingInformation: z.array(z.string()).optional(),
});

const VALID_PLATFORMS: SocialPlatform[] = [
  "bluesky",
  "dribbble",
  "devto",
  "medium",
  "youtube",
  "instagram",
  "discord",
  "reddit",
  "linkedin",
  "pinterest",
  "facebook",
];

export class BotIntentClassifier {
  private guardrails: BotInputGuardrails;
  private aiClient: LightAIClient;

  constructor(aiClient?: LightAIClient) {
    this.guardrails = new BotInputGuardrails();
    this.aiClient = aiClient || new LightAIClient();
  }

  public async classifyMessage(rawText: string, session?: BotSession): Promise<AIExtractedIntent> {
    // 1. Strict guardrail evaluation
    const guardrailResult = this.guardrails.evaluate(rawText);
    if (!guardrailResult.allowed) {
      return {
        intent:
          guardrailResult.safetyCategory === "PROMPT_INJECTION"
            ? "REJECTED_SAFETY_VIOLATION"
            : "REJECTED_OUT_OF_SCOPE",
        confidence: 1.0,
        replySuggestion:
          guardrailResult.reason ||
          "i can only assist with creating and scheduling social media posts.",
      };
    }

    const sanitizedText = guardrailResult.sanitizedInput || rawText;

    // Fast-path for single-word confirmations/cancellations
    const lower = sanitizedText.toLowerCase().trim();
    if (
      [
        "yes",
        "y",
        "confirm",
        "schedule it",
        "post it",
        "looks good",
        "send it",
        "publish",
      ].includes(lower)
    ) {
      return {
        intent: "CONFIRM_ACTION",
        confidence: 0.99,
        replySuggestion: "confirming your post action now.",
      };
    }
    if (["no", "n", "cancel", "stop", "nevermind", "abort", "discard"].includes(lower)) {
      return {
        intent: "CANCEL_ACTION",
        confidence: 0.99,
        replySuggestion: "action cancelled. what else would you like to create?",
      };
    }
    if (["help", "/help", "what can you do", "commands"].includes(lower)) {
      return {
        intent: "HELP",
        confidence: 0.99,
        replySuggestion:
          "you can send me post drafts, links, or instructions like: 'schedule a post for tomorrow 5pm on linkedin and bluesky: launching our new product!'",
      };
    }

    // 2. AI Model Execution
    const userPrompt = buildIntentUserPrompt(sanitizedText, {
      currentStep: session?.currentStep,
      hasPendingAction: Boolean(session?.pendingAction),
      nowIso: new Date().toISOString(),
    });

    try {
      const rawAiResponse = await this.aiClient.generateStructuredCompletion<unknown>(
        BOT_SYSTEM_PROMPT,
        userPrompt,
      );

      const parsed = aiIntentOutputSchema.parse(rawAiResponse);

      // Filter extracted platforms to valid platforms only
      let extractedPlatforms: SocialPlatform[] = [];
      if (parsed.extractedPost?.targetPlatforms) {
        extractedPlatforms = parsed.extractedPost.targetPlatforms
          .map((p) => p.toLowerCase() as SocialPlatform)
          .filter((p) => VALID_PLATFORMS.includes(p));
      }

      return {
        intent: parsed.intent,
        confidence: parsed.confidence,
        extractedPost: parsed.extractedPost
          ? {
              title: parsed.extractedPost.title || undefined,
              content: parsed.extractedPost.content,
              targetPlatforms: extractedPlatforms,
              tags: parsed.extractedPost.tags || [],
              mediaUrls: parsed.extractedPost.mediaUrls || [],
              linkUrl: parsed.extractedPost.linkUrl || undefined,
              scheduledTimeIso: parsed.extractedPost.scheduledTimeIso || undefined,
              rawScheduleText: parsed.extractedPost.rawScheduleText || undefined,
            }
          : undefined,
        replySuggestion: parsed.replySuggestion,
        missingInformation: parsed.missingInformation,
      };
    } catch (err) {
      // In case AI is unreachable or response fails parsing
      return {
        intent: "CREATE_DRAFT",
        confidence: 0.5,
        extractedPost: {
          content: sanitizedText,
          targetPlatforms: [],
          tags: [],
          mediaUrls: [],
        },
        replySuggestion: "draft received. which platforms would you like to target?",
        missingInformation: ["targetPlatforms"],
      };
    }
  }
}
