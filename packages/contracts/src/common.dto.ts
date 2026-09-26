import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    message: z.string(),
    payload: payloadSchema,
  });

export interface ApiResponse<T = unknown> {
  message: string;
  payload: T;
}

export const ErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
