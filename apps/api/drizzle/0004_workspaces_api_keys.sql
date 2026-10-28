CREATE SCHEMA "api_keys";
--> statement-breakpoint
CREATE SCHEMA "workspaces";
--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "api_keys"."api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"account_ids" uuid[] DEFAULT '{}' NOT NULL,
	"environment" text DEFAULT 'live' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces"."workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces"."workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"is_personal" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "accounts"."connected_accounts" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "media"."media_assets" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "posts"."posts" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions"."subscriptions" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "quotas"."user_quotas" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "api_keys"."api_keys" ADD CONSTRAINT "api_keys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys"."api_keys" ADD CONSTRAINT "api_keys_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces"."workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces"."workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces"."workspaces" ADD CONSTRAINT "workspaces_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_prefix_idx" ON "api_keys"."api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "api_keys_workspace_id_idx" ON "api_keys"."api_keys" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "api_keys_created_by_user_id_idx" ON "api_keys"."api_keys" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_idx" ON "workspaces"."workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_id_idx" ON "workspaces"."workspace_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_slug_idx" ON "workspaces"."workspaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workspaces_owner_user_id_idx" ON "workspaces"."workspaces" USING btree ("owner_user_id");--> statement-breakpoint
ALTER TABLE "accounts"."connected_accounts" ADD CONSTRAINT "connected_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media"."media_assets" ADD CONSTRAINT "media_assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."posts" ADD CONSTRAINT "posts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions"."subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotas"."user_quotas" ADD CONSTRAINT "user_quotas_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connected_accounts_workspace_id_idx" ON "accounts"."connected_accounts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "media_workspace_id_idx" ON "media"."media_assets" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "posts_workspace_id_idx" ON "posts"."posts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "subscriptions_workspace_id_idx" ON "subscriptions"."subscriptions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "user_quotas_workspace_id_idx" ON "quotas"."user_quotas" USING btree ("workspace_id");--> statement-breakpoint

-- Backfill one personal workspace per existing user.
INSERT INTO "workspaces"."workspaces" ("name", "slug", "owner_user_id", "is_personal")
SELECT COALESCE(NULLIF("first_name", ''), 'Personal') || ' workspace',
       'personal-' || "id"::text,
       "id",
       true
FROM "users"."users"
WHERE "deleted_at" IS NULL
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

INSERT INTO "workspaces"."workspace_members" ("workspace_id", "user_id", "role")
SELECT "id", "owner_user_id", 'owner'
FROM "workspaces"."workspaces"
ON CONFLICT ("workspace_id", "user_id") DO NOTHING;
--> statement-breakpoint

UPDATE "accounts"."connected_accounts" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
--> statement-breakpoint

UPDATE "media"."media_assets" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
--> statement-breakpoint

UPDATE "posts"."posts" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
--> statement-breakpoint

UPDATE "subscriptions"."subscriptions" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
--> statement-breakpoint

UPDATE "quotas"."user_quotas" AS target
SET "workspace_id" = workspace."id"
FROM "workspaces"."workspaces" AS workspace
WHERE workspace."owner_user_id" = target."user_id"
  AND target."workspace_id" IS NULL;
