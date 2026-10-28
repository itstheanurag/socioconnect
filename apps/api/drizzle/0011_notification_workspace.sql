ALTER TABLE "notifications"."notifications" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications"."notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_workspace_id_idx" ON "notifications"."notifications" USING btree ("workspace_id");--> statement-breakpoint
UPDATE "notifications"."notifications" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
