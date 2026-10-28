import { WorkspacesRepository, WorkspaceRole } from "@repo/db";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import type { AuthContext } from "@/types";

/**
 * Resolves the workspace for the current request.
 *
 * API keys carry an explicit workspace. Browser sessions carry the active
 * workspace cookie; when it is absent we fall back to the personal workspace.
 */
export async function resolveWorkspaceId(userId: string, auth?: AuthContext): Promise<string> {
  if (auth?.workspaceId) {
    return auth.workspaceId;
  }

  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(userId);
  return workspace.id;
}

/**
 * Resolves the active workspace and verifies that the current user is a member.
 */
export async function resolveWorkspaceMembership(userId: string, auth?: AuthContext) {
  const workspaceId = await resolveWorkspaceId(userId, auth);
  const membership = await WorkspacesRepository.getMembership(workspaceId, userId);

  if (!membership) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: undefined,
      message: "You do not have access to this workspace",
    });
  }

  return { workspaceId, membership };
}

/**
 * Resolves the workspace whose subscription should be billed.
 *
 * Only workspace owners and admins can start checkout, open the billing portal,
 * cancel, or resume. Billing is deliberately session-only so an API key or MCP
 * client can never change a workspace plan.
 */
export async function resolveBillingWorkspace(userId: string, auth?: AuthContext): Promise<string> {
  if (auth?.type !== "session") {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: undefined,
      message: "Billing changes are only available from the dashboard",
    });
  }

  const { workspaceId, membership } = await resolveWorkspaceMembership(userId, auth);

  if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: undefined,
      message: "Only workspace owners and admins can manage billing",
    });
  }

  return workspaceId;
}
