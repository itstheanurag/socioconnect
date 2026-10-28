import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { enumToPgEnum } from "@repo/shared";
import { usersTable } from "@/schema/users/users.db";

export const workspacesSchema = pgSchema("workspaces");

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export const workspaceRolePgEnum = pgEnum("workspace_role", enumToPgEnum(WorkspaceRole));

export const workspacesTable = workspacesSchema.table(
  "workspaces",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    isPersonal: boolean("is_personal").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("workspaces_slug_idx").on(table.slug),
    index("workspaces_owner_user_id_idx").on(table.ownerUserId),
  ],
);

export const workspaceMembersTable = workspacesSchema.table(
  "workspace_members",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: workspaceRolePgEnum("role").notNull().default(WorkspaceRole.MEMBER),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_idx").on(table.workspaceId, table.userId),
    index("workspace_members_user_id_idx").on(table.userId),
  ],
);

export const workspaceInvitationsTable = workspacesSchema.table(
  "workspace_invitations",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: workspaceRolePgEnum("role").notNull().default(WorkspaceRole.MEMBER),
    tokenHash: text("token_hash").notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_invitations_token_hash_idx").on(table.tokenHash),
    index("workspace_invitations_workspace_id_idx").on(table.workspaceId),
    index("workspace_invitations_email_idx").on(table.email),
  ],
);

export const workspacesRelations = relations(workspacesTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [workspacesTable.ownerUserId],
    references: [usersTable.id],
  }),
  members: many(workspaceMembersTable),
}));

export const workspaceMembersRelations = relations(workspaceMembersTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [workspaceMembersTable.workspaceId],
    references: [workspacesTable.id],
  }),
  user: one(usersTable, {
    fields: [workspaceMembersTable.userId],
    references: [usersTable.id],
  }),
}));

export type Workspace = typeof workspacesTable.$inferSelect;
export type NewWorkspace = typeof workspacesTable.$inferInsert;
export type UpdateWorkspace = Partial<NewWorkspace>;
export type WorkspaceMember = typeof workspaceMembersTable.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembersTable.$inferInsert;
export type WorkspaceInvitation = typeof workspaceInvitationsTable.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitationsTable.$inferInsert;
