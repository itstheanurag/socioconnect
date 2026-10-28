import { index, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { postsSchema } from "./index";
import { postsTable } from "./posts.db";
import { usersTable } from "@/schema/users/users.db";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";
import { apiKeysTable } from "@/schema/api-keys/api-keys.db";

export enum PublishIntentStateEnum {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

export enum PublishIntentModeEnum {
  PUBLISH = "publish",
  SCHEDULE = "schedule",
}

export enum PublishIntentActorEnum {
  USER = "user",
  API_KEY = "api_key",
}

export const publishIntentStatePgEnum = pgEnum(
  "publish_intent_state",
  enumToPgEnum(PublishIntentStateEnum),
);

export const publishIntentModePgEnum = pgEnum(
  "publish_intent_mode",
  enumToPgEnum(PublishIntentModeEnum),
);

export const publishIntentActorPgEnum = pgEnum(
  "publish_intent_actor",
  enumToPgEnum(PublishIntentActorEnum),
);

export const publishIntentsTable = postsSchema.table(
  "publish_intents",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdByType: publishIntentActorPgEnum("created_by_type").notNull(),
    createdByKeyId: uuid("created_by_key_id").references(() => apiKeysTable.id, {
      onDelete: "set null",
    }),

    state: publishIntentStatePgEnum("state").notNull().default(PublishIntentStateEnum.PENDING),
    mode: publishIntentModePgEnum("mode").notNull(),
    draftRevisionHash: text("draft_revision_hash").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("publish_intents_workspace_id_idx").on(table.workspaceId),
    index("publish_intents_post_id_idx").on(table.postId),
    index("publish_intents_state_idx").on(table.state),
    index("publish_intents_expires_at_idx").on(table.expiresAt),
  ],
);

export const publishIntentsRelations = relations(publishIntentsTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [publishIntentsTable.workspaceId],
    references: [workspacesTable.id],
  }),
  post: one(postsTable, {
    fields: [publishIntentsTable.postId],
    references: [postsTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [publishIntentsTable.createdByUserId],
    references: [usersTable.id],
  }),
  createdByKey: one(apiKeysTable, {
    fields: [publishIntentsTable.createdByKeyId],
    references: [apiKeysTable.id],
  }),
}));

export type PublishIntent = typeof publishIntentsTable.$inferSelect;
export type NewPublishIntent = typeof publishIntentsTable.$inferInsert;
export type UpdatePublishIntent = Partial<NewPublishIntent>;
