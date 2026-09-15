"use client";

import { useState } from "react";
import { ShieldCheck, Lock, KeyRound, CheckCircle2 } from "lucide-react";

interface PlatformConnector {
  id: string;
  name: string;
  category: string;
  iconText: string;
  iconBg: string;
  status: "connected" | "ready";
  oauthStandard: string;
  permissionsScope: string;
  encryption: string;
  zeroKnowledgeHighlights: string[];
}

const CONNECTORS: PlatformConnector[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "Video & Community Posts",
    iconText: "YT",
    iconBg: "bg-[#FF0000]",
    status: "connected",
    oauthStandard: "Google Identity OAuth 2.0 + PKCE",
    permissionsScope: "youtube.upload, youtube.readonly (Community & Premieres)",
    encryption: "AES-256-GCM Hardware Security Vault",
    zeroKnowledgeHighlights: [
      "Authenticates directly on official Google accounts screen",
      "We never see or store your Google account password",
      "Only publishes video metadata, premiere schedules & community posts",
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "Live Streaming & Clips",
    iconText: "TW",
    iconBg: "bg-[#9146FF]",
    status: "connected",
    oauthStandard: "Twitch Developer OAuth 2.0",
    permissionsScope: "channel:manage:broadcast, clips:edit",
    encryption: "AES-256-GCM Vault",
    zeroKnowledgeHighlights: [
      "Direct authorization popup on official Twitch.tv domain",
      "Broadcasts go-live alerts and stream title updates",
      "Zero read access to your whispers, private chat, or payment info",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Reels & Visual Carousels",
    iconText: "IG",
    iconBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    status: "connected",
    oauthStandard: "Meta Graph API for Creators OAuth",
    permissionsScope: "instagram_basic, instagram_content_publish",
    encryption: "AES-256-GCM + Token Rotation",
    zeroKnowledgeHighlights: [
      "Official Meta Graph authorization with write-only publishing",
      "We never ask for your Instagram or Facebook password",
      "Zero access to Direct Messages or user browsing activity",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Professional Network",
    iconText: "in",
    iconBg: "bg-[#0a66c2]",
    status: "connected",
    oauthStandard: "OAuth 2.0 + OIDC with PKCE",
    permissionsScope: "w_member_social (Publish Only)",
    encryption: "AES-256-GCM Hardware Security Vault",
    zeroKnowledgeHighlights: [
      "We never ask for your LinkedIn login email or password",
      "Official LinkedIn Developer API token exchange",
      "Zero read access to your personal messages or feed",
    ],
  },
  {
    id: "peerlist",
    name: "Peerlist",
    category: "Tech & Maker Community",
    iconText: "P",
    iconBg: "bg-[#00AA45]",
    status: "connected",
    oauthStandard: "Personal Access Token / Official API",
    permissionsScope: "create_post, update_project",
    encryption: "AES-256-GCM Vault",
    zeroKnowledgeHighlights: [
      "Direct API integration via verified developer keys",
      "Strictly scoped to project and post publishing",
      "Never tracks or scrapes user network connections",
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Public Square & Threads",
    iconText: "𝕏",
    iconBg: "bg-stone-900",
    status: "connected",
    oauthStandard: "OAuth 2.0 with PKCE (RFC 7636)",
    permissionsScope: "tweet.write, users.read (write-only post creation)",
    encryption: "AES-256-GCM + Token Hash Sharding",
    zeroKnowledgeHighlights: [
      "Direct authorization popup on official X.com domain",
      "No access to Direct Messages or timeline feeds",
      "Tokens automatically refreshed with rotated secrets",
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Communities & Subreddits",
    iconText: "rd",
    iconBg: "bg-[#ff4500]",
    status: "connected",
    oauthStandard: "OAuth 2.0 Web Identity",
    permissionsScope: "submit, identity (Post creation in selected subreddits)",
    encryption: "AES-256-GCM Vault",
    zeroKnowledgeHighlights: [
      "Explicit user consent on reddit.com authorization page",
      "No access to private chats, moderation feeds, or history",
      "Granular subreddit publishing filters",
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    category: "Decentralized AT Protocol",
    iconText: "bs",
    iconBg: "bg-[#0285ff]",
    status: "connected",
    oauthStandard: "AT Protocol App Password / OAuth",
    permissionsScope: "app.bsky.feed.post (Write record)",
    encryption: "Encrypted Scoped App Vault",
    zeroKnowledgeHighlights: [
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
              ZERO-CREDENTIAL CONNECTOR ARCHITECTURE
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Connect YouTube, Twitch, Instagram &amp; more safely.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              We never take, ask for, or store your passwords for any platform. Connections are
              established 100% via official Google, Twitch, Meta, X, and LinkedIn OAuth 2.0 PKCE
              APIs with hardware-grade AES-256 encryption.
            </p>
          </div>

          <div className="border border-dashed border-[#dfc39a] bg-[#faf8f5] px-4 py-3 font-mono text-xs text-stone-700 rounded-xs">
            <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Zero Feed Reading / Zero Credential Storage</span>
            </div>
            <span className="text-[11px] text-stone-500">
              Only write tokens requested. We never fetch or store your private feeds.
            </span>
          </div>
        </div>

        {/* Security Diagram Strip */}
        <div className="border border-[#ede8df] bg-[#faf8f5] p-6 mb-8 rounded-xs">
          <div className="text-center font-mono text-xs font-bold uppercase text-stone-600 mb-6">
            The SocioConnect Cryptographic Handshake
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-white p-4 border border-[#ede8df] rounded-xs text-center">
              <div className="h-8 w-8 rounded-full bg-[#faf8f5] border border-[#ede8df] mx-auto flex items-center justify-center mb-2 font-bold text-stone-800">
                1
              </div>
              <div className="font-bold text-stone-900 mb-1">Official Redirect</div>
              <p className="text-[11px] text-stone-500 font-sans">
                You authenticate directly on Google, Twitch, Instagram, or X official login pages.
              </p>
            </div>

            <div className="bg-white p-4 border border-[#ede8df] rounded-xs text-center">
              <div className="h-8 w-8 rounded-full bg-[#faf8f5] border border-[#ede8df] mx-auto flex items-center justify-center mb-2 font-bold text-stone-800">
                2
              </div>
              <div className="font-bold text-stone-900 mb-1">Write-Only Grant</div>
              <p className="text-[11px] text-stone-500 font-sans">
                Platform grants a temporary write token. Password never touches our servers.
              </p>
            </div>

            <div className="bg-white p-4 border border-dashed border-[#dfc39a] rounded-xs text-center">
              <div className="h-8 w-8 rounded-full bg-[#F4DCB4] border border-[#dfc39a] mx-auto flex items-center justify-center mb-2 font-bold text-stone-900">
                3
              </div>
              <div className="font-bold text-stone-900 mb-1">AES-256-GCM Vault</div>
              <p className="text-[11px] text-stone-500 font-sans">
                Tokens are immediately encrypted at rest using rotating crypto keys.
              </p>
            </div>

            <div className="bg-white p-4 border border-[#ede8df] rounded-xs text-center">
              <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-300 mx-auto flex items-center justify-center mb-2 font-bold text-emerald-700">
                4
              </div>
              <div className="font-bold text-stone-900 mb-1">Outbound Broadcast</div>
              <p className="text-[11px] text-stone-500 font-sans">
                Announcements and posts dispatch directly to verified endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Grid & Platform Detail Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Platform Selectors */}
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
                    <div
                      className={`h-8 w-8 rounded-full ${conn.iconBg} text-white flex items-center justify-center font-bold text-xs font-mono shrink-0`}
                    >
                      {conn.iconText}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 font-sans">{conn.name}</div>
                      <span className="text-[10px] font-mono text-stone-500">{conn.category}</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    OAuth 2.0
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Platform Inspection Card */}
          <div className="lg:col-span-7 border border-[#ede8df] bg-white p-6 sm:p-8 rounded-xs shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${selectedPlatform.iconBg} text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs`}
                  >
                    {selectedPlatform.iconText}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 font-sans">
                      {selectedPlatform.name} Official Connector
                    </h3>
                    <span className="text-xs font-mono text-stone-400">
                      {selectedPlatform.category}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs text-right">
                  <span className="text-[10px] uppercase text-stone-400 block">Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Official API
                  </span>
                </div>
              </div>

              {/* Protocol Spec Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs mb-6">
                <div className="bg-[#faf8f5] p-3.5 border border-[#ede8df] rounded-xs">
                  <span className="text-[10px] uppercase text-stone-400 block mb-1">
                    Auth Protocol Standard
                  </span>
                  <span className="font-bold text-stone-900 text-xs">
                    {selectedPlatform.oauthStandard}
                  </span>
                </div>

                <div className="bg-[#faf8f5] p-3.5 border border-[#ede8df] rounded-xs">
                  <span className="text-[10px] uppercase text-stone-400 block mb-1">
                    Permission Scope
                  </span>
                  <span className="font-bold text-stone-900 text-xs">
                    {selectedPlatform.permissionsScope}
                  </span>
                </div>
              </div>

              {/* Zero-Knowledge Guarantees */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Privacy &amp; Security Guarantees:
                </div>
                {selectedPlatform.zeroKnowledgeHighlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white p-2.5 border border-[#ede8df] rounded-xs text-stone-700 font-sans text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-8 pt-4 border-t border-dashed border-[#ede8df] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-stone-700" />
                <span>Encrypted at rest: {selectedPlatform.encryption}</span>
              </div>
              <span className="text-[10px] text-stone-400 uppercase">Revocable at any moment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
