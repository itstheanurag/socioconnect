import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const { initializeDB, connectDB, closeDB } = await import("@repo/db");
  const { WebhookService } = await import("../modules/webhooks/webhooks.service");

  initializeDB({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  
  await connectDB();

  try {
    const result = await WebhookService.retryPendingDeliveries(
      Number(process.env.WEBHOOK_RETRY_LIMIT ?? 50),
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await closeDB();
  }
}

main().catch(async (err) => {
  console.error("Webhook retry failed:", err);
  process.exit(1);
});
