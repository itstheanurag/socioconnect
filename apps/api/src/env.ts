import { z } from "zod";
import { baseEnvSchema } from "@repo/config";
import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from root and current directory
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * API-specific environment schema
 * Extends base schema with API-specific variables
 */
const apiEnvSchema = baseEnvSchema.extend({
  // Server
  PORT: z.string().optional().default("8000"),

  // Database
  DATABASE_URL: z.string({ message: "DATABASE_URL is required" }),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string({ message: "GOOGLE_CLIENT_ID is required" }),
  GOOGLE_CLIENT_SECRET: z.string({ message: "GOOGLE_CLIENT_SECRET is required" }),
  GOOGLE_REDIRECT_URI: z.string({ message: "GOOGLE_REDIRECT_URI is required" }),

  // OAuth - Apple (Optional)
  APPLE_CLIENT_ID: z.string().optional().default(""),
  APPLE_TEAM_ID: z.string().optional().default(""),
  APPLE_KEY_ID: z.string().optional().default(""),
  APPLE_PRIVATE_KEY: z.string().optional().default(""),
  APPLE_REDIRECT_URI: z
    .string()
    .optional()
    .default("http://localhost:8000/v1/oauth/apple/callback"),

  // Security
  ENCRYPTION_KEY: z.string({ message: "ENCRYPTION_KEY is required" }).refine(
    (val) => {
      return /^[0-9a-fA-F]{64}$/.test(val);
    },
    {
      message: "ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes for AES-256)",
    },
  ),
  JWT_SECRET: z
    .string({ message: "JWT_SECRET is required" })
    .min(32, { message: "JWT_SECRET must be at least 32 characters long for security" }),

  // CORS
  CORS_ORIGIN: z
    .string()
    .optional()
    .default("*")
    .describe("Comma-separated list of allowed origins or * for all"),
  FRONTEND_URL: z
    .string()
    .url({ message: "FRONTEND_URL must be a valid URL" })
    .optional()
    .default("http://localhost:3000"),

  // Billing - Dodo Payments (optional; billing routes return 503 when unset)
  DODO_PAYMENTS_API_KEY: z.string().optional().default(""),
  DODO_PAYMENTS_WEBHOOK_KEY: z.string().optional().default(""),
  DODO_PAYMENTS_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).optional().default("test_mode"),
  DODO_PAYMENTS_SKIP_WEBHOOK_VERIFICATION: z
    .string()
    .optional()
    .default("false")
    .transform((value) => value === "true"),
  DODO_PAYMENTS_RETURN_URL: z.string().url().optional(),
  DODO_PAYMENTS_CANCEL_URL: z.string().url().optional(),

  // Dodo product IDs, one per paid tier and billing interval.
  DODO_PRODUCT_SOLO_MONTHLY: z.string().optional().default(""),
  DODO_PRODUCT_SOLO_YEARLY: z.string().optional().default(""),
  DODO_PRODUCT_CREATOR_PRO_MONTHLY: z.string().optional().default(""),
  DODO_PRODUCT_CREATOR_PRO_YEARLY: z.string().optional().default(""),
  DODO_PRODUCT_STUDIO_MONTHLY: z.string().optional().default(""),
  DODO_PRODUCT_STUDIO_YEARLY: z.string().optional().default(""),
  DODO_PRODUCT_AGENCY_MONTHLY: z.string().optional().default(""),
  DODO_PRODUCT_AGENCY_YEARLY: z.string().optional().default(""),

  // OAuth 2.1 / MCP
  OAUTH_ISSUER: z.string().url().optional().default("http://localhost:8000"),
  MCP_RESOURCE_URL: z.string().url().optional().default("http://localhost:8010/mcp"),
  API_RESOURCE_URL: z.string().url().optional().default("http://localhost:8000"),
  SERVICE_TOKEN_SECRET: z.string().optional().default(""),
  OAUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).optional().default(900),
  OAUTH_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).optional().default(30),

  // Docker Services (optional, with defaults)
  POSTGRES_PORT: z.string().optional().default("5432"),
  PROMETHEUS_PORT: z.string().optional().default("9090"),
  GRAFANA_PORT: z.string().optional().default("8001"),
  METRICS_SERVER_PORT: z.string().optional().default("3002"),
});

export const env = apiEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
  APPLE_KEY_ID: process.env.APPLE_KEY_ID,
  APPLE_PRIVATE_KEY: process.env.APPLE_PRIVATE_KEY,
  APPLE_REDIRECT_URI: process.env.APPLE_REDIRECT_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
  DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  DODO_PAYMENTS_ENVIRONMENT: process.env.DODO_PAYMENTS_ENVIRONMENT,
  DODO_PAYMENTS_SKIP_WEBHOOK_VERIFICATION: process.env.DODO_PAYMENTS_SKIP_WEBHOOK_VERIFICATION,
  DODO_PAYMENTS_RETURN_URL: process.env.DODO_PAYMENTS_RETURN_URL,
  DODO_PAYMENTS_CANCEL_URL: process.env.DODO_PAYMENTS_CANCEL_URL,
  DODO_PRODUCT_SOLO_MONTHLY: process.env.DODO_PRODUCT_SOLO_MONTHLY,
  DODO_PRODUCT_SOLO_YEARLY: process.env.DODO_PRODUCT_SOLO_YEARLY,
  DODO_PRODUCT_CREATOR_PRO_MONTHLY: process.env.DODO_PRODUCT_CREATOR_PRO_MONTHLY,
  DODO_PRODUCT_CREATOR_PRO_YEARLY: process.env.DODO_PRODUCT_CREATOR_PRO_YEARLY,
  DODO_PRODUCT_STUDIO_MONTHLY: process.env.DODO_PRODUCT_STUDIO_MONTHLY,
  DODO_PRODUCT_STUDIO_YEARLY: process.env.DODO_PRODUCT_STUDIO_YEARLY,
  DODO_PRODUCT_AGENCY_MONTHLY: process.env.DODO_PRODUCT_AGENCY_MONTHLY,
  DODO_PRODUCT_AGENCY_YEARLY: process.env.DODO_PRODUCT_AGENCY_YEARLY,
  OAUTH_ISSUER: process.env.OAUTH_ISSUER,
  MCP_RESOURCE_URL: process.env.MCP_RESOURCE_URL,
  API_RESOURCE_URL: process.env.API_RESOURCE_URL,
  SERVICE_TOKEN_SECRET: process.env.SERVICE_TOKEN_SECRET,
  OAUTH_ACCESS_TOKEN_TTL_SECONDS: process.env.OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  OAUTH_REFRESH_TOKEN_TTL_DAYS: process.env.OAUTH_REFRESH_TOKEN_TTL_DAYS,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  PROMETHEUS_PORT: process.env.PROMETHEUS_PORT,
  GRAFANA_PORT: process.env.GRAFANA_PORT,
  METRICS_SERVER_PORT: process.env.METRICS_SERVER_PORT,
});

export type Env = z.infer<typeof apiEnvSchema>;
