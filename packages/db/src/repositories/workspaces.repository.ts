import { and, desc, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import {
  usersTable,
  workspaceInvitationsTable,
  workspaceMembersTable,
  workspacesTable,
  WorkspaceRole,
  type Workspace,
  type WorkspaceInvitation,
  type WorkspaceMember,
} from "@/schema";
import { logger } from "@repo/shared";

export namespace WorkspacesRepository {
  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<Workspace | null> {
    const queryClient = options?.tx || db;
    const workspace = await queryClient.query.workspacesTable.findFirst({
      where: and(eq(workspacesTable.id, id), isNull(workspacesTable.deletedAt)),
    });
    return workspace ?? null;
  }

  export async function findByOwnerId(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Workspace | null> {
    const queryClient = options?.tx || db;
    const workspace = await queryClient.query.workspacesTable.findFirst({
      where: and(
        eq(workspacesTable.ownerUserId, userId),
        eq(workspacesTable.isPersonal, true),
        isNull(workspacesTable.deletedAt),
      ),
    });
    return workspace ?? null;
  }

  export async function listForUser(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<Array<Workspace & { role: WorkspaceRole }>> {
    const queryClient = options?.tx || db;
    const rows = await queryClient
      .select({
        workspace: workspacesTable,
        role: workspaceMembersTable.role,
      })
      .from(workspaceMembersTable)
      .innerJoin(workspacesTable, eq(workspaceMembersTable.workspaceId, workspacesTable.id))
      .where(and(eq(workspaceMembersTable.userId, userId), isNull(workspacesTable.deletedAt)));

    return rows.map((row) => ({ ...row.workspace, role: row.role }));
  }

  export async function getMembership(
    workspaceId: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<WorkspaceMember | null> {
    const queryClient = options?.tx || db;
    const membership = await queryClient.query.workspaceMembersTable.findFirst({
      where: and(
        eq(workspaceMembersTable.workspaceId, workspaceId),
        eq(workspaceMembersTable.userId, userId),
      ),
    });
    return membership ?? null;
  }

  export async function createWorkspace(input: {
    name: string;
    slug: string;
    ownerUserId: string;
  }): Promise<Workspace> {
    return db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspacesTable)
        .values({
          name: input.name,
          slug: input.slug,
          ownerUserId: input.ownerUserId,
          isPersonal: false,
        })
        .returning();

      await tx.insert(workspaceMembersTable).values({
        workspaceId: workspace.id,
        userId: input.ownerUserId,
        role: WorkspaceRole.OWNER,
      });

      return workspace;
    });
  }

  export async function listMembers(workspaceId: string): Promise<
    Array<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string | null;
      avatar: string | null;
      role: WorkspaceRole;
      joinedAt: Date;
    }>
  > {
    const rows = await db
      .select({
        userId: workspaceMembersTable.userId,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avatar: usersTable.avatar,
        role: workspaceMembersTable.role,
        joinedAt: workspaceMembersTable.createdAt,
      })
      .from(workspaceMembersTable)
      .innerJoin(usersTable, eq(workspaceMembersTable.userId, usersTable.id))
      .where(eq(workspaceMembersTable.workspaceId, workspaceId));

    return rows as Array<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string | null;
      avatar: string | null;
      role: WorkspaceRole;
      joinedAt: Date;
    }>;
  }

  export async function addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembersTable)
      .values({ workspaceId, userId, role })
      .onConflictDoUpdate({
        target: [workspaceMembersTable.workspaceId, workspaceMembersTable.userId],
        set: { role },
      })
      .returning();
    return member;
  }

  export async function updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember | null> {
    const [member] = await db
      .update(workspaceMembersTable)
      .set({ role })
      .where(
        and(
          eq(workspaceMembersTable.workspaceId, workspaceId),
          eq(workspaceMembersTable.userId, userId),
        ),
      )
      .returning();
    return member ?? null;
  }

  export async function removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(workspaceMembersTable)
      .where(
        and(
          eq(workspaceMembersTable.workspaceId, workspaceId),
          eq(workspaceMembersTable.userId, userId),
        ),
      )
      .returning({ id: workspaceMembersTable.id });
    return rows.length > 0;
  }

  export async function createInvitation(input: {
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    tokenHash: string;
    invitedByUserId: string;
    expiresAt: Date;
  }): Promise<WorkspaceInvitation> {
    const [invite] = await db.insert(workspaceInvitationsTable).values(input).returning();
    return invite;
  }

  export async function listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return db.query.workspaceInvitationsTable.findMany({
      where: eq(workspaceInvitationsTable.workspaceId, workspaceId),
      orderBy: [desc(workspaceInvitationsTable.createdAt)],
    });
  }

  export async function findInvitationByTokenHash(
    tokenHash: string,
  ): Promise<WorkspaceInvitation | null> {
    const invite = await db.query.workspaceInvitationsTable.findFirst({
      where: eq(workspaceInvitationsTable.tokenHash, tokenHash),
    });
    return invite ?? null;
  }

  export async function acceptInvitation(id: string): Promise<WorkspaceInvitation | null> {
    const [invite] = await db
      .update(workspaceInvitationsTable)
      .set({ acceptedAt: new Date() })
      .where(
        and(eq(workspaceInvitationsTable.id, id), isNull(workspaceInvitationsTable.acceptedAt)),
      )
      .returning();
    return invite ?? null;
  }

  export async function deleteInvitation(id: string, workspaceId: string): Promise<boolean> {
    const rows = await db
      .delete(workspaceInvitationsTable)
      .where(
        and(
          eq(workspaceInvitationsTable.id, id),
          eq(workspaceInvitationsTable.workspaceId, workspaceId),
        ),
      )
      .returning({ id: workspaceInvitationsTable.id });
    return rows.length > 0;
  }

  /**
   * Returns the user's personal workspace, creating it on first use.
   *
   * This is intentionally lazy so existing users created before the workspace
   * model was introduced are migrated without a separate job.
   */
  export async function ensurePersonalWorkspace(
    userId: string,
    name = "Personal workspace",
    options?: { tx?: DBTransaction },
  ): Promise<Workspace> {
    const execute = async (tx: DBTransaction): Promise<Workspace> => {
      const existing = await findByOwnerId(userId, { tx });
      if (existing) {
        await tx
          .insert(workspaceMembersTable)
          .values({
            workspaceId: existing.id,
            userId,
            role: WorkspaceRole.OWNER,
          })
          .onConflictDoNothing({
            target: [workspaceMembersTable.workspaceId, workspaceMembersTable.userId],
          });
        return existing;
      }

      const [created] = await tx
        .insert(workspacesTable)
        .values({
          name,
          slug: `personal-${userId}`,
          ownerUserId: userId,
          isPersonal: true,
        })
        .returning();

      await tx
        .insert(workspaceMembersTable)
        .values({
          workspaceId: created.id,
          userId,
          role: WorkspaceRole.OWNER,
        })
        .onConflictDoNothing({
          target: [workspaceMembersTable.workspaceId, workspaceMembersTable.userId],
        });

      logger.audit("personal workspace created", {
        module: "workspaces",
        action: "repository:ensurePersonalWorkspace",
        userId,
        workspaceId: created.id,
      });

      return created;
    };

    if (options?.tx) {
      return execute(options.tx);
    }

    return db.transaction(execute);
  }
}
