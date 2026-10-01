import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/socioconnect_dev";

async function runMigrate() {
  console.log(
    "Connecting to Postgres database at:",
    connectionString.replace(/:[^:@]+@/, ":****@"),
  );

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);

  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  console.log("Applying database migrations from:", migrationsFolder);

  try {
    await migrate(db, {
      migrationsFolder,
    });
    console.log("✅ Database migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrate();
