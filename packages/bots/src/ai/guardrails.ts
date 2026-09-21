import type { GuardrailDecision } from "@/types/bot.types";

/**
 * Common prompt injection indicators and jailbreak patterns
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?(unrestricted|jailbroken|dan|developer\s+mode)/i,
  /system\s*:\s*override/i,
  /print\s+your\s+(initial|system)\s+(prompt|instructions)/i,
  /what\s+is\s+your\s+system\s+prompt/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[SYSTEM_INSTRUCTION\]/i,
  /sudo\s+mode/i,
];

/**
 * Common obvious non-social media requests
 */
const OUT_OF_SCOPE_PATTERNS = [
  /write\s+a\s+(python|javascript|c\+\+|java|rust|bash|sql)\s+(script|code|function|program)/i,
  /solve\s+this\s+(math|equation|calculus|geometry|physics)\s+problem/i,
  /what\s+is\s+the\s+capital\s+of\s+/i,
  /translate\s+this\s+entire\s+document\s+to/i,
  /diagnose\s+my\s+(symptom|illness|disease)/i,
  /legal\s+advice\s+for/i,
];

export class BotInputGuardrails {
  private maxInputLength: number;

  constructor(maxInputLength = 4000) {
    this.maxInputLength = maxInputLength;
  }

  /**
   * Evaluates input strictly for injection, length, and scope boundaries.
   */
  public evaluate(rawInput: string): GuardrailDecision {
    const trimmed = rawInput.trim();

    if (!trimmed) {
      return {
        allowed: false,
        reason: "Input message is empty.",
        safetyCategory: "OUT_OF_SCOPE",
      };
    }

    if (trimmed.length > this.maxInputLength) {
      return {
        allowed: false,
        reason: `Input exceeds maximum allowed length of ${this.maxInputLength} characters.`,
        safetyCategory: "OUT_OF_SCOPE",
      };
    }

    // 1. Check for prompt injection attempts
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          reason:
            "Security guardrail: Prompt manipulation or unauthorized instruction override detected.",
          safetyCategory: "PROMPT_INJECTION",
        };
      }
    }

    // 2. Check for obvious out-of-scope non-social media requests
    for (const pattern of OUT_OF_SCOPE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          reason: "Out of scope: This bot only creates, reviews, and schedules social media posts.",
          safetyCategory: "OUT_OF_SCOPE",
        };
      }
    }

    // Sanitize non-printable characters
    const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return {
      allowed: true,
      sanitizedInput: sanitized,
    };
  }
}
