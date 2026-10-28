ALTER TABLE "communities"."community_groups" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "communities"."community_groups" ADD CONSTRAINT "community_groups_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_groups_workspace_id_idx" ON "communities"."community_groups" USING btree ("workspace_id");--> statement-breakpoint
UPDATE "communities"."community_groups" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
