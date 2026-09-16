"use client";

import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Hash,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  MoreHorizontal,
  Send,
  Settings2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlatformIcon } from "./landing/platform-icons";
import { useAuth } from "../lib/auth-context";

interface SocialAccount {
  id: string;
  platform: string;
  name: string;
  detail: string;
  limit: number;
  selected: boolean;
  reconnect?: boolean;
}

const accountSeed: SocialAccount[] = [
  {
    id: "youtube",
    platform: "youtube",
    name: "alex builds",
    detail: "community & shorts",
    limit: 5000,
    selected: true,
  },
  {
    id: "twitch",
    platform: "twitch",
    name: "alex_codes",
    detail: "twitch.tv/alex_codes",
    limit: 500,
    selected: true,
  },
  {
    id: "instagram",
    platform: "instagram",
    name: "alex creates",
    detail: "@alex.creates",
    limit: 2200,
    selected: true,
  },
  {
    id: "linkedin",
    platform: "linkedin",
    name: "alex rivers",
    detail: "creator profile",
    limit: 3000,
    selected: true,
  },
  {
    id: "x",
    platform: "x",
    name: "@alex_builds",
    detail: "creator account",
    limit: 280,
    selected: true,
  },
  {
    id: "peerlist",
    platform: "peerlist",
    name: "alex_rivers",
    detail: "maker spotlight",
    limit: 1000,
    selected: false,
  },
  {
    id: "reddit",
    platform: "reddit",
    name: "u/alex_dev",
    detail: "r/videos & r/webdev",
    limit: 4000,
    selected: false,
  },
];

function PlatformMark({ account }: { account: SocialAccount }) {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-xs border border-[#ede8df] bg-white shrink-0 shadow-2xs">
      <PlatformIcon platform={account.id} size={14} />
    </div>
  );
}

export function ComposerWorkbench() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [accounts, setAccounts] = useState(accountSeed);
  const [content, setContent] = useState(
    "a calm publishing workflow lets you share with your audience everywhere without getting lost in 8 different tabs.",
  );
  const [schedule, setSchedule] = useState(false);
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/app");
    }
  }, [isLoading, isAuthenticated, router]);

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => account.selected),
    [accounts],
  );
  const canPublish =
    selectedAccounts.length > 0 &&
    selectedAccounts.every((account) => content.length <= account.limit);

  function toggleAccount(id: string) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id && !account.reconnect
          ? { ...account, selected: !account.selected }
          : account,
      ),
    );
  }

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ""}`.toLowerCase()
    : "cr";
  const userFullName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.toLowerCase()
    : "creator workspace";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-mono text-xs text-stone-500 lowercase">
        loading creator studio...
      </div>
    );
  }

  return (
    <main className="shell lowercase">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="socioconnect home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>socioconnect</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <button className="nav-item nav-item--active" type="button">
            <FileText size={17} />
            <span>compose</span>
          </button>
          <button className="nav-item" type="button">
            <Layers3 size={17} />
            <span>posts</span>
            <b>12</b>
          </button>
          <button className="nav-item" type="button">
            <UsersRound size={17} />
            <span>accounts</span>
          </button>
          <button className="nav-item" type="button">
            <Settings2 size={17} />
            <span>settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button
            className="workspace-switcher"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="avatar avatar--small">{userInitials}</span>
            <span>
              <strong>{userFullName}</strong>
              <small>{user?.email?.toLowerCase() || "creator account"}</small>
            </span>
            <ChevronDown size={15} />
          </button>

          {showUserMenu && (
            <div className="mt-2 border border-[#ede8df] bg-white p-2 rounded-xs shadow-md font-mono text-xs space-y-1">
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-[#faf8f5] text-red-600 flex items-center gap-2 rounded-xs cursor-pointer"
              >
                <LogOut size={13} />
                <span>sign out</span>
              </button>
            </div>
          )}

          <button className="upgrade-link" type="button">
            <Sparkles size={15} />
            <span>upgrade plan</span>
          </button>
        </div>
      </aside>

      <section className="app-frame">
        <header className="topbar">
          <div className="crumb">
            <LayoutDashboard size={15} />
            <span>creator studio</span>
            <i>/</i>
            <strong>new post</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
              title="notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <button
              className="avatar cursor-pointer"
              type="button"
              aria-label="Open user menu"
              onClick={() => {
                void logout();
              }}
              title={`logged in as ${userFullName} - click to sign out`}
            >
              {userInitials}
            </button>
          </div>
        </header>

        <div className="workspace">
          <section className="compose-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">create / 01</p>
                <h1>new post</h1>
              </div>
              <button className="draft-button" type="button">
                <MoreHorizontal size={18} /> save draft
              </button>
            </div>

            <div className="target-band">
              <div className="target-band-header">
                <span className="label">channels</span>
                <span className="hint">select where you want to share your post</span>
              </div>
              <div className="target-pill-row">
                {accounts.map((account) => {
                  const isSelected = account.selected;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => toggleAccount(account.id)}
                      className={`target-pill ${isSelected ? "target-pill--selected" : ""}`}
                    >
                      <PlatformMark account={account} />
                      <span className="target-pill-name">{account.platform}</span>
                      {isSelected && <Check size={13} className="target-pill-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="editor-card">
              <div className="editor-header">
                <span className="editor-tab">primary copy</span>
                <div className="editor-counters">
                  <span>{content.length} characters</span>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setQueued(false);
                }}
                rows={7}
                placeholder="write your announcement, launch story, or stream drop..."
                className="editor-textarea"
              />
              <div className="editor-toolbar">
                <div className="editor-tools">
                  <button type="button" className="tool-button" title="attach media">
                    <ImagePlus size={16} /> attach
                  </button>
                  <button type="button" className="tool-button" title="insert hashtag">
                    <Hash size={16} /> tag
                  </button>
                  <button type="button" className="tool-button" title="insert link">
                    <LinkIcon size={16} /> link
                  </button>
                </div>
                <div className="editor-actions">
                  <button
                    type="button"
                    onClick={() => setSchedule(!schedule)}
                    className={`schedule-button ${schedule ? "schedule-button--active" : ""}`}
                  >
                    <Clock3 size={15} />
                    <span>{schedule ? "staggered peak hours" : "simultaneous"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canPublish}
                    onClick={() => setQueued(true)}
                    className="publish-button"
                  >
                    <Send size={15} />
                    <span>{schedule ? "schedule queue" : "publish now"}</span>
                  </button>
                </div>
              </div>
            </div>

            {queued && (
              <div className="success-banner">
                <Check size={16} />
                <span>
                  post scheduled successfully across {selectedAccounts.length} channels with 100%
                  private account safety.
                </span>
              </div>
            )}
          </section>

          <aside className="inspect-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">preview</p>
                <h2>character limits</h2>
              </div>
            </div>

            <div className="channel-list">
              {accounts.map((account) => {
                const remaining = account.limit - content.length;
                const isOver = remaining < 0;
                return (
                  <div
                    key={account.id}
                    className={`channel-card ${account.selected ? "channel-card--active" : ""}`}
                  >
                    <div className="channel-card-header">
                      <PlatformMark account={account} />
                      <div className="channel-info">
                        <strong>{account.platform}</strong>
                        <small>{account.detail}</small>
                      </div>
                      <span className={`channel-budget ${isOver ? "channel-budget--danger" : ""}`}>
                        {remaining} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
