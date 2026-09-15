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
  MoreHorizontal,
  Send,
  Settings2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PlatformIcon } from "./landing/platform-icons";

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
    platform: "YouTube",
    name: "Alex Builds",
    detail: "Community & Shorts",
    limit: 5000,
    selected: true,
  },
  {
    id: "twitch",
    platform: "Twitch",
    name: "alex_codes",
    detail: "twitch.tv/alex_codes",
    limit: 500,
    selected: true,
  },
  {
    id: "instagram",
    platform: "Instagram",
    name: "Alex Creates",
    detail: "@alex.creates",
    limit: 2200,
    selected: true,
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    name: "Alex Rivers",
    detail: "Founder Profile",
    limit: 3000,
    selected: true,
  },
  {
    id: "x",
    platform: "X",
    name: "@alex_builds",
    detail: "Creator Account",
    limit: 280,
    selected: true,
  },
  {
    id: "peerlist",
    platform: "Peerlist",
    name: "alex_rivers",
    detail: "Maker Spotlight",
    limit: 1000,
    selected: false,
  },
  {
    id: "reddit",
    platform: "Reddit",
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
  const [accounts, setAccounts] = useState(accountSeed);
  const [content, setContent] = useState(
    "A good publishing workflow should make every destination visible, not hide the hard parts behind one button.",
  );
  const [schedule, setSchedule] = useState(false);
  const [queued, setQueued] = useState(false);
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

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Socioconnect home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>SOCIOCONNECT</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <button className="nav-item nav-item--active" type="button">
            <FileText size={17} />
            <span>Compose</span>
          </button>
          <button className="nav-item" type="button">
            <Layers3 size={17} />
            <span>Posts</span>
            <b>12</b>
          </button>
          <button className="nav-item" type="button">
            <UsersRound size={17} />
            <span>Accounts</span>
          </button>
          <button className="nav-item" type="button">
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="workspace-switcher" type="button">
            <span className="avatar avatar--small">MR</span>
            <span>
              <strong>Maya Rao</strong>
              <small>Personal workspace</small>
            </span>
            <ChevronDown size={15} />
          </button>
          <button className="upgrade-link" type="button">
            <Sparkles size={15} />
            <span>Upgrade plan</span>
          </button>
        </div>
      </aside>

      <section className="app-frame">
        <header className="topbar">
          <div className="crumb">
            <LayoutDashboard size={15} />
            <span>Publishing desk</span>
            <i>/</i>
            <strong>New post</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <button className="avatar" type="button" aria-label="Open user menu">
              MR
            </button>
          </div>
        </header>

        <div className="workspace">
          <section className="compose-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">DISPATCH / 01</p>
                <h1>New post</h1>
              </div>
              <button className="draft-button" type="button">
                <MoreHorizontal size={18} /> Save draft
              </button>
            </div>

            <div className="target-band">
              <div className="target-band-header">
                <span className="label">Destinations</span>
                <span className="hint">Selected channels receive atomic dispatches</span>
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
                <span className="editor-tab">Primary copy</span>
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
                placeholder="Write your announcement, launch story, or stream drop..."
                className="editor-textarea"
              />
              <div className="editor-toolbar">
                <div className="editor-tools">
                  <button type="button" className="tool-button" title="Attach media">
                    <ImagePlus size={16} /> Attach
                  </button>
                  <button type="button" className="tool-button" title="Insert hashtag">
                    <Hash size={16} /> Tag
                  </button>
                  <button type="button" className="tool-button" title="Insert link">
                    <LinkIcon size={16} /> Link
                  </button>
                </div>
                <div className="editor-actions">
                  <button
                    type="button"
                    onClick={() => setSchedule(!schedule)}
                    className={`schedule-button ${schedule ? "schedule-button--active" : ""}`}
                  >
                    <Clock3 size={15} />
                    <span>{schedule ? "Staggered Peak Hours" : "Simultaneous"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canPublish}
                    onClick={() => setQueued(true)}
                    className="publish-button"
                  >
                    <Send size={15} />
                    <span>{schedule ? "Schedule Queue" : "Dispatch Now"}</span>
                  </button>
                </div>
              </div>
            </div>

            {queued && (
              <div className="success-banner">
                <Check size={16} />
                <span>
                  Post scheduled successfully across {selectedAccounts.length} channels with
                  zero-credential OAuth tokens.
                </span>
              </div>
            )}
          </section>

          <aside className="inspect-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PRE-FLIGHT</p>
                <h2>Channel health</h2>
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
