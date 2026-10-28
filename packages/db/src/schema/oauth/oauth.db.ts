import { boolean, index, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "@/schema/users/users.db";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";

export const oauthSchema = pgSchema("oauth");

export const oauthClientsTable = oauthSchema.table(
  "oauth_clients",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    clientId: text("client_id").notNull(),
    clientSecretHash: text("client_secret_hash"),
    clientName: text("client_name").notNull(),
    clientUri: text("client_uri"),
    logoUri: text("logo_uri"),
    redirectUris: text("redirect_uris").array().notNull().default([]),
    grantTypes: text("grant_types").array().notNull().default(["authorization_code"]),
    responseTypes: text("response_types").array().notNull().default(["code"]),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method").notNull().default("none"),
    scopes: text("scopes").array().notNull().default([]),
    isDynamic: boolean("is_dynamic").notNull().default(true),
    metadataUrl: text("metadata_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("oauth_clients_client_id_idx").on(table.clientId),
    index("oauth_clients_created_at_idx").on(table.createdAt),
  ],
);

export const oauthAuthorizationCodesTable = oauthSchema.table(
  "oauth_authorization_codes",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    codeHash: text("code_hash").notNull(),
    clientId: text("client_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    redirectUri: text("redirect_uri").notNull(),
    scopes: text("scopes").array().notNull().default([]),
    codeChallenge: text("code_challenge").notNull(),
    codeChallengeMethod: text("code_challenge_method").notNull().default("S256"),
    resource: text("resource").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("oauth_authorization_codes_code_hash_idx").on(table.codeHash),
    index("oauth_authorization_codes_client_id_idx").on(table.clientId),
    index("oauth_authorization_codes_expires_at_idx").on(table.expiresAt),
  ],
);

export const oauthRefreshTokensTable = oauthSchema.table(
  "oauth_refresh_tokens",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull(),
    clientId: text("client_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    scopes: text("scopes").array().notNull().default([]),
    resource: text("resource").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    rotatedFrom: uuid("rotated_from"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("oauth_refresh_tokens_token_hash_idx").on(table.tokenHash),
    index("oauth_refresh_tokens_client_id_idx").on(table.clientId),
    index("oauth_refresh_tokens_user_id_idx").on(table.userId),
    index("oauth_refresh_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export const oauthClientsRelations = relations(oauthClientsTable, ({ many }) => ({
  authorizationCodes: many(oauthAuthorizationCodesTable),
  refreshTokens: many(oauthRefreshTokensTable),
}));

export const oauthAuthorizationCodesRelations = relations(
  oauthAuthorizationCodesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oauthAuthorizationCodesTable.userId],
      references: [usersTable.id],
    }),
    workspace: one(workspacesTable, {
      fields: [oauthAuthorizationCodesTable.workspaceId],
      references: [workspacesTable.id],
    }),
  }),
);

export const oauthRefreshTokensRelations = relations(oauthRefreshTokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [oauthRefreshTokensTable.userId],
    references: [usersTable.id],
  }),
  workspace: one(workspacesTable, {
    fields: [oauthRefreshTokensTable.workspaceId],
    references: [workspacesTable.id],
  }),
}));

export type OAuthClient = typeof oauthClientsTable.$inferSelect;
export type NewOAuthClient = typeof oauthClientsTable.$inferInsert;
export type OAuthAuthorizationCode = typeof oauthAuthorizationCodesTable.$inferSelect;
export type NewOAuthAuthorizationCode = typeof oauthAuthorizationCodesTable.$inferInsert;
export type OAuthRefreshToken = typeof oauthRefreshTokensTable.$inferSelect;
export type NewOAuthRefreshToken = typeof oauthRefreshTokensTable.$inferInsert;
