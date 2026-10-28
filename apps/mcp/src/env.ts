import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8010),
  API_BASE_URL: z.string().url().default("http://localhost:8000"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  OAUTH_ISSUER: z.string().url().default("http://localhost:8000"),
  MCP_RESOURCE_URL: z.string().url().default("http://localhost:8010/mcp"),
  JWT_SECRET: z.string().min(32),
  SERVICE_TOKEN_SECRET: z.string().optional().default(""),
  OPENAI_APPS_CHALLENGE_TOKEN: z.string().optional().default(""),
  LOG_LEVEL: z.string().optional().default("info"),
});

export const env = envSchema.parse({
  // Never inherit PORT: the API owns 8000, MCP must use its own port.
  PORT: process.env.MCP_PORT || undefined,
  API_BASE_URL: process.env.API_BASE_URL,
  APP_BASE_URL: process.env.APP_BASE_URL,
  OAUTH_ISSUER: process.env.OAUTH_ISSUER,
  MCP_RESOURCE_URL: process.env.MCP_RESOURCE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SERVICE_TOKEN_SECRET: process.env.SERVICE_TOKEN_SECRET,
  OPENAI_APPS_CHALLENGE_TOKEN: process.env.OPENAI_APPS_CHALLENGE_TOKEN,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

export const serviceTokenSecret = env.SERVICE_TOKEN_SECRET || env.JWT_SECRET;
