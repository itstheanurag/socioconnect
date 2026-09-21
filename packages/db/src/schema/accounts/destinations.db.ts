import { boolean, index, integer, jsonb, pgEnum, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { accountsSchema } from "./index";
import { connectedAccountsTable, socialPlatformPgEnum } from "./accounts.db";

export enum DestinationTypeEnum {
  PROFILE = "profile",
  SUBREDDIT = "subreddit",
  CHANNEL = "channel",
  GROUP = "group",
  PAGE = "page",
  BOARD = "board",
  COMMUNITY = "community",
  PLAYLIST = "playlist",
}

export const destinationTypePgEnum = pgEnum(
  "destination_type",
  enumToPgEnum(DestinationTypeEnum),
);

export interface DestinationRequirementsData {
  requiresTitle?: boolean;
  requiresMedia?: boolean;
  requiresFlair?: boolean;
  allowedFlairs?: Array<{ id: string; name: string; color?: string }>;
  allowedMediaTypes?: Array<"image" | "video" | "link">;
  maxContentLength?: number;
}

export const connectedDestinationsTable = accountsSchema.table(
  "connected_destinations",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),

    externalId: text("external_id").notNull(), // e.g., "r/webdev", "channel:123456", "urn:li:organization:789"
    platform: socialPlatformPgEnum("platform").notNull(),
    type: destinationTypePgEnum("type").notNull().default(DestinationTypeEnum.PROFILE),
    name: text("name").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),

    parentContainerId: text("parent_container_id"), // e.g. Guild ID or Organization ID
    parentContainerName: text("parent_container_name"), // e.g. "SocioConnect Dev Guild"

    memberCount: integer("member_count").default(0),
    canPost: boolean("can_post").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),

    requirements: jsonb("requirements").$type<DestinationRequirementsData>().default({}),
    extra: jsonb("extra").$type<Record<string, unknown>>().default({}),

    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_account_destination_idx").on(table.accountId, table.externalId),
    index("destinations_account_id_idx").on(table.accountId),
    index("destinations_platform_type_idx").on(table.platform, table.type),
    index("destinations_is_default_idx").on(table.isDefault),
  ],
);

export const connectedDestinationsRelations = relations(connectedDestinationsTable, ({ one }) => ({
  account: one(connectedAccountsTable, {
    fields: [connectedDestinationsTable.accountId],
    references: [connectedAccountsTable.id],
  }),
}));

export type ConnectedDestination = typeof connectedDestinationsTable.$inferSelect;
export type NewConnectedDestination = typeof connectedDestinationsTable.$inferInsert;
export type UpdateConnectedDestination = Partial<NewConnectedDestination>;
