import { WorkspacesRepository } from "@repo/db";
import type { AuthContext } from "@/types";

/**
 * Resolves the workspace for the current request.
 *
 * API keys carry an explicit workspace. Browser sessions currently map to the
 * user's personal workspace and will support workspace switching later.
 */
export async function resolveWorkspaceId(userId: string, auth?: AuthContext): Promise<string> {
  if (auth?.workspaceId) {
    return auth.workspaceId;
  }

  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(userId);
  return workspace.id;
}
