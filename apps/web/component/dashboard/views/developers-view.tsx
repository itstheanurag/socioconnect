"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useNotification } from "@/context/notification-context";
import {
  createApiKey,
  getAccounts,
  getActivity,
  getApiKeys,
  getCurrentWorkspace,
  getQuotaSummary,
  revokeApiKey,
  rotateApiKey,
  type AccountSummary,
  type ActivityEvent,
  type ActivityPayload,
  type ApiKeySummary,
  type CreatedApiKey,
  type QuotaSummary,
  type WorkspaceSummary,
} from "@/lib/api-client";

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:8010/mcp";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const OAUTH_METADATA_URL = `${API_URL}/.well-known/oauth-protected-resource`;
const DOCS_URL = "https://github.com/itstheanurag/socioconnect/blob/main/docs/MCP.md";

type Tab = "keys" | "connect" | "activity";

interface ScopeGroup {
  label: string;
  tone: string;
  scopes: Array<{ value: string; label: string; description: string }>;
}

const SCOPE_GROUPS: ScopeGroup[] = [
  {
    label: "Profile & accounts",
    tone: "text-sky-300",
    scopes: [
      { value: "profile:read", label: "Profile", description: "Read the profile and workspace" },
      { value: "accounts:read", label: "Accounts", description: "List connected accounts" },
      { value: "accounts:write", label: "Account actions", description: "Health checks and sync" },
      {
        value: "destinations:read",
        label: "Destinations",
        description: "List subreddits, channels, pages",
      },
    ],
  },
  {
    label: "Content",
    tone: "text-rose-300",
    scopes: [
      { value: "posts:read", label: "Posts", description: "Read posts and dispatch status" },
      { value: "posts:write", label: "Drafts", description: "Create and edit drafts" },
      {
        value: "posts:publish",
        label: "Publish",
        description: "Create and confirm publish intents",
      },
      { value: "media:read", label: "Media read", description: "List media assets" },
      { value: "media:write", label: "Media write", description: "Upload and record media" },
    ],
  },
  {
    label: "Insights",
    tone: "text-emerald-300",
    scopes: [
      { value: "analytics:read", label: "Analytics", description: "Read performance data" },
      { value: "usage:read", label: "Usage", description: "Read plan usage and activity" },
      { value: "notifications:read", label: "Notifications", description: "Read notifications" },
    ],
  },
];

const DEFAULT_SCOPES = ["profile:read", "accounts:read", "posts:read", "posts:write"];

const ACTION_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  "api_key.created": { label: "API key created", icon: KeyRound, tone: "text-sky-300" },
  "api_key.revoked": { label: "API key revoked", icon: Trash2, tone: "text-rose-300" },
  "api_key.rotated": { label: "API key rotated", icon: RefreshCw, tone: "text-amber-300" },
  "post.created": { label: "Post created", icon: FileText, tone: "text-emerald-300" },
  "post.draft_created": { label: "Draft created", icon: FileText, tone: "text-neutral-300" },
  "post.updated": { label: "Draft updated", icon: FileText, tone: "text-neutral-300" },
  "post.cancelled": { label: "Post cancelled", icon: X, tone: "text-rose-300" },
  "publish_intent.created": {
    label: "Publish intent created",
    icon: Sparkles,
    tone: "text-amber-300",
  },
  "publish_intent.confirmed": { label: "Publish confirmed", icon: Send, tone: "text-emerald-300" },
  "dispatch.retried": { label: "Dispatch retried", icon: RefreshCw, tone: "text-amber-300" },
};

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function actorLabel(actorType: ActivityEvent["actorType"]): string {
  if (actorType === "api_key") return "API key";
  if (actorType === "oauth_client") return "Agent";
  if (actorType === "system") return "System";
  return "You";
}

function CopyField({ value, label }: { value: string; label: string }) {
  const { toast } = useNotification();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied", `${label} copied to clipboard.`);
    } catch {
      toast.error("Copy failed", "Select the value and copy it manually.");
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-300">
        {value}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors cursor-pointer"
        title={`Copy ${label}`}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CreateKeyModal({
  open,
  accounts,
  onClose,
  onCreated,
}: {
  open: boolean;
  accounts: AccountSummary[];
  onClose: () => void;
  onCreated: (created: CreatedApiKey) => void;
}) {
  const { toast } = useNotification();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(DEFAULT_SCOPES);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState("90");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setScopes(DEFAULT_SCOPES);
    setAccountIds([]);
    setExpiryDays("90");
    setError(null);
    setSubmitting(false);
  }, [open]);

  const toggleScope = (scope: string) => {
    setScopes((previous) =>
      previous.includes(scope) ? previous.filter((item) => item !== scope) : [...previous, scope],
    );
  };

  const toggleAccount = (accountId: string) => {
    setAccountIds((previous) =>
      previous.includes(accountId)
        ? previous.filter((item) => item !== accountId)
        : [...previous, accountId],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the key a name so you can recognize it later.");
      return;
    }
    if (scopes.length === 0) {
      setError("Select at least one scope.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const expiresAt =
        expiryDays === "never"
          ? undefined
          : new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString();

      const created = await createApiKey({
        name: name.trim(),
        scopes,
        accountIds,
        expiresAt,
      });

      onCreated(created);
      toast.success("API key created", "Copy the token now; it is shown only once.");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create the key.";
      setError(message);
      toast.error("Key creation failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-7 shadow-2xl scrollbar-thin"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-sky-300">
                  <KeyRound className="h-3 w-3" />
                  NEW CREDENTIAL
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-neutral-100">
                  Create an API key
                </h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Keys are workspace-scoped. The token is shown once and stored hashed.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="key-name">
                  Key name
                </label>
                <input
                  id="key-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Claude Code on laptop"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-rose-500/50 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">Scopes</label>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {scopes.length} selected
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SCOPE_GROUPS.map((group) => (
                    <div
                      key={group.label}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3"
                    >
                      <div
                        className={`mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider ${group.tone}`}
                      >
                        {group.label}
                      </div>
                      <div className="space-y-1.5">
                        {group.scopes.map((scope) => (
                          <label
                            key={scope.value}
                            className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1 hover:bg-neutral-800/50"
                          >
                            <input
                              type="checkbox"
                              checked={scopes.includes(scope.value)}
                              onChange={() => toggleScope(scope.value)}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-rose-500"
                            />
                            <span className="min-w-0">
                              <span className="block text-[11px] font-medium text-neutral-200">
                                {scope.label}
                              </span>
                              <span className="block text-[10px] leading-snug text-neutral-500">
                                {scope.description}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Keep <code className="font-mono text-neutral-300">posts:publish</code> on a
                  separate key when you want drafts-only agents.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">Account allowlist</label>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {accountIds.length === 0 ? "All accounts" : `${accountIds.length} selected`}
                  </span>
                </div>
                {accounts.length === 0 ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-3 text-[11px] text-neutral-500">
                    No connected accounts yet. You can leave this open; the key will use all
                    accounts connected later.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {accounts.map((account) => (
                      <label
                        key={account.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 hover:border-neutral-700"
                      >
                        <input
                          type="checkbox"
                          checked={accountIds.includes(account.id)}
                          onChange={() => toggleAccount(account.id)}
                          className="h-3.5 w-3.5 accent-rose-500"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-medium text-neutral-200">
                            @{account.username}
                          </span>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-500">
                            {account.platform}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300" htmlFor="key-expiry">
                  Expiry
                </label>
                <select
                  id="key-expiry"
                  value={expiryDays}
                  onChange={(event) => setExpiryDays(event.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-rose-500/50 focus:outline-hidden"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never expires</option>
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                {submitting ? "Creating…" : "Create key"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmActionModal({
  action,
  busy,
  onClose,
  onConfirm,
}: {
  action: { type: "revoke" | "rotate"; key: ApiKeySummary } | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-neutral-100">
                  {action.type === "revoke" ? "Revoke this key?" : "Rotate this key?"}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  {action.type === "revoke"
                    ? "Any agent using this key will stop working immediately. This cannot be undone."
                    : "A replacement key will be created and the old key will be revoked immediately."}
                </p>
                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-[11px] text-neutral-300">
                  {action.key.name} · {action.key.prefix}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer ${
                  action.type === "revoke"
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-amber-600 hover:bg-amber-500"
                }`}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : action.type === "revoke" ? (
                  <Trash2 className="h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {busy ? "Working…" : action.type === "revoke" ? "Revoke key" : "Rotate key"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function KeyCard({
  apiKey,
  accountCount,
  onRotate,
  onRevoke,
}: {
  apiKey: ApiKeySummary;
  accountCount: number;
  onRotate: () => void;
  onRevoke: () => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800">
            <KeyRound className="h-4 w-4 text-sky-300" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-neutral-100">{apiKey.name}</h3>
              <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                {apiKey.environment}
              </span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-neutral-500">{apiKey.prefix}…</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onRotate}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-amber-300 transition-colors cursor-pointer"
            title="Rotate key"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRevoke}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-rose-300 transition-colors cursor-pointer"
            title="Revoke key"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {apiKey.scopes.slice(0, 4).map((scope) => (
          <span
            key={scope}
            className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 font-mono text-[10px] text-neutral-300"
          >
            {scope}
          </span>
        ))}
        {apiKey.scopes.length > 4 && (
          <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 font-mono text-[10px] text-neutral-500">
            +{apiKey.scopes.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-800 pt-3 text-[10px] text-neutral-500">
        <div>
          <div className="font-mono uppercase tracking-wider">Last used</div>
          <div className="mt-0.5 text-neutral-300">
            {apiKey.lastUsedAt ? formatRelative(apiKey.lastUsedAt) : "Never"}
          </div>
        </div>
        <div>
          <div className="font-mono uppercase tracking-wider">Accounts</div>
          <div className="mt-0.5 text-neutral-300">
            {apiKey.accountIds.length === 0
              ? "All"
              : `${apiKey.accountIds.length} of ${accountCount}`}
          </div>
        </div>
        <div>
          <div className="font-mono uppercase tracking-wider">Created</div>
          <div className="mt-0.5 text-neutral-300">{formatDate(apiKey.createdAt)}</div>
        </div>
        <div>
          <div className="font-mono uppercase tracking-wider">Expires</div>
          <div className="mt-0.5 text-neutral-300">
            {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : "Never"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DevelopersView() {
  const { toast } = useNotification();
  const [tab, setTab] = useState<Tab>("keys");
  const [keys, setKeys] = useState<ApiKeySummary[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [activity, setActivity] = useState<ActivityPayload | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [quota, setQuota] = useState<QuotaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "revoke" | "rotate";
    key: ApiKeySummary;
  } | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [nextKeys, nextAccounts, nextActivity, nextWorkspace, nextQuota] = await Promise.all([
        getApiKeys(),
        getAccounts(),
        getActivity(24),
        getCurrentWorkspace(),
        getQuotaSummary(),
      ]);
      setKeys(nextKeys);
      setAccounts(nextAccounts);
      setActivity(nextActivity);
      setWorkspace(nextWorkspace);
      setQuota(nextQuota);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load developer settings.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeKeys = keys.length;
  const publishes = activity?.usage.publishesThisMonth ?? 0;
  const drafts = activity?.usage.draftsThisMonth ?? 0;
  const isLocalMcp = MCP_URL.includes("localhost") || MCP_URL.includes("127.0.0.1");

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied", `${label} copied to clipboard.`);
    } catch {
      toast.error("Copy failed", "Select the value and copy it manually.");
    }
  };

  const handleCreated = (created: CreatedApiKey) => {
    setCreatedKey(created);
    setKeys((previous) => [created.key, ...previous.filter((key) => key.id !== created.key.id)]);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionBusy(true);

    try {
      if (confirmAction.type === "revoke") {
        await revokeApiKey(confirmAction.key.id);
        setKeys((previous) => previous.filter((key) => key.id !== confirmAction.key.id));
        toast.success("Key revoked", "The credential can no longer be used.");
      } else {
        const rotated = await rotateApiKey(confirmAction.key.id);
        setKeys((previous) =>
          previous.map((key) => (key.id === confirmAction.key.id ? rotated.key : key)),
        );
        setCreatedKey(rotated);
        toast.success("Key rotated", "Copy the new token now.");
      }
      setConfirmAction(null);
      void load(true);
    } catch (err) {
      toast.error(
        "Action failed",
        err instanceof Error ? err.message : "Could not update the key.",
      );
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider text-sky-300">
            <Bot className="h-3 w-3" />
            AGENT PLATFORM
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
            API &amp; Agent Access
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-neutral-400 sm:text-sm">
            Give ChatGPT, Claude, and your own agents scoped access to draft, preview, and publish
            content. Publishing always requires a confirmed intent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-neutral-100 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Setup guide
          </a>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create API key
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Could not load developer settings</div>
            <div className="mt-0.5 text-rose-200/80">{error}</div>
          </div>
        </div>
      )}

      {createdKey && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/15">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-100">Copy this token now</h3>
                <p className="mt-0.5 text-[11px] text-emerald-200/70">
                  For security, it will not be shown again. Store it in your agent&apos;s secret
                  manager, not in chat.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreatedKey(null)}
              className="rounded-lg p-1.5 text-emerald-200/70 hover:bg-emerald-500/10 hover:text-emerald-100 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-emerald-500/20 bg-neutral-950 px-3 py-3 font-mono text-[11px] text-emerald-100">
              {createdKey.token}
            </code>
            <button
              type="button"
              onClick={() => void handleCopy(createdKey.token, "API token")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy token
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Active keys", value: activeKeys, icon: KeyRound, tone: "text-sky-300" },
          { label: "Publishes this month", value: publishes, icon: Send, tone: "text-emerald-300" },
          { label: "Drafts this month", value: drafts, icon: FileText, tone: "text-neutral-300" },
          {
            label: "MCP endpoint",
            value: isLocalMcp ? "Local" : "Live",
            icon: Radio,
            tone: isLocalMcp ? "text-amber-300" : "text-emerald-300",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg backdrop-blur-xl"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                <span>{stat.label}</span>
                <Icon className={`h-3.5 w-3.5 ${stat.tone}`} />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-neutral-100">
                {loading ? "—" : stat.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-1">
        {[
          { id: "keys" as Tab, label: "API keys", icon: KeyRound },
          { id: "connect" as Tab, label: "Connect agents", icon: Bot },
          { id: "activity" as Tab, label: "Activity", icon: Activity },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                active
                  ? "bg-neutral-800 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-rose-300" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/60 py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
            <span className="font-mono text-xs text-neutral-500">Loading agent access…</span>
          </div>
        </div>
      ) : tab === "keys" ? (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            {keys.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
                  <KeyRound className="h-5 w-5 text-neutral-500" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-neutral-100">
                  No API keys yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-neutral-400">
                  Create a scoped key for Claude Code, a CLI, or a private agent. Keys can be
                  restricted to specific accounts and revoked at any time.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create your first key
                </button>
              </div>
            ) : (
              keys.map((apiKey) => (
                <KeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  accountCount={accounts.length}
                  onRotate={() => setConfirmAction({ type: "rotate", key: apiKey })}
                  onRevoke={() => setConfirmAction({ type: "revoke", key: apiKey })}
                />
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Key hygiene
              </h3>
              <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-neutral-400">
                <p>
                  Drafting and publishing are separate scopes. Give a content agent{" "}
                  <code className="font-mono text-neutral-300">posts:write</code> and keep{" "}
                  <code className="font-mono text-neutral-300">posts:publish</code> for an agent
                  that handles approved intents.
                </p>
                <p>
                  Use the account allowlist for client or brand-specific agents. A key with no
                  allowlist can use every account connected to the workspace.
                </p>
                <p>
                  Rotate a key if it was pasted into a chat, log, or shared document. Rotation
                  revokes the old key immediately.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                  <Clock className="h-4 w-4 text-amber-300" />
                  Workspace
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {workspace?.role ?? "owner"}
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-3 py-3">
                <div className="text-xs font-semibold text-neutral-100">
                  {workspace?.name ?? "Personal workspace"}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-neutral-500">
                  {workspace?.id ?? "—"}
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                API keys and OAuth grants are scoped to this workspace. Team workspaces can share
                agent access without sharing a personal login.
              </p>
            </div>
          </div>
        </div>
      ) : tab === "connect" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Radio className="h-4 w-4 text-rose-300" />
              MCP endpoint
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              Use this URL for ChatGPT, Claude, Codex, Cursor, and Claude Code. The endpoint
              discovers OAuth automatically.
            </p>
            <div className="mt-3">
              <CopyField value={MCP_URL} label="MCP URL" />
            </div>
            <div className="mt-2">
              <CopyField value={OAUTH_METADATA_URL} label="OAuth metadata URL" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-neutral-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLocalMcp ? "bg-amber-400" : "bg-emerald-400"}`}
              />
              {isLocalMcp ? "Local development endpoint" : "Live endpoint"}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Lock className="h-4 w-4 text-emerald-300" />
              Authentication
            </div>
            <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-neutral-400">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-semibold text-neutral-200">ChatGPT / Claude (OAuth)</div>
                <p className="mt-1">
                  Add the MCP URL as a connector and sign in. The client registers itself, redirects
                  to the consent page, and receives a workspace-scoped token.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-semibold text-neutral-200">CLI / private agents (API key)</div>
                <p className="mt-1">
                  Use{" "}
                  <code className="font-mono text-neutral-300">Authorization: Bearer sck_...</code>.
                  API keys are easier for scripts and never involve a browser.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Sparkles className="h-4 w-4 text-amber-300" />
              ChatGPT
            </div>
            <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-neutral-400">
              <li>1. Open ChatGPT plugin settings and add a custom MCP server.</li>
              <li>2. Paste the MCP endpoint above.</li>
              <li>3. Sign in and approve the requested scopes.</li>
              <li>4. Ask it to draft a post, review the preview card, then approve.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Terminal className="h-4 w-4 text-sky-300" />
              Claude Code / CLI
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              Add the same MCP endpoint, then set an API key for scripted access.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-[10px] leading-relaxed text-neutral-300">
              {`claude mcp add --transport http socioconnect ${MCP_URL}

export SOCIOCONNECT_API_KEY=sck_test_...

curl ${API_URL}/v1/accounts \\
  -H "Authorization: Bearer $SOCIOCONNECT_API_KEY"`}
            </pre>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 lg:col-span-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div className="text-[11px] leading-relaxed text-amber-100/80">
                <div className="font-semibold text-amber-100">Publishing is still explicit</div>
                <p className="mt-1">
                  Connecting an agent does not give it permission to post silently. Agents create
                  drafts and publish intents; a human confirms the intent before anything goes live.
                  Agents cannot connect accounts — use the Connect page for that.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <Activity className="h-4 w-4 text-rose-300" />
                Recent agent activity
              </h3>
              <button
                type="button"
                onClick={() => void load(true)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 cursor-pointer"
                title="Refresh activity"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {!activity || activity.events.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
                  <Activity className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="mt-3 text-xs font-medium text-neutral-300">No activity yet</div>
                <p className="mt-1 max-w-xs text-[11px] text-neutral-500">
                  Create a key or connect an agent, then drafts, intents, and publishes will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-neutral-800/80">
                {activity.events.map((event) => {
                  const meta = ACTION_META[event.action] ?? {
                    label: event.action.replace(/\./g, " "),
                    icon: Activity,
                    tone: "text-neutral-300",
                  };
                  const Icon = meta.icon;
                  const details = Object.entries(event.metadata || {}).filter(([key]) =>
                    ["mode", "postId", "destinations", "scopes", "status"].includes(key),
                  );

                  return (
                    <div key={event.id} className="flex items-start gap-3 py-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950">
                        <Icon className={`h-3.5 w-3.5 ${meta.tone}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-neutral-200">{meta.label}</span>
                          <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                            {actorLabel(event.actorType)}
                          </span>
                        </div>
                        {details.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-neutral-500">
                            {details.map(([key, value]) => (
                              <span key={key}>
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-1 font-mono text-[10px] text-neutral-600">
                          {formatRelative(event.createdAt)}
                          {event.resourceId ? ` · ${event.resourceId.slice(0, 8)}…` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <FileText className="h-4 w-4 text-emerald-300" />
                This month
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: "Publishes",
                    value: publishes,
                    max: quota?.monthlyDrops.max ?? 300,
                  },
                  {
                    label: "AI credits",
                    value: activity?.usage.aiCreditsThisMonth ?? 0,
                    max: quota?.aiAdaptations.max ?? 500,
                  },
                ].map((item) => {
                  const pct = Math.min(100, Math.round((item.value / item.max) * 100));
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                        <span>{item.label}</span>
                        <span className="text-neutral-300">
                          {item.value} / {item.max}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-rose-500 to-red-500"
                          style={{ width: `${Math.max(pct, item.value > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between border-t border-neutral-800 pt-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  <span>Drafts created</span>
                  <span className="text-neutral-300">{drafts}</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-neutral-500">
                Usage is recorded per workspace. Retries do not consume additional publish
                operations. Plan limits are enforced by the API.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <Lock className="h-4 w-4 text-sky-300" />
                What gets recorded
              </h3>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-neutral-400">
                <li>Key creation, rotation, and revocation</li>
                <li>Drafts, edits, cancellations, and retries</li>
                <li>Publish intents and confirmations</li>
                <li>Actor type, IP, user agent, and request ID</li>
              </ul>
              <p className="mt-3 text-[10px] text-neutral-500">
                Post bodies and secrets are never stored in the audit ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      <CreateKeyModal
        open={createOpen}
        accounts={accounts}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <ConfirmActionModal
        action={confirmAction}
        busy={actionBusy}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => void handleConfirmAction()}
      />
    </div>
  );
}
