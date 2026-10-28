CREATE SCHEMA "idempotency";
--> statement-breakpoint
CREATE TYPE "public"."publish_intent_actor" AS ENUM('user', 'api_key');--> statement-breakpoint
CREATE TYPE "public"."publish_intent_mode" AS ENUM('publish', 'schedule');--> statement-breakpoint
CREATE TYPE "public"."publish_intent_state" AS ENUM('pending', 'confirmed', 'expired', 'canceled');--> statement-breakpoint
ALTER TYPE "public"."dispatch_status" ADD VALUE 'draft' BEFORE 'pending';--> statement-breakpoint
CREATE TABLE "idempotency"."idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"key" text NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"state" text DEFAULT 'processing' NOT NULL,
	"response_status" integer,
	"response_body" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts"."publish_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_type" "publish_intent_actor" NOT NULL,
	"created_by_key_id" uuid,
	"state" "publish_intent_state" DEFAULT 'pending' NOT NULL,
	"mode" "publish_intent_mode" NOT NULL,
	"draft_revision_hash" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idempotency"."idempotency_keys" ADD CONSTRAINT "idempotency_keys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."publish_intents" ADD CONSTRAINT "publish_intents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."publish_intents" ADD CONSTRAINT "publish_intents_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."publish_intents" ADD CONSTRAINT "publish_intents_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."publish_intents" ADD CONSTRAINT "publish_intents_created_by_key_id_api_keys_id_fk" FOREIGN KEY ("created_by_key_id") REFERENCES "api_keys"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_workspace_key_endpoint_idx" ON "idempotency"."idempotency_keys" USING btree ("workspace_id","key","endpoint");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency"."idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "publish_intents_workspace_id_idx" ON "posts"."publish_intents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "publish_intents_post_id_idx" ON "posts"."publish_intents" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "publish_intents_state_idx" ON "posts"."publish_intents" USING btree ("state");--> statement-breakpoint
CREATE INDEX "publish_intents_expires_at_idx" ON "posts"."publish_intents" USING btree ("expires_at");