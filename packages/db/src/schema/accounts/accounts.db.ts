import { index, jsonb, pgEnum, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { accountsSchema } from "./index";
import { usersTable } from "../users/users.db";

export enum SocialPlatformEnum {
  YOUTUBE = "youtube",
  TWITCH = "twitch",
  INSTAGRAM = "instagram",
  TIKTOK = "tiktok",
  LINKEDIN = "linkedin",
  X = "x",
  THREADS = "threads",
  PEERLIST = "peerlist",
  REDDIT = "reddit",
  BLUESKY = "bluesky",
  PINTEREST = "pinterest",
  DISCORD = "discord",
  FACEBOOK = "facebook",
  MEDIUM = "medium",
  DEVTO = "devto",
  DRIBBBLE = "dribbble",
}

export enum ConnectedAccountStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  DISCONNECTED = "disconnected",
}

export const socialPlatformPgEnum = pgEnum(
  "social_platform",
  enumToPgEnum(SocialPlatformEnum),
);

export const accountStatusPgEnum = pgEnum(
  "account_status",
  enumToPgEnum(ConnectedAccountStatus),
);

export const connectedAccountsTable = accountsSchema.table(
  "connected_accounts",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    platformAccountId: text("platform_account_id").notNull(), // Provider unique ID (e.g. YouTube Channel ID)
    username: text("username").notNull(), // e.g. @alex_creates
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    profileUrl: text("profile_url"),

    status: accountStatusPgEnum("status").notNull().default(ConnectedAccountStatus.ACTIVE),

    // Hardware-safe AES-256 encrypted access token
    accessToken: text("access_token").notNull(),
    accessTokenIv: text("access_token_iv").notNull(),
    accessTokenTag: text("access_token_tag").notNull(),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),

    // Hardware-safe AES-256 encrypted refresh token
    refreshToken: text("refresh_token"),
    refreshTokenIv: text("refresh_token_iv"),
    refreshTokenTag: text("refresh_token_tag"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),

    scopes: text("scopes").array().notNull().default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true }),
    lastHealthStatus: text("last_health_status"), // e.g. "200_OK" or "401_UNAUTHORIZED"

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("unique_user_platform_account_idx").on(table.userId, table.platform, table.platformAccountId),
    index("connected_accounts_user_id_idx").on(table.userId),
    index("connected_accounts_platform_idx").on(table.platform),
    index("connected_accounts_status_idx").on(table.status),
    index("connected_accounts_access_token_expires_at_idx").on(table.accessTokenExpiresAt),
  ],
);

export const connectedAccountsRelations = relations(connectedAccountsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [connectedAccountsTable.userId],
    references: [usersTable.id],
  }),
}));

export type ConnectedAccount = typeof connectedAccountsTable.$inferSelect;
export type NewConnectedAccount = typeof connectedAccountsTable.$inferInsert;
export type UpdateConnectedAccount = Partial<NewConnectedAccount>;
