import { index, integer, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { mediaSchema } from "./index";
import { usersTable } from "../users/users.db";

export enum MediaTypeEnum {
  IMAGE = "image",
  VIDEO = "video",
  GIF = "gif",
  AUDIO = "audio",
}

export const mediaTypePgEnum = pgEnum(
  "media_type",
  enumToPgEnum(MediaTypeEnum),
);

export const mediaAssetsTable = mediaSchema.table(
  "media_assets",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(), // S3/R2 storage key
    type: mediaTypePgEnum("type").notNull().default(MediaTypeEnum.IMAGE),
    mimeType: text("mime_type").notNull(),

    sizeBytes: integer("size_bytes"),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: integer("duration_seconds"),
    thumbnailUrl: text("thumbnail_url"),
    altText: text("alt_text"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("media_user_id_idx").on(table.userId),
    index("media_type_idx").on(table.type),
    index("media_created_at_idx").on(table.createdAt),
  ],
);

export const mediaAssetsRelations = relations(mediaAssetsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [mediaAssetsTable.userId],
    references: [usersTable.id],
  }),
}));

export type MediaAsset = typeof mediaAssetsTable.$inferSelect;
export type NewMediaAsset = typeof mediaAssetsTable.$inferInsert;
export type UpdateMediaAsset = Partial<NewMediaAsset>;
