"use client";

import { useState } from "react";
import { ShieldCheck, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface PlatformConnector {
  id: string;
  name: string;
  category: string;
  oauthStandard: string;
  permissionsScope: string;
  encryption: string;
  guarantees: string[];
}

const CONNECTORS: PlatformConnector[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "Video & Community Posts",
    oauthStandard: "Google Identity OAuth 2.0 + PKCE",
    permissionsScope: "youtube.upload (Write-only)",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Authenticate directly on official Google accounts screen",
      "We never see or store your Google password",
      "Only publishes video metadata and community drops",
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "Live Streaming & Drops",
    oauthStandard: "Twitch Developer OAuth 2.0",
    permissionsScope: "channel:manage:broadcast",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Direct authorization popup on twitch.tv",
      "Broadcasts go-live alerts and stream updates",
      "Zero read access to private whispers or chat history",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Reels & Carousels",
    oauthStandard: "Meta Graph API for Creators",
    permissionsScope: "instagram_content_publish",
    encryption: "AES-256-GCM + Token Rotation",
    guarantees: [
      "Official Meta Graph authorization",
      "We never ask for your Instagram password",
      "Zero access to Direct Messages or user browsing",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Professional Network",
    oauthStandard: "OAuth 2.0 + OIDC PKCE",
    permissionsScope: "w_member_social (Publish Only)",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Official LinkedIn Developer API token exchange",
      "We never ask for your LinkedIn login email or password",
      "Zero read access to your personal messages or feed",
    ],
  },
  {
    id: "peerlist",
    name: "Peerlist",
    category: "Tech & Maker Community",
    oauthStandard: "Official API Access Token",
    permissionsScope: "create_post, update_project",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Direct API integration via verified developer keys",
      "Strictly scoped to project and post publishing",
      "Never tracks or scrapes user network connections",
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Public Square & Threads",
    oauthStandard: "OAuth 2.0 with PKCE (RFC 7636)",
    permissionsScope: "tweet.write (Write-only post creation)",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Direct authorization on official X.com domain",
      "No access to Direct Messages or timeline feeds",
      "Tokens automatically refreshed with rotated secrets",
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Subreddits",
    oauthStandard: "OAuth 2.0 Web Identity",
    permissionsScope: "submit (Post creation in selected subreddits)",
    encryption: "AES-256-GCM Vault",
    guarantees: [
      "Explicit consent on reddit.com authorization page",
      "No access to private chats, feeds, or mod logs",
      "Granular subreddit publishing filters",
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    category: "AT Protocol",
    oauthStandard: "AT Protocol App Password / OAuth",
    permissionsScope: "app.bsky.feed.post",
    encryption: "Scoped Vault Key",
    guarantees: [
      "Scoped App Passwords with zero master account access",
      "Direct cryptographic AT-proto commit signing",
      "Zero server-side scraping of follower timelines",
    ],
  },
];

export function SecureConnectors() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnector>(CONNECTORS[0]);

  return (
    <section id="connectors" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ZERO-CREDENTIAL AUTHENTICATION
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              We never ask for or store your login passwords.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              Every network connection runs through 100% official OAuth 2.0 PKCE. Your access tokens
              are hardware-encrypted with AES-256-GCM and scoped strictly to outbound writes.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#faf8f5] px-4 py-2 font-mono text-xs text-stone-700 rounded-xs">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">Write-Only Scopes · Zero Feed Reading</span>
          </div>
        </div>

        {/* Platform Grid & Platform Detail Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Platform List */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {CONNECTORS.map((conn) => {
              const isSelected = selectedPlatform.id === conn.id;
              return (
                <button
                  key={conn.id}
                  onClick={() => setSelectedPlatform(conn)}
                  className={`text-left p-3.5 border transition-all rounded-xs flex items-center justify-between ${
                    isSelected
                      ? "border-stone-900 bg-[#faf8f5] shadow-xs"
                      : "border-[#ede8df] bg-white hover:border-[#dfc39a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xs border border-[#ede8df] bg-white shadow-2xs">
                      <PlatformIcon platform={conn.id} size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900">{conn.name}</div>
                      <span className="text-[10px] font-mono text-stone-400">{conn.category}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    OAuth 2.0
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Platform Inspection Card */}
          <div className="lg:col-span-7 border border-[#ede8df] bg-white p-6 sm:p-8 rounded-xs shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xs border border-[#ede8df] bg-[#faf8f5] shadow-2xs">
                    <PlatformIcon platform={selectedPlatform.id} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">
                      {selectedPlatform.name} Connector
                    </h3>
                    <span className="text-xs font-mono text-stone-400">
                      {selectedPlatform.category}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Official Scope
                </span>
              </div>

              {/* Protocol Spec Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs mb-6">
                <div className="bg-[#faf8f5] p-3 border border-[#ede8df] rounded-xs">
                  <span className="text-[10px] uppercase text-stone-400 block mb-1">
                    Protocol Standard
                  </span>
                  <span className="font-bold text-stone-900">{selectedPlatform.oauthStandard}</span>
                </div>

                <div className="bg-[#faf8f5] p-3 border border-[#ede8df] rounded-xs">
                  <span className="text-[10px] uppercase text-stone-400 block mb-1">
                    Permission Scope
                  </span>
                  <span className="font-bold text-stone-900">
                    {selectedPlatform.permissionsScope}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                  Architectural Guarantees:
                </div>
                {selectedPlatform.guarantees.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white p-2.5 border border-[#ede8df] rounded-xs text-stone-700 font-sans text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 pt-4 border-t border-dashed border-[#ede8df] flex items-center justify-between font-mono text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-stone-700" />
                <span>Encrypted Vault: {selectedPlatform.encryption}</span>
              </div>
              <span className="text-[10px] text-stone-400 uppercase">Revoke Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
