import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SubscriptionsRepository } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { BillingProviderError, DodoPaymentsService } from "../services/dodo-payments.service";
import { resolveBillingWorkspace } from "@/utils/workspace";

export const createPortalSessionRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/portal",
  tags: ["Subscriptions"],
  summary: "Create a Dodo Payments customer portal session",
  description:
    "Returns a short-lived link where the customer can manage payment methods, invoices, and cancellation.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            returnUrl: z.url().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Portal session created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              url: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreatePortalSessionRoute = typeof createPortalSessionRoute;

export const createPortalSessionHandler: AppRouteHandler<CreatePortalSessionRoute> = async (c) => {
  const { returnUrl } = c.req.valid("json");
  const user = c.get("user");

  try {
    const workspaceId = await resolveBillingWorkspace(user.id, c.var.auth);
    const subscription = await SubscriptionsRepository.findByWorkspaceId(workspaceId);

    if (!subscription?.externalCustomerId) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json(
          { message: "No billing account found for this workspace" },
          StatusCodes.HTTP_400_BAD_REQUEST,
        ),
      });
    }

    const session = await DodoPaymentsService.createCustomerPortalSession(
      subscription.externalCustomerId,
      returnUrl,
    );

    return c.json({
      message: "Portal session created successfully",
      payload: { url: session.link },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    if (err instanceof BillingProviderError) {
      logger.error("billing provider rejected portal session", {
        module: "subscriptions",
        action: "createPortalSessionHandler",
        error: err,
        code: err.code,
      });

      throw new HTTPException(StatusCodes.HTTP_502_BAD_GATEWAY, {
        res: c.json({ message: err.message }, StatusCodes.HTTP_502_BAD_GATEWAY),
      });
    }

    logger.error("Error creating billing portal session", {
      module: "subscriptions",
      action: "createPortalSessionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to create portal session" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
