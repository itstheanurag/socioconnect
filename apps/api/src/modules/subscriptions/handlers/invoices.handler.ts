import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SubscriptionsRepository, InvoiceStatusEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const getInvoicesRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/invoices",
  tags: ["Subscriptions"],
  summary: "List invoice history",
  description: "Retrieves past billing invoices, receipts, and download links",
  responses: {
    200: {
      description: "Invoices retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              invoices: z.array(
                z.object({
                  id: z.string().uuid(),
                  invoiceNumber: z.string(),
                  amountDueDollars: z.number(),
                  amountPaidDollars: z.number(),
                  currency: z.string(),
                  status: z.nativeEnum(InvoiceStatusEnum),
                  hostedInvoiceUrl: z.string().nullable(),
                  invoicePdfUrl: z.string().nullable(),
                  periodStart: z.string(),
                  periodEnd: z.string(),
                  paidAt: z.string().nullable(),
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

export type GetInvoicesRoute = typeof getInvoicesRoute;

export const getInvoicesHandler: AppRouteHandler<GetInvoicesRoute> = async (c) => {
  const user = c.get("user");

  try {
    const rawInvoices = await SubscriptionsRepository.listInvoices(user.id);

    const invoices = rawInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amountDueDollars: inv.amountDue / 100,
      amountPaidDollars: inv.amountPaid / 100,
      currency: inv.currency,
      status: inv.status as InvoiceStatusEnum,
      hostedInvoiceUrl: inv.hostedInvoiceUrl,
      invoicePdfUrl: inv.invoicePdfUrl,
      periodStart: inv.periodStart.toISOString(),
      periodEnd: inv.periodEnd.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
    }));

    return c.json({
      message: "Invoices retrieved successfully",
      payload: { invoices },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving invoices", {
      module: "subscriptions",
      action: "getInvoicesHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
