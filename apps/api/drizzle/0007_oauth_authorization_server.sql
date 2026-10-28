CREATE SCHEMA "oauth";
--> statement-breakpoint
ALTER TYPE "public"."audit_actor_type" ADD VALUE 'oauth_client' BEFORE 'system';--> statement-breakpoint
CREATE TABLE "oauth"."oauth_authorization_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"redirect_uri" text NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"code_challenge" text NOT NULL,
	"code_challenge_method" text DEFAULT 'S256' NOT NULL,
	"resource" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth"."oauth_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"client_secret_hash" text,
	"client_name" text NOT NULL,
	"client_uri" text,
	"logo_uri" text,
	"redirect_uris" text[] DEFAULT '{}' NOT NULL,
	"grant_types" text[] DEFAULT '{"authorization_code"}' NOT NULL,
	"response_types" text[] DEFAULT '{"code"}' NOT NULL,
	"token_endpoint_auth_method" text DEFAULT 'none' NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"is_dynamic" boolean DEFAULT true NOT NULL,
	"metadata_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth"."oauth_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"resource" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"rotated_from" uuid,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oauth"."oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth"."oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth"."oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth"."oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_authorization_codes_code_hash_idx" ON "oauth"."oauth_authorization_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "oauth_authorization_codes_client_id_idx" ON "oauth"."oauth_authorization_codes" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_authorization_codes_expires_at_idx" ON "oauth"."oauth_authorization_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_clients_client_id_idx" ON "oauth"."oauth_clients" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_clients_created_at_idx" ON "oauth"."oauth_clients" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_refresh_tokens_token_hash_idx" ON "oauth"."oauth_refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "oauth_refresh_tokens_client_id_idx" ON "oauth"."oauth_refresh_tokens" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_tokens_user_id_idx" ON "oauth"."oauth_refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_tokens_expires_at_idx" ON "oauth"."oauth_refresh_tokens" USING btree ("expires_at");