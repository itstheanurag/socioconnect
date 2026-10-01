import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "drizzle-kit";

// Explicitly load .env from root and api directory
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/socioconnect_dev";

export default defineConfig({
  out: "./drizzle",
  schema: "../../packages/db/src/schema/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
});
