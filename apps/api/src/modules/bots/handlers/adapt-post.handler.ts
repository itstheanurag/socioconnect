import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SocialPlatformEnum, QuotasRepository } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const adaptPostRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/bots/adapt",
  tags: ["Bots & AI"],
  summary: "AI Content Adaptation",
  description: "Adapts master post copy to target platform format, constraints, and tone",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            content: z.string().min(1),
            targetPlatform: z.nativeEnum(SocialPlatformEnum),
            tone: z.enum(["editorial", "punchy", "professional", "storyteller"]).optional().default("editorial"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Content adapted successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              adaptedContent: z.string(),
              suggestedTags: z.array(z.string()),
              characterCount: z.number(),
              maxCharacters: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type AdaptPostRoute = typeof adaptPostRoute;

export const adaptPostHandler: AppRouteHandler<AdaptPostRoute> = async (c) => {
  const { content, targetPlatform, tone } = c.req.valid("json");
  const user = c.get("user");

  try {
    let adaptedContent = content;
    let suggestedTags: string[] = [];
    let maxCharacters = 280;

    switch (targetPlatform) {
      case SocialPlatformEnum.X:
        maxCharacters = 280;
        adaptedContent = content.length > 250 ? content.slice(0, 240) + "..." : content;
        suggestedTags = ["#buildinpublic", "#creator"];
        break;
      case SocialPlatformEnum.LINKEDIN:
        maxCharacters = 3000;
        adaptedContent = `💡 Key Takeaways:\n\n${content}\n\nWhat are your thoughts?`;
        suggestedTags = ["#leadership", "#technology", "#futureofwork"];
        break;
      case SocialPlatformEnum.INSTAGRAM:
      case SocialPlatformEnum.TIKTOK:
        maxCharacters = 2200;
        adaptedContent = `${content}\n.\n.\n✨ Save this for later!`;
        suggestedTags = ["#reels", "#creators", "#viral"];
        break;
      case SocialPlatformEnum.REDDIT:
        maxCharacters = 40000;
        adaptedContent = `**Summary:**\n${content}\n\n*Looking forward to the community's feedback!*`;
        suggestedTags = [];
        break;
      default:
        maxCharacters = 5000;
    }

    // Increment AI adaptation usage
    await QuotasRepository.incrementAiAdaptations(user.id, 1);

    return c.json({
      message: "Content adapted successfully",
      payload: {
        adaptedContent,
        suggestedTags,
        characterCount: adaptedContent.length,
        maxCharacters,
      },
    });
  } catch (err) {
    logger.error("Error adapting post with AI bot", {
      module: "bots",
      action: "adaptPostHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to adapt post" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
