CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "usage";
--> statement-breakpoint
CREATE TYPE "public"."audit_actor_type" AS ENUM('user', 'api_key', 'system');--> statement-breakpoint
CREATE TYPE "public"."usage_source" AS ENUM('web', 'api', 'mcp', 'cli', 'plugin', 'system');--> statement-breakpoint
CREATE TABLE "audit"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_type" "audit_actor_type" NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip" text,
	"user_agent" text,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage"."usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"api_key_id" uuid,
	"source" "usage_source" NOT NULL,
	"operation" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"post_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage"."usage_events" ADD CONSTRAINT "usage_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage"."usage_events" ADD CONSTRAINT "usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage"."usage_events" ADD CONSTRAINT "usage_events_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_workspace_id_idx" ON "audit"."audit_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "audit_events_action_idx" ON "audit"."audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_events_resource_idx" ON "audit"."audit_events" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_idx" ON "audit"."audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "usage_events_workspace_id_idx" ON "usage"."usage_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "usage_events_api_key_id_idx" ON "usage"."usage_events" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "usage_events_operation_idx" ON "usage"."usage_events" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "usage_events_created_at_idx" ON "usage"."usage_events" USING btree ("created_at");