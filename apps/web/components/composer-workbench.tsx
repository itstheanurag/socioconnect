"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Hash,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  Link,
  MoreHorizontal,
  Plus,
  Send,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface SocialAccount {
  id: string;
  platform: string;
  name: string;
  detail: string;
  mark: string;
  tone: string;
  limit: number;
  selected: boolean;
  reconnect?: boolean;
}

const accountSeed: SocialAccount[] = [
  { id: "linkedin", platform: "LinkedIn", name: "Maya Rao", detail: "Personal profile", mark: "in", tone: "linkedin", limit: 3000, selected: true },
  { id: "x", platform: "X", name: "@mayarao", detail: "Creator account", mark: "X", tone: "x", limit: 280, selected: true },
  { id: "instagram", platform: "Instagram", name: "Fieldnotes Studio", detail: "@fieldnotes.studio", mark: "IG", tone: "instagram", limit: 2200, selected: false, reconnect: true },
];

function PlatformMark({ account }: { account: SocialAccount }) {
  return <span className={"platform-mark platform-mark--" + account.tone}>{account.mark}</span>;
}

export function ComposerWorkbench() {
  const [accounts, setAccounts] = useState(accountSeed);
  const [content, setContent] = useState("A good publishing workflow should make every destination visible, not hide the hard parts behind one button.");
  const [schedule, setSchedule] = useState(false);
  const [queued, setQueued] = useState(false);
  const selectedAccounts = useMemo(() => accounts.filter((account) => account.selected), [accounts]);
  const canPublish = selectedAccounts.length > 0 && selectedAccounts.every((account) => content.length <= account.limit);

  function toggleAccount(id: string) {
    setAccounts((current) =>
      current.map((account) => account.id === id && !account.reconnect ? { ...account, selected: !account.selected } : account),
    );
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Socioconnect home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>SOCIOCONNECT</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <button className="nav-item nav-item--active" type="button"><FileText size={17} /><span>Compose</span></button>
          <button className="nav-item" type="button"><Layers3 size={17} /><span>Posts</span><b>12</b></button>
          <button className="nav-item" type="button"><UsersRound size={17} /><span>Accounts</span></button>
          <button className="nav-item" type="button"><Settings2 size={17} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-footer">
          <button className="workspace-switcher" type="button">
            <span className="avatar avatar--small">MR</span>
            <span><strong>Maya Rao</strong><small>Personal workspace</small></span>
            <ChevronDown size={15} />
          </button>
          <button className="upgrade-link" type="button"><Sparkles size={15} /><span>Upgrade plan</span></button>
        </div>
      </aside>

      <section className="app-frame">
        <header className="topbar">
          <div className="crumb"><LayoutDashboard size={15} /><span>Publishing desk</span><i>/</i><strong>New post</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications" title="Notifications"><Bell size={18} /><i /></button>
            <button className="avatar" type="button" aria-label="Open user menu">MR</button>
          </div>
        </header>

        <div className="workspace">
          <section className="compose-column">
            <div className="section-heading">
              <div><p className="eyebrow">DISPATCH / 01</p><h1>New post</h1></div>
              <button className="draft-button" type="button"><MoreHorizontal size={18} /> Save draft</button>
            </div>

            <section className="composer-panel" aria-label="Post composer">
              <div className="composer-toolbar">
                <button className="tool-button tool-button--active" type="button" aria-label="Add link" title="Add link"><Link size={17} /></button>
                <button className="tool-button" type="button" aria-label="Add media" title="Add media"><ImagePlus size={17} /></button>
                <button className="tool-button" type="button" aria-label="Add hashtag" title="Add hashtag"><Hash size={17} /></button>
                <span className="toolbar-rule" /><span className="autosave"><i />Autosaved</span>
              </div>
              <label className="sr-only" htmlFor="post-content">Post content</label>
              <textarea id="post-content" value={content} onChange={(event) => { setContent(event.target.value); setQueued(false); }} rows={7} />
              <div className="composer-footer">
                <span>{content.length.toLocaleString()} characters</span>
                <button className="add-media" type="button"><Plus size={16} />Add media</button>
              </div>
            </section>

            <section className="destination-section" aria-labelledby="destination-title">
              <div className="subheading">
                <div><p className="eyebrow">DESTINATIONS / 02</p><h2 id="destination-title">Send to</h2></div>
                <span>{selectedAccounts.length} selected</span>
              </div>
              <div className="destination-list">
                {accounts.map((account) => {
                  const tooLong = content.length > account.limit;
                  return (
                    <button
                      aria-pressed={account.selected}
                      className={"destination" + (account.selected ? " destination--selected" : "") + (account.reconnect ? " destination--disabled" : "") + (tooLong ? " destination--invalid" : "")}
                      disabled={account.reconnect}
                      key={account.id}
                      onClick={() => toggleAccount(account.id)}
                      type="button"
                    >
                      <span className="selection">{account.selected ? <Check size={13} /> : null}</span>
                      <PlatformMark account={account} />
                      <span className="destination-name"><strong>{account.name}</strong><small>{account.platform} · {account.detail}</small></span>
                      <span className={tooLong ? "limit limit--error" : "limit"}>{account.reconnect ? "Reconnect" : (tooLong ? content.length - account.limit + " over" : (account.limit - content.length).toLocaleString() + " left")}</span>
                    </button>
                  );
                })}
                <button className="connect-account" type="button"><Plus size={16} />Connect another account</button>
              </div>
            </section>

            <section className="schedule-section">
              <div><p className="eyebrow">TIMING / 03</p><h2>When should this go out?</h2></div>
              <div className="timing-controls">
                <button className={schedule ? "timing-choice" : "timing-choice timing-choice--selected"} onClick={() => setSchedule(false)} type="button"><Send size={16} /><span><strong>Publish now</strong><small>Queue immediately</small></span></button>
                <button className={schedule ? "timing-choice timing-choice--selected" : "timing-choice"} onClick={() => setSchedule(true)} type="button"><CalendarDays size={16} /><span><strong>Schedule</strong><small>Choose a future time</small></span></button>
              </div>
              {schedule ? <div className="schedule-detail"><Clock3 size={16} /><span>Thu, 18 Sep · 09:30 IST</span><button type="button">Change</button></div> : null}
            </section>
          </section>

          <aside className="dispatch-column">
            <section className="dispatch-card">
              <div className="dispatch-header">
                <div><p className="eyebrow">LIVE CHECK / 04</p><h2>Dispatch rail</h2></div>
                <span className={canPublish ? "ready-badge" : "ready-badge ready-badge--blocked"}><i />{canPublish ? "Ready" : "Needs attention"}</span>
              </div>
              <div className="rail">
                {selectedAccounts.map((account, index) => (
                  <div className="rail-stop" key={account.id}>
                    <div className="rail-line"><span><PlatformMark account={account} /></span>{index < selectedAccounts.length - 1 ? <i /> : null}</div>
                    <div className="rail-content">
                      <span><strong>{account.platform}</strong><small>{account.name}</small></span>
                      {content.length <= account.limit ? <b className="valid"><Check size={13} />Valid</b> : <b className="invalid"><X size={13} />Too long</b>}
                    </div>
                  </div>
                ))}
                {selectedAccounts.length === 0 ? <p className="empty-rail">Select an account to create a delivery lane.</p> : null}
              </div>
              <div className="dispatch-note"><span>Each destination is queued independently.</span><button type="button" aria-label="Read delivery details" title="Read delivery details"><ExternalLink size={14} /></button></div>
            </section>
            <section className="usage-card"><div><span>September usage</span><strong>16 / 30</strong></div><i><b /></i><p>Selected destinations use {selectedAccounts.length} publish operations.</p></section>
            <button className={"publish-button" + (!canPublish ? " publish-button--disabled" : "")} disabled={!canPublish} onClick={() => setQueued(true)} type="button">
              {queued ? <Check size={18} /> : <Send size={18} />}<span>{queued ? "Added to dispatch" : schedule ? "Schedule post" : "Publish post"}</span><b>{selectedAccounts.length}</b>
            </button>
            {queued ? <p className="success-message">Your destinations have been queued independently.</p> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
