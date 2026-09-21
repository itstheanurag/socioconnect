export interface AIClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class LightAIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(config: AIClientConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || "";
    this.baseUrl = config.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    this.model = config.model || process.env.OPENAI_LIGHT_MODEL || "gpt-4o-mini";
    this.timeoutMs = config.timeoutMs || 20000;
  }

  public async generateStructuredCompletion<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured for bot AI client.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1, // Low temperature for deterministic classification
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API request failed with status ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No response content received from AI provider.");
      }

      return JSON.parse(content) as T;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
