import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { AnalyticsRepository } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Get Analytics Overview Summary
export const getAnalyticsOverviewRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/analytics/overview",
  tags: ["Analytics"],
  summary: "Get high-level performance overview",
  description: "Retrieves total impressions, engagements, average engagement rate, clicks, and breakdown by platform",
  responses: {
    200: {
      description: "Overview analytics retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              totalImpressions: z.number(),
              totalEngagements: z.number(),
              avgEngagementRate: z.number(),
              totalClicks: z.number(),
              topPlatforms: z.array(
                z.object({
                  platform: z.string(),
                  impressions: z.number(),
                  engagementRate: z.number(),
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

export type GetAnalyticsOverviewRoute = typeof getAnalyticsOverviewRoute;

export const getAnalyticsOverviewHandler: AppRouteHandler<GetAnalyticsOverviewRoute> = async (c) => {
  const user = c.get("user");

  try {
    const overview = await AnalyticsRepository.getOverview(user.id);

    return c.json({
      message: "Analytics overview retrieved successfully",
      payload: overview,
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving analytics overview", {
      module: "analytics",
      action: "getAnalyticsOverviewHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Get Daily Timeseries Metrics
export const getAnalyticsTimeseriesRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/analytics/timeseries",
  tags: ["Analytics"],
  summary: "Get daily performance timeseries",
  description: "Retrieves day-by-day impressions, engagements, and published drops over the requested timeframe",
  request: {
    query: z.object({
      days: z.coerce.number().optional().default(7),
    }),
  },
  responses: {
    200: {
      description: "Timeseries retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              timeseries: z.array(
                z.object({
                  date: z.string(),
                  impressions: z.number(),
                  engagements: z.number(),
                  postsPublished: z.number(),
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

export type GetAnalyticsTimeseriesRoute = typeof getAnalyticsTimeseriesRoute;

export const getAnalyticsTimeseriesHandler: AppRouteHandler<GetAnalyticsTimeseriesRoute> = async (c) => {
  const { days } = c.req.valid("query");
  const user = c.get("user");

  try {
    const timeseries = await AnalyticsRepository.getTimeseries(user.id, days);

    return c.json({
      message: "Analytics timeseries retrieved successfully",
      payload: { timeseries },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving analytics timeseries", {
      module: "analytics",
      action: "getAnalyticsTimeseriesHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
