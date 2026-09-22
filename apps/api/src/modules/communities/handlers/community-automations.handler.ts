import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  CommunitiesRepository,
  PostsRepository,
  DestinationsRepository,
  type ConnectedDestination,
  AutomationScheduleTypeEnum,
  AutomationStatusEnum,
  TimingStrategyEnum,
  PostStatusEnum,
  SocialPlatformEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. List Community Automations
export const getAutomationsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/automations",
  tags: ["Communities"],
  summary: "List all community automated schedules",
  description: "Retrieves active and paused broadcast campaigns across all community clusters",
  responses: {
    200: {
      description: "Automations retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              automations: z.array(
                z.object({
                  id: z.string().uuid(),
                  groupId: z.string().uuid(),
                  groupName: z.string(),
                  platform: z.nativeEnum(SocialPlatformEnum),
                  title: z.string(),
                  scheduleType: z.nativeEnum(AutomationScheduleTypeEnum),
                  cronSchedule: z.string(),
                  contentTemplate: z.string(),
                  topicPool: z.array(z.string()),
                  autoAdaptTone: z.boolean(),
                  status: z.nativeEnum(AutomationStatusEnum),
                  totalRuns: z.number(),
                  lastRunAt: z.string().nullable(),
                  nextRunAt: z.string().nullable(),
                  createdAt: z.string(),
                }),
              ),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetAutomationsRoute = typeof getAutomationsRoute;

export const getAutomationsHandler: AppRouteHandler<GetAutomationsRoute> = async (c) => {
  const user = c.get("user");

  try {
    const rawAutomations = await CommunitiesRepository.findAllAutomationsByUserId(user.id);

    const automations = rawAutomations.map((a) => ({
      id: a.id,
      groupId: a.groupId,
      groupName: a.group?.name || "Community Group",
      platform: (a.group?.platform || SocialPlatformEnum.REDDIT) as SocialPlatformEnum,
      title: a.title,
      scheduleType: a.scheduleType as AutomationScheduleTypeEnum,
      cronSchedule: a.cronSchedule,
      contentTemplate: a.contentTemplate,
      topicPool: a.topicPool || [],
      autoAdaptTone: a.autoAdaptTone,
      status: a.status as AutomationStatusEnum,
      totalRuns: a.totalRuns,
      lastRunAt: a.lastRunAt ? a.lastRunAt.toISOString() : null,
      nextRunAt: a.nextRunAt ? a.nextRunAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    }));

    return c.json({
      message: "Automations retrieved successfully",
      payload: { automations },
    });
  } catch (err) {
    logger.error("Error listing automations", {
      module: "communities",
      action: "getAutomationsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Create Community Automation
export const createAutomationRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/groups/:groupId/automations",
  tags: ["Communities"],
  summary: "Create automation rule for community cluster",
  description:
    "Defines automated periodic posting cadence, rotational topic pool, and tone adaptation for a community group",
  request: {
    params: z.object({
      groupId: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(2).max(100),
            scheduleType: z
              .nativeEnum(AutomationScheduleTypeEnum)
              .default(AutomationScheduleTypeEnum.WEEKLY),
            cronSchedule: z.string().default("0 14 * * 1"),
            timezone: z.string().default("UTC"),
            contentTemplate: z.string().min(5),
            titleTemplate: z.string().optional(),
            topicPool: z.array(z.string()).default([]),
            autoAdaptTone: z.boolean().default(true),
            platformOptions: z.record(z.string(), z.unknown()).default({}),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Automation created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              automation: z.object({
                id: z.string().uuid(),
                title: z.string(),
                status: z.nativeEnum(AutomationStatusEnum),
              }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreateAutomationRoute = typeof createAutomationRoute;

export const createAutomationHandler: AppRouteHandler<CreateAutomationRoute> = async (c) => {
  const { groupId } = c.req.valid("param");
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const group = await CommunitiesRepository.findGroupById(groupId, user.id);
    if (!group) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Community group not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    const automation = await CommunitiesRepository.createAutomation({
      groupId,
      userId: user.id,
      title: body.title,
      scheduleType: body.scheduleType,
      cronSchedule: body.cronSchedule,
      timezone: body.timezone,
      contentTemplate: body.contentTemplate,
      titleTemplate: body.titleTemplate,
      topicPool: body.topicPool,
      autoAdaptTone: body.autoAdaptTone,
      platformOptions: body.platformOptions,
      status: AutomationStatusEnum.ACTIVE,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Default next run 24h
    });

    return c.json(
      {
        message: "Community automation created successfully",
        payload: {
          automation: {
            id: automation.id,
            title: automation.title,
            status: automation.status as AutomationStatusEnum,
          },
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error creating community automation", {
      module: "communities",
      action: "createAutomationHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to create automation" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 3. Trigger Automation Now (Manual broadcast to community cluster)
export const triggerAutomationNowRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/automations/:id/trigger",
  tags: ["Communities"],
  summary: "Trigger immediate community broadcast",
  description:
    "Instantly schedules staggered post dispatches across all group destinations based on current rotation topic or template",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Automation triggered and dispatches scheduled",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              postId: z.string().uuid(),
              dispatchesScheduled: z.number(),
              nextTopicIndex: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type TriggerAutomationNowRoute = typeof triggerAutomationNowRoute;

export const triggerAutomationNowHandler: AppRouteHandler<TriggerAutomationNowRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const automation = await CommunitiesRepository.findAutomationById(id, user.id);
    if (!automation) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Automation rule not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    const group = automation.group;
    if (!group || group.destinationIds.length === 0) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json(
          { message: "Community group has no destination channels configured" },
          StatusCodes.HTTP_400_BAD_REQUEST,
        ),
      });
    }

    // Determine content from topic pool or template
    const topicPool = automation.topicPool || [];
    let currentTopic = "";
    let nextIndex = 0;

    if (topicPool.length > 0) {
      const idx = automation.nextTopicIndex % topicPool.length;
      currentTopic = topicPool[idx] || "";
      nextIndex = (idx + 1) % topicPool.length;
    }

    const finalContent = automation.contentTemplate.replace(/\{\{topic\}\}/g, currentTopic);
    const finalTitle = automation.titleTemplate
      ? automation.titleTemplate.replace(/\{\{topic\}\}/g, currentTopic)
      : `${automation.title} • Community Update`;

    // Fetch destinations to map platform options & names
    const destinations: ConnectedDestination[] = await DestinationsRepository.findByIds(
      group.destinationIds,
    );

    const now = new Date();
    const staggerMinutes = group.staggerMinutes || 5;

    // Build staggered dispatches for each destination
    const dispatches = group.destinationIds.map((destId: string, i: number) => {
      const dest = destinations.find((d: ConnectedDestination) => d.id === destId);
      const scheduledFor = new Date(now.getTime() + i * staggerMinutes * 60 * 1000);
      const flairId = dest?.requirements?.allowedFlairs?.[0]?.id;

      return {
        accountId: group.accountId,
        destinationId: destId,
        platform: group.platform,
        scheduledFor,
        customTitle: finalTitle,
        customContent: finalContent,
        platformOptions: {
          ...(automation.platformOptions || {}),
          destinationName: dest?.name || "Channel",
          flairId,
        },
      };
    });

    // Create master post and dispatches
    const { post, dispatches: createdDispatches } = await PostsRepository.createWithDispatches({
      post: {
        userId: user.id,
        title: finalTitle,
        content: finalContent,
        tags: group.tags || [],
        status: PostStatusEnum.SCHEDULED,
        timingStrategy: TimingStrategyEnum.PEAK_HOURS,
        scheduledAt: now,
      },
      dispatches,
    });

    // Advance automation run counters
    const nextRun = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // Schedule next week
    await CommunitiesRepository.recordAutomationExecution(automation.id, nextRun, nextIndex);

    return c.json({
      message: "Community broadcast scheduled successfully across all group targets",
      payload: {
        postId: post.id,
        dispatchesScheduled: createdDispatches.length,
        nextTopicIndex: nextIndex,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error triggering community automation", {
      module: "communities",
      action: "triggerAutomationNowHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to execute community automation" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
