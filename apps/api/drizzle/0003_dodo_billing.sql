CREATE SCHEMA "accounts";
--> statement-breakpoint
CREATE SCHEMA "analytics";
--> statement-breakpoint
CREATE SCHEMA "communities";
--> statement-breakpoint
CREATE SCHEMA "media";
--> statement-breakpoint
CREATE SCHEMA "notifications";
--> statement-breakpoint
CREATE SCHEMA "posts";
--> statement-breakpoint
CREATE SCHEMA "quotas";
--> statement-breakpoint
CREATE SCHEMA "subscriptions";
--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'expired', 'revoked', 'disconnected');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('telegram', 'youtube', 'twitch', 'instagram', 'tiktok', 'linkedin', 'x', 'threads', 'reddit', 'bluesky', 'pinterest', 'discord', 'facebook', 'medium', 'devto', 'dribbble', 'google_business', 'slack', 'whatsapp', 'mastodon', 'whop', 'skool', 'kick', 'warpcast', 'vk', 'lemmy', 'mewe', 'nostr', 'listmonk', 'wordpress', 'hashnode', 'github', 'gitlab', 'producthunt', 'hackernews', 'substack', 'beehiiv', 'ghost', 'notion', 'patreon', 'spotify', 'behance', 'tumblr');--> statement-breakpoint
CREATE TYPE "public"."destination_type" AS ENUM('profile', 'subreddit', 'channel', 'group', 'page', 'board', 'community', 'playlist');--> statement-breakpoint
CREATE TYPE "public"."automation_schedule_type" AS ENUM('daily', 'weekly', 'monthly', 'custom_cron', 'rotation_pool');--> statement-breakpoint
CREATE TYPE "public"."automation_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."billing_webhook_status" AS ENUM('processing', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."dispatch_status" AS ENUM('pending', 'processing', 'success', 'failed', 'rate_limited', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'open', 'paid', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'gif', 'audio');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('dispatch_success', 'dispatch_failed', 'token_expiring', 'quota_warning', 'milestone', 'system');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('solo', 'creator_pro', 'studio');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'dispatching', 'published', 'partially_failed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'solo', 'creator_pro', 'studio', 'agency');--> statement-breakpoint
CREATE TYPE "public"."timing_strategy" AS ENUM('simultaneous', 'peak_hours');--> statement-breakpoint
CREATE TYPE "public"."transaction_outcome" AS ENUM('success', 'retryable_failure', 'permanent_failure', 'rate_limited', 'timeout');--> statement-breakpoint
CREATE TABLE "accounts"."connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"platform_account_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"profile_url" text,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"access_token" text NOT NULL,
	"access_token_iv" text NOT NULL,
	"access_token_tag" text NOT NULL,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token" text,
	"refresh_token_iv" text,
	"refresh_token_tag" text,
	"refresh_token_expires_at" timestamp with time zone,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_health_check_at" timestamp with time zone,
	"last_health_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "accounts"."connected_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"platform" "social_platform" NOT NULL,
	"type" "destination_type" DEFAULT 'profile' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar_url" text,
	"parent_container_id" text,
	"parent_container_name" text,
	"member_count" integer DEFAULT 0,
	"can_post" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"extra" jsonb DEFAULT '{}'::jsonb,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."telegram_bot_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"channel_user_id" text NOT NULL,
	"session" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics"."account_analytics_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"date" text NOT NULL,
	"followers_total" integer DEFAULT 0 NOT NULL,
	"followers_gained" integer DEFAULT 0 NOT NULL,
	"impressions_total" bigint DEFAULT 0 NOT NULL,
	"engagements_total" integer DEFAULT 0 NOT NULL,
	"posts_published" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics"."post_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"dispatch_id" uuid,
	"user_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"views" bigint DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"engagement_rate" real DEFAULT 0 NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities"."community_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"schedule_type" "automation_schedule_type" DEFAULT 'weekly' NOT NULL,
	"cron_schedule" text DEFAULT '0 14 * * 1' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"content_template" text NOT NULL,
	"title_template" text,
	"topic_pool" jsonb DEFAULT '[]'::jsonb,
	"next_topic_index" integer DEFAULT 0 NOT NULL,
	"auto_adapt_tone" boolean DEFAULT true NOT NULL,
	"platform_options" jsonb DEFAULT '{}'::jsonb,
	"status" "automation_status" DEFAULT 'active' NOT NULL,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"total_runs" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "communities"."community_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"destination_ids" uuid[] DEFAULT '{}' NOT NULL,
	"stagger_minutes" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscriptions"."billing_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload_hash" text NOT NULL,
	"status" "billing_webhook_status" DEFAULT 'processing' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"error" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts"."dispatch_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispatch_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"attempt_number" integer NOT NULL,
	"outcome" "transaction_outcome" NOT NULL,
	"http_status_code" integer,
	"external_post_id" text,
	"external_post_url" text,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"error_code" text,
	"error_message" text,
	"error_stack" text,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions"."invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"external_invoice_id" text,
	"invoice_number" text NOT NULL,
	"amount_due" integer NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "invoice_status" DEFAULT 'open' NOT NULL,
	"hosted_invoice_url" text,
	"invoice_pdf_url" text,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media"."media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"type" "media_type" DEFAULT 'image' NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer,
	"width" integer,
	"height" integer,
	"duration_seconds" integer,
	"thumbnail_url" text,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts"."post_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"destination_id" uuid,
	"platform" "social_platform" NOT NULL,
	"status" "dispatch_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"custom_content" text,
	"custom_title" text,
	"platform_options" jsonb DEFAULT '{}'::jsonb,
	"external_post_id" text,
	"external_post_url" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"error_details" jsonb,
	"dispatched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"link_url" text,
	"media_ids" uuid[] DEFAULT '{}' NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"timing_strategy" "timing_strategy" DEFAULT 'simultaneous' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscriptions"."subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"billing_interval" "billing_interval" DEFAULT 'monthly' NOT NULL,
	"external_customer_id" text,
	"external_subscription_id" text,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"limits" jsonb NOT NULL,
	"usage" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quotas"."user_quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "plan_tier" DEFAULT 'solo' NOT NULL,
	"max_channels" integer DEFAULT 3 NOT NULL,
	"max_monthly_drops" integer DEFAULT 30 NOT NULL,
	"monthly_drops_used" integer DEFAULT 0 NOT NULL,
	"max_ai_adaptations" integer DEFAULT 25 NOT NULL,
	"ai_adaptations_used" integer DEFAULT 0 NOT NULL,
	"max_cdn_storage_bytes" bigint DEFAULT 5000000000 NOT NULL,
	"cdn_storage_used_bytes" bigint DEFAULT 0 NOT NULL,
	"cycle_resets_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts"."connected_accounts" ADD CONSTRAINT "connected_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."connected_destinations" ADD CONSTRAINT "connected_destinations_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."telegram_bot_sessions" ADD CONSTRAINT "telegram_bot_sessions_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."account_analytics_daily" ADD CONSTRAINT "account_analytics_daily_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."account_analytics_daily" ADD CONSTRAINT "account_analytics_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."post_analytics" ADD CONSTRAINT "post_analytics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."post_analytics" ADD CONSTRAINT "post_analytics_dispatch_id_post_dispatches_id_fk" FOREIGN KEY ("dispatch_id") REFERENCES "posts"."post_dispatches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."post_analytics" ADD CONSTRAINT "post_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities"."community_automations" ADD CONSTRAINT "community_automations_group_id_community_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "communities"."community_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities"."community_automations" ADD CONSTRAINT "community_automations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities"."community_groups" ADD CONSTRAINT "community_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities"."community_groups" ADD CONSTRAINT "community_groups_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."dispatch_transactions" ADD CONSTRAINT "dispatch_transactions_dispatch_id_post_dispatches_id_fk" FOREIGN KEY ("dispatch_id") REFERENCES "posts"."post_dispatches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."dispatch_transactions" ADD CONSTRAINT "dispatch_transactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."dispatch_transactions" ADD CONSTRAINT "dispatch_transactions_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions"."invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions"."invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media"."media_assets" ADD CONSTRAINT "media_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."post_dispatches" ADD CONSTRAINT "post_dispatches_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."post_dispatches" ADD CONSTRAINT "post_dispatches_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"."connected_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."post_dispatches" ADD CONSTRAINT "post_dispatches_destination_id_connected_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "accounts"."connected_destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts"."posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotas"."user_quotas" ADD CONSTRAINT "user_quotas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_platform_account_idx" ON "accounts"."connected_accounts" USING btree ("user_id","platform","platform_account_id");--> statement-breakpoint
CREATE INDEX "connected_accounts_user_id_idx" ON "accounts"."connected_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "connected_accounts_platform_idx" ON "accounts"."connected_accounts" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "connected_accounts_status_idx" ON "accounts"."connected_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "connected_accounts_access_token_expires_at_idx" ON "accounts"."connected_accounts" USING btree ("access_token_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_account_destination_idx" ON "accounts"."connected_destinations" USING btree ("account_id","external_id");--> statement-breakpoint
CREATE INDEX "destinations_account_id_idx" ON "accounts"."connected_destinations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "destinations_platform_type_idx" ON "accounts"."connected_destinations" USING btree ("platform","type");--> statement-breakpoint
CREATE INDEX "destinations_is_default_idx" ON "accounts"."connected_destinations" USING btree ("is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_bot_session_user_idx" ON "accounts"."telegram_bot_sessions" USING btree ("account_id","channel_user_id");--> statement-breakpoint
CREATE INDEX "telegram_bot_session_expiry_idx" ON "accounts"."telegram_bot_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "account_analytics_acc_date_idx" ON "analytics"."account_analytics_daily" USING btree ("account_id","date");--> statement-breakpoint
CREATE INDEX "account_analytics_user_id_idx" ON "analytics"."account_analytics_daily" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_analytics_date_idx" ON "analytics"."account_analytics_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX "post_analytics_user_id_idx" ON "analytics"."post_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_analytics_post_id_idx" ON "analytics"."post_analytics" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_analytics_platform_idx" ON "analytics"."post_analytics" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "community_automations_group_id_idx" ON "communities"."community_automations" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "community_automations_user_id_idx" ON "communities"."community_automations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_automations_status_idx" ON "communities"."community_automations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "community_automations_next_run_at_idx" ON "communities"."community_automations" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "community_groups_user_id_idx" ON "communities"."community_groups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_groups_account_id_idx" ON "communities"."community_groups" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "community_groups_platform_idx" ON "communities"."community_groups" USING btree ("platform");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_webhook_events_webhook_id_idx" ON "subscriptions"."billing_webhook_events" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "dispatch_tx_dispatch_id_idx" ON "posts"."dispatch_transactions" USING btree ("dispatch_id");--> statement-breakpoint
CREATE INDEX "dispatch_tx_post_id_idx" ON "posts"."dispatch_transactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "dispatch_tx_platform_idx" ON "posts"."dispatch_transactions" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "dispatch_tx_outcome_idx" ON "posts"."dispatch_transactions" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "dispatch_tx_executed_at_idx" ON "posts"."dispatch_transactions" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "subscriptions"."invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_subscription_id_idx" ON "subscriptions"."invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "subscriptions"."invoices" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_external_invoice_id_idx" ON "subscriptions"."invoices" USING btree ("external_invoice_id");--> statement-breakpoint
CREATE INDEX "media_user_id_idx" ON "media"."media_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media"."media_assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media"."media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications"."notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications"."notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications"."notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dispatches_post_id_idx" ON "posts"."post_dispatches" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "dispatches_account_id_idx" ON "posts"."post_dispatches" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "dispatches_destination_id_idx" ON "posts"."post_dispatches" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "dispatches_status_idx" ON "posts"."post_dispatches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dispatches_scheduled_for_idx" ON "posts"."post_dispatches" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "dispatches_next_retry_at_idx" ON "posts"."post_dispatches" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts"."posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts"."posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_scheduled_at_idx" ON "posts"."posts" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts"."posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_idx" ON "subscriptions"."subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"."subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_tier_idx" ON "subscriptions"."subscriptions" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "subscriptions_ext_sub_idx" ON "subscriptions"."subscriptions" USING btree ("external_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_quotas_user_id_idx" ON "quotas"."user_quotas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_quotas_tier_idx" ON "quotas"."user_quotas" USING btree ("tier");