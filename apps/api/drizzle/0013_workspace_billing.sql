DROP INDEX "subscriptions"."subscriptions_user_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions"."subscriptions_workspace_id_idx";--> statement-breakpoint
ALTER TABLE "subscriptions"."invoices" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions"."invoices" ADD CONSTRAINT "invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_workspace_id_idx" ON "subscriptions"."invoices" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"."subscriptions" USING btree ("user_id");--> statement-breakpoint
WITH "personal" AS (
  SELECT DISTINCT ON ("owner_user_id") "id", "owner_user_id"
  FROM "workspaces"."workspaces"
  WHERE "is_personal" = true AND "deleted_at" IS NULL
  ORDER BY "owner_user_id", "created_at"
), "ranked" AS (
  SELECT "id", "user_id", row_number() OVER (PARTITION BY "user_id" ORDER BY "created_at") AS "rn"
  FROM "subscriptions"."subscriptions"
  WHERE "workspace_id" IS NULL
)
UPDATE "subscriptions"."subscriptions" AS target
SET "workspace_id" = "personal"."id"
FROM "ranked", "personal"
WHERE target."id" = "ranked"."id"
  AND "ranked"."rn" = 1
  AND "personal"."owner_user_id" = "ranked"."user_id"
  AND NOT EXISTS (
    SELECT 1 FROM "subscriptions"."subscriptions" AS existing
    WHERE existing."workspace_id" = "personal"."id"
  );--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_workspace_id_idx" ON "subscriptions"."subscriptions" USING btree ("workspace_id");--> statement-breakpoint
UPDATE "subscriptions"."invoices" AS target
SET "workspace_id" = subscription."workspace_id"
FROM "subscriptions"."subscriptions" AS subscription
WHERE subscription."id" = target."subscription_id"
  AND target."workspace_id" IS NULL;
