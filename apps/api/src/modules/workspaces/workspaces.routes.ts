import { createHash, randomBytes } from "node:crypto";
import { createRoute, z } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { createRouter, errorResponseSchemas, logger } from "@repo/shared";
import { StatusCodes } from "@repo/config";
import { UsersRepository, WorkspacesRepository, WorkspaceRole } from "@repo/db";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { recordAuditEvent } from "@/utils/events";
import { env } from "@/env";

const workspaceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  isPersonal: z.boolean(),
  role: z.enum(WorkspaceRole),
  createdAt: z.string(),
});

const memberSchema = z.object({
  userId: z.uuid(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.enum(WorkspaceRole),
  joinedAt: z.string(),
});

const inviteSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  role: z.enum(WorkspaceRole),
  expiresAt: z.string(),
  acceptedAt: z.string().nullable(),
  createdAt: z.string(),
});

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function requireManager(role: WorkspaceRole): void {
  if (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: new Response(JSON.stringify({ message: "Workspace admin access required" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    });
  }
}

async function getMembershipOrThrow(workspaceId: string, userId: string) {
  const membership = await WorkspacesRepository.getMembership(workspaceId, userId);
  if (!membership) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: new Response(JSON.stringify({ message: "Workspace not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    });
  }
  return membership;
}

export const getCurrentWorkspaceRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/current",
  tags: ["Workspaces"],
  summary: "Get the current workspace",
  responses: {
    200: {
      description: "Workspace retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ workspace: workspaceSchema }),
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
            payload: z.object({ workspaces: z.array(workspaceSchema) }),
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

export const createWorkspaceRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces",
  tags: ["Workspaces"],
  summary: "Create a team workspace",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ name: z.string().min(2).max(80) }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Workspace created",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ workspace: workspaceSchema }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreateWorkspaceRoute = typeof createWorkspaceRoute;

export const createWorkspaceHandler: AppRouteHandler<CreateWorkspaceRoute> = async (c) => {
  const user = c.get("user");
  const { name } = c.req.valid("json");

  const workspace = await WorkspacesRepository.createWorkspace({
    name,
    slug: `team-${randomBytes(5).toString("hex")}`,
    ownerUserId: user.id,
  });

  await recordAuditEvent(c, {
    action: "workspace.created",
    resourceType: "workspace",
    resourceId: workspace.id,
    metadata: { name: workspace.name },
  });

  return c.json(
    {
      message: "Workspace created successfully",
      payload: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          isPersonal: workspace.isPersonal,
          role: WorkspaceRole.OWNER,
          createdAt: workspace.createdAt.toISOString(),
        },
      },
    },
    StatusCodes.HTTP_201_CREATED,
  );
};

export const switchWorkspaceRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/switch",
  tags: ["Workspaces"],
  summary: "Switch the active workspace",
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    200: {
      description: "Workspace switched",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type SwitchWorkspaceRoute = typeof switchWorkspaceRoute;

export const switchWorkspaceHandler: AppRouteHandler<SwitchWorkspaceRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  await getMembershipOrThrow(id, user.id);

  setCookie(c, "workspace_id", id, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });

  return c.json({ message: "Workspace switched successfully" });
};

export const listMembersRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/members",
  tags: ["Workspaces"],
  summary: "List workspace members",
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    200: {
      description: "Members retrieved",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ members: z.array(memberSchema) }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListMembersRoute = typeof listMembersRoute;

export const listMembersHandler: AppRouteHandler<ListMembersRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  await getMembershipOrThrow(id, user.id);
  const members = await WorkspacesRepository.listMembers(id);

  return c.json({
    message: "Members retrieved successfully",
    payload: {
      members: members.map((member) => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
      })),
    },
  });
};

export const inviteMemberRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/invites",
  tags: ["Workspaces"],
  summary: "Invite a member to a workspace",
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.email(),
            role: z
              .enum([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER])
              .optional()
              .default(WorkspaceRole.MEMBER),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Invitation created",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ invite: inviteSchema, acceptUrl: z.string() }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type InviteMemberRoute = typeof inviteMemberRoute;

export const inviteMemberHandler: AppRouteHandler<InviteMemberRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const { email, role } = c.req.valid("json");
  const membership = await getMembershipOrThrow(id, user.id);
  requireManager(membership.role as WorkspaceRole);

  if (role === WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.OWNER) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json({ message: "Only the owner can invite admins" }, StatusCodes.HTTP_403_FORBIDDEN),
    });
  }

  const existing = await UsersRepository.findByEmail(email);
  if (existing) {
    const existingMembership = await WorkspacesRepository.getMembership(id, existing.id);
    if (existingMembership) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json({ message: "User is already a member" }, StatusCodes.HTTP_409_CONFLICT),
      });
    }
  }

  const token = randomBytes(32).toString("base64url");
  const invite = await WorkspacesRepository.createInvitation({
    workspaceId: id,
    email: email.toLowerCase(),
    role,
    tokenHash: hashToken(token),
    invitedByUserId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await recordAuditEvent(c, {
    action: "workspace.invite_created",
    resourceType: "workspace",
    resourceId: id,
    metadata: { email: invite.email, role: invite.role },
  });

  return c.json(
    {
      message: "Invitation created successfully",
      payload: {
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role as WorkspaceRole,
          expiresAt: invite.expiresAt.toISOString(),
          acceptedAt: null,
          createdAt: invite.createdAt.toISOString(),
        },
        acceptUrl: `${env.FRONTEND_URL}/team/accept?token=${token}`,
      },
    },
    StatusCodes.HTTP_201_CREATED,
  );
};

export const listInvitesRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/invites",
  tags: ["Workspaces"],
  summary: "List pending workspace invitations",
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    200: {
      description: "Invitations retrieved",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ invites: z.array(inviteSchema) }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListInvitesRoute = typeof listInvitesRoute;

export const listInvitesHandler: AppRouteHandler<ListInvitesRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const membership = await getMembershipOrThrow(id, user.id);
  requireManager(membership.role as WorkspaceRole);
  const invites = await WorkspacesRepository.listInvitations(id);

  return c.json({
    message: "Invitations retrieved successfully",
    payload: {
      invites: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role as WorkspaceRole,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
        createdAt: invite.createdAt.toISOString(),
      })),
    },
  });
};

export const acceptInviteRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspace-invites/{token}/accept",
  tags: ["Workspaces"],
  summary: "Accept a workspace invitation",
  request: { params: z.object({ token: z.string().min(1) }) },
  responses: {
    200: {
      description: "Invitation accepted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), payload: z.object({ workspaceId: z.uuid() }) }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type AcceptInviteRoute = typeof acceptInviteRoute;

export const acceptInviteHandler: AppRouteHandler<AcceptInviteRoute> = async (c) => {
  const user = c.get("user");
  const { token } = c.req.valid("param");
  const invite = await WorkspacesRepository.findInvitationByTokenHash(hashToken(token));

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Invitation is invalid or expired" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json(
        { message: "Sign in with the invited email address" },
        StatusCodes.HTTP_403_FORBIDDEN,
      ),
    });
  }

  await WorkspacesRepository.addMember(invite.workspaceId, user.id, invite.role as WorkspaceRole);
  await WorkspacesRepository.acceptInvitation(invite.id);

  await recordAuditEvent(c, {
    action: "workspace.invite_accepted",
    resourceType: "workspace",
    resourceId: invite.workspaceId,
    metadata: { role: invite.role },
  });

  return c.json({
    message: "Invitation accepted successfully",
    payload: { workspaceId: invite.workspaceId },
  });
};

export const updateMemberRoute = createRoute({
  method: "patch",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/members/{userId}",
  tags: ["Workspaces"],
  summary: "Update a member role",
  request: {
    params: z.object({ id: z.uuid(), userId: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Member updated",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type UpdateMemberRoute = typeof updateMemberRoute;

export const updateMemberHandler: AppRouteHandler<UpdateMemberRoute> = async (c) => {
  const user = c.get("user");
  const { id, userId } = c.req.valid("param");
  const { role } = c.req.valid("json");
  const membership = await getMembershipOrThrow(id, user.id);

  if (membership.role !== WorkspaceRole.OWNER) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json({ message: "Only the owner can change roles" }, StatusCodes.HTTP_403_FORBIDDEN),
    });
  }

  if (userId === user.id) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json({ message: "You cannot change your own role" }, StatusCodes.HTTP_400_BAD_REQUEST),
    });
  }

  await WorkspacesRepository.updateMemberRole(id, userId, role);
  return c.json({ message: "Member role updated" });
};

export const removeMemberRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/members/{userId}",
  tags: ["Workspaces"],
  summary: "Remove a workspace member",
  request: { params: z.object({ id: z.uuid(), userId: z.uuid() }) },
  responses: {
    200: {
      description: "Member removed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type RemoveMemberRoute = typeof removeMemberRoute;

export const removeMemberHandler: AppRouteHandler<RemoveMemberRoute> = async (c) => {
  const user = c.get("user");
  const { id, userId } = c.req.valid("param");
  const membership = await getMembershipOrThrow(id, user.id);
  requireManager(membership.role as WorkspaceRole);

  const workspace = await WorkspacesRepository.findById(id);
  if (workspace?.ownerUserId === userId) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        { message: "The workspace owner cannot be removed" },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }

  const removed = await WorkspacesRepository.removeMember(id, userId);
  if (!removed) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Member not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  return c.json({ message: "Member removed successfully" });
};

export const deleteInviteRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/workspaces/{id}/invites/{inviteId}",
  tags: ["Workspaces"],
  summary: "Revoke a pending invitation",
  request: { params: z.object({ id: z.uuid(), inviteId: z.uuid() }) },
  responses: {
    200: {
      description: "Invitation revoked",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type DeleteInviteRoute = typeof deleteInviteRoute;

export const deleteInviteHandler: AppRouteHandler<DeleteInviteRoute> = async (c) => {
  const user = c.get("user");
  const { id, inviteId } = c.req.valid("param");
  const membership = await getMembershipOrThrow(id, user.id);
  requireManager(membership.role as WorkspaceRole);

  const deleted = await WorkspacesRepository.deleteInvitation(inviteId, id);
  if (!deleted) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Invitation not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  return c.json({ message: "Invitation revoked successfully" });
};

export const workspaceRoutes = createRouter<AppBindings>();

workspaceRoutes.openapi(getCurrentWorkspaceRoute, getCurrentWorkspaceHandler);
workspaceRoutes.openapi(listWorkspacesRoute, listWorkspacesHandler);
workspaceRoutes.openapi(createWorkspaceRoute, createWorkspaceHandler);
workspaceRoutes.openapi(switchWorkspaceRoute, switchWorkspaceHandler);
workspaceRoutes.openapi(listMembersRoute, listMembersHandler);
workspaceRoutes.openapi(inviteMemberRoute, inviteMemberHandler);
workspaceRoutes.openapi(listInvitesRoute, listInvitesHandler);
workspaceRoutes.openapi(acceptInviteRoute, acceptInviteHandler);
workspaceRoutes.openapi(updateMemberRoute, updateMemberHandler);
workspaceRoutes.openapi(removeMemberRoute, removeMemberHandler);
workspaceRoutes.openapi(deleteInviteRoute, deleteInviteHandler);
