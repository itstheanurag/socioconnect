import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "../../apps/api/drizzle",
  schema: "./src/schema/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/socioconnect_dev",
  },
  casing: "snake_case",
});
