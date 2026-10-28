import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { createRouter, errorResponseSchemas } from "@repo/shared";
import { WorkspacesRepository, WorkspaceRole } from "@repo/db";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";

const workspaceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  isPersonal: z.boolean(),
  role: z.enum(WorkspaceRole),
  createdAt: z.string(),
});

export const getCurrentWorkspaceRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/current",
  tags: ["Workspaces"],
  summary: "Get the current workspace",
  description:
    "Returns the active workspace for this request. API keys and OAuth grants are scoped to one workspace.",
  responses: {
    200: {
      description: "Workspace retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              workspace: workspaceSchema,
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetCurrentWorkspaceRoute = typeof getCurrentWorkspaceRoute;

export const getCurrentWorkspaceHandler: AppRouteHandler<GetCurrentWorkspaceRoute> = async (c) => {
  const user = c.get("user");
  const auth = c.var.auth;

  const workspace = auth?.workspaceId
    ? await WorkspacesRepository.findById(auth.workspaceId)
    : await WorkspacesRepository.ensurePersonalWorkspace(user.id, `${user.firstName}'s workspace`);

  if (!workspace) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Workspace not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  const membership = await WorkspacesRepository.getMembership(workspace.id, user.id);

  return c.json({
    message: "Workspace retrieved successfully",
    payload: {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        isPersonal: workspace.isPersonal,
        role: (membership?.role ?? WorkspaceRole.MEMBER) as WorkspaceRole,
        createdAt: workspace.createdAt.toISOString(),
      },
    },
  });
};

export const listWorkspacesRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces",
  tags: ["Workspaces"],
  summary: "List workspaces",
  responses: {
    200: {
      description: "Workspaces retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              workspaces: z.array(workspaceSchema),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListWorkspacesRoute = typeof listWorkspacesRoute;

export const listWorkspacesHandler: AppRouteHandler<ListWorkspacesRoute> = async (c) => {
  const user = c.get("user");

  await WorkspacesRepository.ensurePersonalWorkspace(user.id, `${user.firstName}'s workspace`);
  const workspaces = await WorkspacesRepository.listForUser(user.id);

  return c.json({
    message: "Workspaces retrieved successfully",
    payload: {
      workspaces: workspaces.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        isPersonal: workspace.isPersonal,
        role: workspace.role as WorkspaceRole,
        createdAt: workspace.createdAt.toISOString(),
      })),
    },
  });
};

export const workspaceRoutes = createRouter<AppBindings>();

workspaceRoutes.openapi(getCurrentWorkspaceRoute, getCurrentWorkspaceHandler);
workspaceRoutes.openapi(listWorkspacesRoute, listWorkspacesHandler);
