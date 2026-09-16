"use client";

import { useState } from "react";
import { ShieldCheck, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

interface PlatformConnector {
  id: string;
  name: string;
  category: string;
  loginMethod: string;
  permissions: string;
  safetyTier: string;
  guarantees: string[];
}

const CONNECTORS: PlatformConnector[] = [
  {
    id: "youtube",
    name: "youtube",
    category: "video & community posts",
    loginMethod: "official google creator login",
    permissions: "publish videos & community posts",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "authenticate directly on the official google accounts screen",
      "we never see or store your google password",
      "only publishes community drops, premieres, and video announcements",
    ],
  },
  {
    id: "twitch",
    name: "twitch",
    category: "live streaming & drops",
    loginMethod: "official twitch account login",
    permissions: "stream alerts & go-live updates",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "direct authorization popup on official twitch.tv",
      "broadcasts go-live alerts and stream updates automatically",
      "zero access to private whispers, chat history, or subscriber data",
    ],
  },
  {
    id: "instagram",
    name: "instagram",
    category: "reels & carousels",
    loginMethod: "official meta creator login",
    permissions: "publish reels & captions",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "official meta authorization dialog",
      "we never ask for your instagram password",
      "zero access to direct messages, story views, or personal feed",
    ],
  },
  {
    id: "linkedin",
    name: "linkedin",
    category: "professional network",
    loginMethod: "official linkedin login",
    permissions: "publish articles & updates",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "official linkedin verified token exchange",
      "we never ask for your linkedin login email or password",
      "zero read access to your personal inbox or connections",
    ],
  },
  {
    id: "peerlist",
    name: "peerlist",
    category: "tech & maker community",
    loginMethod: "official peerlist account login",
    permissions: "project & community posts",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "direct connection via verified developer access",
      "strictly limited to project and post publishing",
      "never tracks or monitors your network activity",
    ],
  },
  {
    id: "x",
    name: "x (twitter)",
    category: "quick bites & threads",
    loginMethod: "official x login",
    permissions: "publish posts & threads",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "direct authorization on official x.com domain",
      "no access to direct messages, bookmarked posts, or timeline feeds",
      "connection tokens can be revoked with a single click",
    ],
  },
  {
    id: "reddit",
    name: "reddit",
    category: "subreddits",
    loginMethod: "official reddit login",
    permissions: "post to selected subreddits",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "explicit consent on reddit.com authorization page",
      "no access to private messages, chat logs, or moderation feeds",
      "you choose exactly which subreddits to publish to",
    ],
  },
  {
    id: "bluesky",
    name: "bluesky",
    category: "open social network",
    loginMethod: "official bluesky app login",
    permissions: "publish posts & feeds",
    safetyTier: "encrypted & 100% private",
    guarantees: [
      "scoped app login with zero master account password access",
      "direct publishing to the open social web",
      "zero tracking of your follower timelines or feeds",
    ],
  },
];

export function SecureConnectors() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnector>(CONNECTORS[0]);

  return (
    <section id="connectors" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lowercase">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>creator privacy &amp; security</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              we never ask for or store your passwords.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              connect directly through official platform logins. we only request permission to
              publish the posts you approve — never to read your personal feeds, browse your
              followers, or access private dms.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#faf8f5] px-3.5 py-1.5 font-mono text-xs text-stone-700 rounded-md shadow-2xs">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">100% safe · zero access to your dms</span>
          </div>
        </div>

        {/* Platform Grid & Platform Detail Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lowercase">
          {/* Left Column: Platform List */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {CONNECTORS.map((conn) => {
              const isSelected = selectedPlatform.id === conn.id;
              return (
                <button
                  key={conn.id}
                  type="button"
                  onClick={() => setSelectedPlatform(conn)}
                  className={`text-left p-3.5 border transition-all rounded-md flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-stone-900 bg-[#faf8f5] shadow-xs"
                      : "border-[#ede8df] bg-white hover:border-[#dfc39a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#ede8df] bg-white shadow-2xs">
                      <PlatformIcon platform={conn.id} size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900">{conn.name}</div>
                      <span className="text-[10px] font-mono text-stone-400">{conn.category}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    verified
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Platform Inspection Card */}
          <div className="lg:col-span-7 border border-[#ede8df] bg-white p-6 sm:p-7 rounded-md shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#ede8df] bg-[#faf8f5] shadow-2xs">
                    <PlatformIcon platform={selectedPlatform.id} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">
                      {selectedPlatform.name} connection
                    </h3>
                    <span className="text-xs font-mono text-stone-400">
                      {selectedPlatform.category}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  official account link
                </span>
              </div>

              {/* Protocol Spec Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs mb-6">
                <div className="bg-[#faf8f5] p-3 border border-[#ede8df] rounded-md">
                  <span className="text-[10px] text-stone-400 block mb-1">login method</span>
                  <span className="font-bold text-stone-900 font-sans">
                    {selectedPlatform.loginMethod}
                  </span>
                </div>

                <div className="bg-[#faf8f5] p-3 border border-[#ede8df] rounded-md">
                  <span className="text-[10px] text-stone-400 block mb-1">permission granted</span>
                  <span className="font-bold text-stone-900 font-sans">
                    {selectedPlatform.permissions}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="text-[11px] font-bold text-stone-700">
                  privacy &amp; safety guarantees:
                </div>
                {selectedPlatform.guarantees.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white p-2.5 border border-[#ede8df] rounded-md text-stone-700 font-sans text-xs shadow-2xs"
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
                <span>account protection: {selectedPlatform.safetyTier}</span>
              </div>
              <span className="text-[10px] text-stone-400">revoke access anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
