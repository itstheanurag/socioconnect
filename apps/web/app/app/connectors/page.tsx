"use client";

import { useState } from "react";
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Sparkles,
} from "lucide-react";
import { PlatformIcon } from "../../../components/landing/platform-icons";

interface Connector {
  id: string;
  platform: string;
  name: string;
  accountHandle: string;
  avatarUrl?: string;
  status: "connected" | "disconnected" | "action_required";
  scopes: string[];
  tokenExpires: string;
  lastSync: string;
  defaultPrivacy: "public" | "unlisted";
  supportsVideo: boolean;
  supportsThreads: boolean;
}

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: "youtube",
    platform: "youtube",
    name: "YouTube",
    accountHandle: "Alex Rivers Studio",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["youtube.upload", "youtube.readonly", "community.manage"],
    tokenExpires: "29 days left (auto-refresh)",
    lastSync: "4 mins ago",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: false,
  },
  {
    id: "instagram",
    platform: "instagram",
    name: "Instagram",
    accountHandle: "@alex.creates",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["instagram_content_publish", "instagram_manage_insights"],
    tokenExpires: "58 days left",
    lastSync: "12 mins ago",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: false,
  },
  {
    id: "linkedin",
    platform: "linkedin",
    name: "LinkedIn",
    accountHandle: "Alex Rivers",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["w_member_social", "r_liteprofile"],
    tokenExpires: "82 days left",
    lastSync: "25 mins ago",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: false,
  },
  {
    id: "x",
    platform: "x",
    name: "X (Twitter)",
    accountHandle: "@alex_builds",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["tweet.read", "tweet.write", "users.read"],
    tokenExpires: "permanent (delegated token)",
    lastSync: "1 min ago",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: true,
  },
  {
    id: "tiktok",
    platform: "tiktok",
    name: "TikTok",
    accountHandle: "@alex_creates",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["video.upload", "video.publish"],
    tokenExpires: "14 days left",
    lastSync: "1 hour ago",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: false,
  },
  {
    id: "threads",
    platform: "threads",
    name: "Threads",
    accountHandle: "@alex.creates",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "connected",
    scopes: ["threads_basic", "threads_content_publish"],
    tokenExpires: "45 days left",
    lastSync: "30 mins ago",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: true,
  },
  {
    id: "twitch",
    platform: "twitch",
    name: "Twitch",
    accountHandle: "alex_codes",
    status: "disconnected",
    scopes: ["channel:manage:broadcast", "chat:read"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: false,
  },
  {
    id: "peerlist",
    platform: "peerlist",
    name: "Peerlist",
    accountHandle: "alex_rivers",
    status: "disconnected",
    scopes: ["post:publish", "profile:read"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: false,
  },
  {
    id: "reddit",
    platform: "reddit",
    name: "Reddit",
    accountHandle: "u/alex_dev",
    status: "disconnected",
    scopes: ["submit", "identity"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: false,
  },
  {
    id: "bluesky",
    platform: "bluesky",
    name: "Bluesky",
    accountHandle: "alex.bsky.social",
    status: "disconnected",
    scopes: ["atproto:post"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: false,
  },
  {
    id: "pinterest",
    platform: "pinterest",
    name: "Pinterest",
    accountHandle: "alex_pins",
    status: "disconnected",
    scopes: ["boards:read", "pins:write"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: true,
    supportsThreads: false,
  },
  {
    id: "discord",
    platform: "discord",
    name: "Discord",
    accountHandle: "Creator Community Server",
    status: "disconnected",
    scopes: ["bot", "webhook.incoming"],
    tokenExpires: "n/a",
    lastSync: "never",
    defaultPrivacy: "public",
    supportsVideo: false,
    supportsThreads: false,
  },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [filter, setFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const connectedCount = connectors.filter((c) => c.status === "connected").length;

  const filteredConnectors =
    filter === "all"
      ? connectors
      : filter === "connected"
        ? connectors.filter((c) => c.status === "connected")
        : connectors.filter((c) => c.status !== "connected");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleConnect = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === connectorId) {
          const isConn = c.status === "connected";
          return {
            ...c,
            status: isConn ? "disconnected" : "connected",
            lastSync: isConn ? "never" : "just now",
            tokenExpires: isConn ? "n/a" : "60 days left (auto-refresh)",
          };
        }
        return c;
      }),
    );
    const target = connectors.find((c) => c.id === connectorId);
    showToast(
      target?.status === "connected"
        ? `Revoked access token for ${target.name}.`
        : `Connected ${target?.name} via official OAuth 2.0 PKCE!`,
    );
  };

  const handleTestPing = async (connectorId: string) => {
    setTestingId(connectorId);
    await new Promise((r) => setTimeout(r, 600));
    setTestingId(null);
    showToast(`OAuth token health check passed (200 OK) for ${connectorId}!`);
  };

  return (
    <div className="space-y-8 lowercase">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white font-mono text-xs px-4 py-2.5 rounded-md shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5 text-[#F4DCB4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ede8df] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2">
            <Link2 className="h-3 w-3 text-stone-800" />
            <span>oauth 2.0 delegated connectors</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-emerald-700 font-bold">{connectedCount} channels active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
            connected channels &amp; accounts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-2xl">
            manage your official account connections with zero password storage. each network
            connects via secure hardware-scoped tokens that you can revoke with one click anytime.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {(["all", "connected", "disconnected"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                filter === tab
                  ? "border-stone-900 bg-white font-bold text-stone-900 shadow-2xs"
                  : "border-[#ede8df] bg-white/60 text-stone-600 hover:border-stone-400"
              }`}
            >
              {tab === "all"
                ? `all (${connectors.length})`
                : tab === "connected"
                  ? `connected (${connectedCount})`
                  : `available (${connectors.length - connectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Security Callout Box */}
      <div className="border border-dashed border-secondary-border bg-secondary/20 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>zero password risk:</strong> all connections use official delegated tokens.
            socioconnect never sees or stores passwords.
          </span>
        </div>
        <span className="text-stone-500 shrink-0">encryption: AES-256-GCM</span>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => {
          const isConnected = connector.status === "connected";
          const isTesting = testingId === connector.id;

          return (
            <div
              key={connector.id}
              className={`border p-5 rounded-md transition-all flex flex-col justify-between space-y-4 ${
                isConnected
                  ? "border-[#ede8df] bg-white shadow-2xs hover:border-secondary-border"
                  : "border-[#ede8df] bg-white/60 opacity-85 hover:opacity-100"
              }`}
            >
              {/* Top Row: Icon, Name & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#ede8df] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#ede8df] bg-[#faf8f5] shadow-2xs shrink-0">
                      <PlatformIcon platform={connector.id} size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900 font-sans">
                        {connector.name}
                      </div>
                      <div className="font-mono text-xs text-stone-500">
                        {isConnected ? connector.accountHandle : "not connected"}
                      </div>
                    </div>
                  </div>

                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>offline</span>
                    </span>
                  )}
                </div>

                {/* Scopes & Token Details */}
                <div className="mt-3 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>token status:</span>
                    <span
                      className={isConnected ? "text-stone-800 font-semibold" : "text-stone-400"}
                    >
                      {connector.tokenExpires}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>last health ping:</span>
                    <span className="text-stone-700">{connector.lastSync}</span>
                  </div>

                  {/* Scopes Tag Strip */}
                  <div className="pt-1">
                    <span className="text-[10px] text-stone-400 block mb-1">
                      authorized scopes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {connector.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="text-[10px] bg-[#faf8f5] border border-[#ede8df] px-1.5 py-0.2 rounded-xs text-stone-600"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-dashed border-[#ede8df] flex items-center justify-between gap-2 font-mono text-xs">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestPing(connector.id)}
                      className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors p-1.5 hover:bg-[#faf8f5] rounded-sm cursor-pointer disabled:opacity-50"
                      title="Test token validity"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isTesting ? "animate-spin text-stone-800" : ""}`}
                      />
                      <span className="text-[11px]">{isTesting ? "testing..." : "test ping"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleConnect(connector.id)}
                      className="text-[11px] text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                    >
                      revoke access
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleConnect(connector.id)}
                    className="w-full flex items-center justify-center gap-2 border border-secondary-border bg-secondary p-2 font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-sm shadow-2xs cursor-pointer text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>connect {connector.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
