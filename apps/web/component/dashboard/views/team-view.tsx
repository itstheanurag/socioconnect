"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Check,
  Copy,
  Crown,
  Loader2,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useNotification } from "@/context/notification-context";
import {
  createWorkspace,
  deleteWorkspaceInvite,
  getCurrentWorkspace,
  getWorkspaceInvites,
  getWorkspaceMembers,
  getWorkspaces,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  switchWorkspace,
  updateWorkspaceMemberRole,
  type WorkspaceInviteSummary,
  type WorkspaceMemberSummary,
  type WorkspaceSummary,
} from "@/lib/api-client";

function initials(firstName: string, lastName: string | null): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function roleIcon(role: string) {
  if (role === "owner") return Crown;
  if (role === "admin") return Shield;
  return Users;
}

function roleTone(role: string): string {
  if (role === "owner") return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  if (role === "admin") return "border-sky-500/25 bg-sky-500/10 text-sky-200";
  return "border-neutral-700 bg-neutral-800 text-neutral-300";
}

export function TeamView() {
  const { toast } = useNotification();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [current, setCurrent] = useState<WorkspaceSummary | null>(null);
  const [members, setMembers] = useState<WorkspaceMemberSummary[]>([]);
  const [invites, setInvites] = useState<WorkspaceInviteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextWorkspaces, nextCurrent] = await Promise.all([
        getWorkspaces(),
        getCurrentWorkspace(),
      ]);
      setWorkspaces(nextWorkspaces);
      setCurrent(nextCurrent);

      if (nextCurrent) {
        const [nextMembers, nextInvites] = await Promise.all([
          getWorkspaceMembers(nextCurrent.id),
          getWorkspaceInvites(nextCurrent.id).catch(() => []),
        ]);
        setMembers(nextMembers);
        setInvites(nextInvites);
      }
    } catch (err) {
      toast.error("Could not load workspace", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentRole = current?.role ?? "member";
  const canManage = currentRole === "owner" || currentRole === "admin";

  const handleSwitch = async (workspace: WorkspaceSummary) => {
    if (workspace.id === current?.id) return;
    setBusy(workspace.id);
    try {
      await switchWorkspace(workspace.id);
      toast.success("Workspace switched", `Now using ${workspace.name}.`);
      window.location.reload();
    } catch (err) {
      toast.error("Switch failed", err instanceof Error ? err.message : undefined);
      setBusy(null);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newName.trim().length < 2) return;
    setBusy("create");
    try {
      const workspace = await createWorkspace(newName.trim());
      await switchWorkspace(workspace.id);
      toast.success("Workspace created", `${workspace.name} is ready.`);
      window.location.reload();
    } catch (err) {
      toast.error("Create failed", err instanceof Error ? err.message : undefined);
      setBusy(null);
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!current || !inviteEmail.trim()) return;
    setBusy("invite");
    try {
      const created = await inviteWorkspaceMember(current.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setAcceptUrl(created.acceptUrl);
      setInviteEmail("");
      toast.success("Invitation created", "Copy the invite link and send it to them.");
      const nextInvites = await getWorkspaceInvites(current.id);
      setInvites(nextInvites);
    } catch (err) {
      toast.error("Invite failed", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleRole = async (member: WorkspaceMemberSummary, role: "admin" | "member") => {
    if (!current) return;
    setBusy(member.userId);
    try {
      await updateWorkspaceMemberRole(current.id, member.userId, role);
      setMembers((previous) =>
        previous.map((item) => (item.userId === member.userId ? { ...item, role } : item)),
      );
      toast.success("Role updated", `${member.email} is now ${role}.`);
    } catch (err) {
      toast.error("Role update failed", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (member: WorkspaceMemberSummary) => {
    if (!current) return;
    if (!window.confirm(`Remove ${member.email} from this workspace?`)) return;
    setBusy(member.userId);
    try {
      await removeWorkspaceMember(current.id, member.userId);
      setMembers((previous) => previous.filter((item) => item.userId !== member.userId));
      toast.success("Member removed", member.email);
    } catch (err) {
      toast.error("Remove failed", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleRevokeInvite = async (invite: WorkspaceInviteSummary) => {
    if (!current) return;
    setBusy(invite.id);
    try {
      await deleteWorkspaceInvite(current.id, invite.id);
      setInvites((previous) => previous.filter((item) => item.id !== invite.id));
      toast.success("Invitation revoked", invite.email);
    } catch (err) {
      toast.error("Revoke failed", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied", `${label} copied.`);
    } catch {
      toast.error("Copy failed", "Copy it manually.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/60 py-24">
        <Loader2 className="h-5 w-5 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider text-sky-300">
            <Building2 className="h-3 w-3" />
            WORKSPACE
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
            Team &amp; Workspaces
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-neutral-400 sm:text-sm">
            Switch between personal and team workspaces, invite collaborators, and manage roles. API
            keys and agent grants stay scoped to one workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          New workspace
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Building2 className="h-4 w-4 text-rose-300" />
              Your workspaces
            </h2>
            <span className="font-mono text-[10px] text-neutral-500">{workspaces.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {workspaces.map((workspace) => {
              const active = workspace.id === current?.id;
              const RoleIcon = roleIcon(workspace.role);
              return (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => void handleSwitch(workspace)}
                  disabled={active || busy === workspace.id}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? "border-rose-500/30 bg-rose-500/10"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  } ${active ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-xs font-bold text-neutral-200">
                      {workspace.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-neutral-100">
                          {workspace.name}
                        </span>
                        {workspace.isPersonal && (
                          <span className="rounded-full border border-neutral-700 px-1.5 py-0.5 font-mono text-[8px] uppercase text-neutral-500">
                            personal
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                        <RoleIcon className="h-3 w-3" />
                        {workspace.role}
                      </span>
                    </span>
                  </span>
                  {active ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-1 text-[9px] font-mono uppercase text-rose-200">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : busy === workspace.id ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" />
                  ) : (
                    <span className="shrink-0 text-[10px] font-mono text-neutral-500">Switch</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Shield className="h-4 w-4 text-emerald-300" />
            Current access
          </h2>
          <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="text-xs font-semibold text-neutral-100">{current?.name ?? "—"}</div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${roleTone(currentRole)}`}
              >
                {currentRole}
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                {current?.id?.slice(0, 8)}…
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-neutral-400">
            <p>
              Owners manage roles, invites, and billing. Admins can invite members and remove
              members. Members can publish within the workspace.
            </p>
            <p>
              Switching updates the active workspace for the dashboard, API keys created here, and
              agent activity.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Users className="h-4 w-4 text-sky-300" />
              Members
            </h2>
            <span className="font-mono text-[10px] text-neutral-500">{members.length}</span>
          </div>

          <div className="mt-4 divide-y divide-neutral-800/80">
            {members.map((member) => {
              const RoleIcon = roleIcon(member.role);
              return (
                <div key={member.userId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-[10px] font-bold text-neutral-200">
                      {initials(member.firstName, member.lastName)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-neutral-100">
                        {member.firstName} {member.lastName ?? ""}
                      </div>
                      <div className="truncate font-mono text-[10px] text-neutral-500">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {member.role === "owner" ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${roleTone(member.role)}`}
                      >
                        <RoleIcon className="h-3 w-3" /> owner
                      </span>
                    ) : canManage && currentRole === "owner" ? (
                      <select
                        value={member.role}
                        onChange={(event) =>
                          void handleRole(member, event.target.value as "admin" | "member")
                        }
                        disabled={busy === member.userId}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-[10px] text-neutral-300"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${roleTone(member.role)}`}
                      >
                        {member.role}
                      </span>
                    )}

                    {canManage && member.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => void handleRemove(member)}
                        disabled={busy === member.userId}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-rose-300"
                        title="Remove member"
                      >
                        {busy === member.userId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {canManage && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <UserPlus className="h-4 w-4 text-rose-300" />
                Invite a member
              </h2>
              <form onSubmit={handleInvite} className="mt-3 space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@company.com"
                    className="min-w-0 flex-1 bg-transparent text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as "admin" | "member")}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300"
                  >
                    <option value="member">Member</option>
                    {currentRole === "owner" && <option value="admin">Admin</option>}
                  </select>
                  <button
                    type="submit"
                    disabled={busy === "invite"}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                  >
                    {busy === "invite" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    Invite
                  </button>
                </div>
              </form>

              {acceptUrl && (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-200">
                      Invite link
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy(acceptUrl, "Invite link")}
                      className="rounded-lg p-1 text-emerald-200 hover:bg-emerald-500/10"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <code className="mt-1 block truncate font-mono text-[10px] text-emerald-100/80">
                    {acceptUrl}
                  </code>
                </div>
              )}

              <p className="mt-3 text-[10px] leading-relaxed text-neutral-500">
                Email delivery is not wired yet. Copy the link and send it directly. Invites expire
                after 7 days and must be accepted with the invited email address.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Mail className="h-4 w-4 text-amber-300" />
              Pending invitations
            </h2>
            {invites.length === 0 ? (
              <p className="mt-3 text-[11px] text-neutral-500">No pending invitations.</p>
            ) : (
              <div className="mt-3 divide-y divide-neutral-800/80">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] text-neutral-200">{invite.email}</div>
                      <div className="font-mono text-[9px] uppercase text-neutral-500">
                        {invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => void handleRevokeInvite(invite)}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-rose-300"
                        title="Revoke invite"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setCreateOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onSubmit={handleCreate}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-neutral-100">
                    Create workspace
                  </h3>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Team workspaces keep accounts, posts, keys, and usage separate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Acme Content Team"
                className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-rose-500/50 focus:outline-hidden"
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl border border-neutral-800 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy === "create" || newName.trim().length < 2}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                >
                  {busy === "create" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
