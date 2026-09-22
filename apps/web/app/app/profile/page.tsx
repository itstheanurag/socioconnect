"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Key,
  Bell,
  Sparkles,
  Copy,
  Check,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../../lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "Maya");
  const [lastName, setLastName] = useState(user?.lastName || "Rao");
  const [email] = useState(user?.email || "maya.rao@socioconnect.app");
  const [creatorBio, setCreatorBio] = useState(
    "Building full-stack web applications & creative software tools. Writing once, reaching creators across 6 networks.",
  );
  const [primaryNiche, setPrimaryNiche] = useState("Tech & Software Development");
  const [timezone, setTimezone] = useState("America/New_York (EST)");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dispatchReceipts, setDispatchReceipts] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockApiKey = "sc_live_9f830a1b2c4d5e6f7a8b9c0d1e2f3a4b";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyKey = () => {
    void navigator.clipboard.writeText(mockApiKey);
    setCopiedKey(true);
    showToast("API Key copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Creator profile & timezone preferences saved successfully!");
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
      <div className="border-b border-line pb-6">
        <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-0.5 text-xs font-mono font-semibold text-stone-900 rounded-md mb-2">
          <User className="h-3 w-3 text-stone-800" />
          <span>creator settings &amp; authentication</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
          creator profile &amp; security
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-2xl">
          manage your creator bio, primary content niche, developer api tokens, and delegated
          session security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Settings Form */}
        <div className="lg:col-span-8 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="border border-line bg-white p-6 sm:p-7 rounded-md shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
              <span className="font-mono text-xs font-bold text-stone-900">
                creator information
              </span>
              <span className="font-mono text-[10px] text-stone-400">
                public to connected networks
              </span>
            </div>

            {/* Avatar & Display Name */}
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                }
                alt="Creator Avatar"
                className="h-16 w-16 rounded-full object-cover border border-line shadow-xs"
              />
              <div>
                <button
                  type="button"
                  onClick={() => showToast("Uploaded new avatar mockup.")}
                  className="px-3 py-1.5 border border-secondary-border bg-[#faf8f5] hover:bg-secondary/40 font-mono text-xs font-bold text-stone-800 rounded-md transition-colors cursor-pointer"
                >
                  change avatar
                </button>
                <div className="font-mono text-[10px] text-stone-400 mt-1">
                  square jpg or png &middot; max 2mb
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-700 font-semibold block">first name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-line bg-[#faf8f5] p-2.5 rounded-md text-stone-900 focus:bg-white focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-700 font-semibold block">last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-line bg-[#faf8f5] p-2.5 rounded-md text-stone-900 focus:bg-white focus:border-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email Field (Read Only) */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-stone-700 font-semibold block">
                google authenticated email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-line bg-stone-100 p-2.5 rounded-md text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400">
                linked via official google workspace oauth
              </span>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-stone-700 font-semibold block">creator bio &amp; hook</label>
              <textarea
                value={creatorBio}
                onChange={(e) => setCreatorBio(e.target.value)}
                rows={3}
                className="w-full resize-none border border-line bg-[#faf8f5] p-2.5 rounded-md text-stone-900 font-sans text-xs focus:bg-white focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            {/* Niche & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-700 font-semibold block">primary niche</label>
                <select
                  value={primaryNiche}
                  onChange={(e) => setPrimaryNiche(e.target.value)}
                  className="w-full border border-line bg-[#faf8f5] p-2.5 rounded-md text-stone-900 focus:bg-white focus:border-stone-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="Tech & Software Development">tech &amp; coding</option>
                  <option value="Design & Creative Direction">design &amp; animation</option>
                  <option value="Creator Economy & Indie Hacking">
                    indie business &amp; creators
                  </option>
                  <option value="Gaming & Live Streaming">gaming &amp; live streams</option>
                  <option value="Education & Explainer Videos">education &amp; science</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-700 font-semibold block">
                  primary publishing timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border border-line bg-[#faf8f5] p-2.5 rounded-md text-stone-900 focus:bg-white focus:border-stone-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="America/New_York (EST)">america/new_york (est)</option>
                  <option value="America/Los_Angeles (PST)">america/los_angeles (pst)</option>
                  <option value="Europe/London (GMT)">europe/london (gmt)</option>
                  <option value="Asia/Kolkata (IST)">asia/kolkata (ist)</option>
                  <option value="Asia/Tokyo (JST)">asia/tokyo (jst)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-dashed border-line flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-secondary-border bg-secondary px-5 py-2.5 rounded-md font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors cursor-pointer shadow-2xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>save profile changes</span>
              </button>
            </div>
          </form>

          {/* Developer API & Webhook Access Card */}
          <div className="border border-line bg-white p-6 sm:p-7 rounded-md shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Key className="h-4 w-4 text-[#dfc39a]" />
                <span>developer api &amp; automation keys</span>
              </div>
              <span className="text-emerald-700 text-[10px] font-bold">&bull; live</span>
            </div>

            <p className="text-stone-600 font-sans text-xs">
              use this secret key to dispatch posts programmatically from zapier, make, github
              actions, or custom scripts.
            </p>

            <div className="flex items-center gap-2 bg-[#faf8f5] border border-line p-2.5 rounded-md">
              <input
                type={apiKeyVisible ? "text" : "password"}
                value={mockApiKey}
                readOnly
                className="w-full bg-transparent text-stone-800 font-mono text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={apiKeyVisible ? "Hide Key" : "Show Key"}
              >
                {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1 bg-white border border-line px-2.5 py-1 rounded-sm text-stone-800 hover:border-stone-400 cursor-pointer font-bold text-[11px]"
              >
                {copiedKey ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedKey ? "copied" : "copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Security, Sessions & Notification Toggles */}
        <div className="lg:col-span-4 space-y-6 font-mono text-xs">
          {/* Security & Sessions Box */}
          <div className="border border-line bg-white p-5 rounded-md shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-900 border-b border-dashed border-line pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>security status</span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between text-stone-600">
                <span>master password:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-xs">
                  0% stored
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>auth method:</span>
                <span className="font-semibold text-stone-800">google pkce</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>active sessions:</span>
                <span className="font-semibold text-stone-800">1 active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast("Revoked all active secondary web sessions.")}
              className="w-full border border-red-200 bg-red-50/60 p-2 text-red-700 hover:bg-red-100/80 rounded-sm font-bold text-[11px] transition-colors cursor-pointer"
            >
              revoke all sessions
            </button>
          </div>

          {/* Notification Preferences Box */}
          <div className="border border-line bg-white p-5 rounded-md shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-900 border-b border-dashed border-line pb-3">
              <Bell className="h-4 w-4 text-[#dfc39a]" />
              <span>creator notifications</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-stone-700 text-[11px]">email drop receipts</span>
                <input
                  type="checkbox"
                  checked={dispatchReceipts}
                  onChange={(e) => {
                    setDispatchReceipts(e.target.checked);
                    showToast(`Email drop receipts ${e.target.checked ? "enabled" : "disabled"}.`);
                  }}
                  className="rounded-xs accent-stone-900 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-stone-700 text-[11px]">channel retry alerts</span>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => {
                    setEmailAlerts(e.target.checked);
                    showToast(`Channel retry alerts ${e.target.checked ? "enabled" : "disabled"}.`);
                  }}
                  className="rounded-xs accent-stone-900 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
