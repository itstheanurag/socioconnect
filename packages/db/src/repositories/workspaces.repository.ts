import { and, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import {
  workspaceMembersTable,
  workspacesTable,
  WorkspaceRole,
  type Workspace,
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
