"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Globe,
  Bell,
  Sparkles,
  Key,
  Users,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useNotification } from "@/context/notification-context";
import { useDashboard } from "../context/dashboard-context";

export function SettingsView() {
  const { activeWorkspace } = useDashboard();
  const { toast } = useNotification();

  const [timezone, setTimezone] = useState("Asia/Kolkata (GMT+5:30)");
  const [autoThreadSplit, setAutoThreadSplit] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);

  const handleSave = () => {
    toast.success("Settings Saved", "Your workspace publishing configurations have been updated.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure default publishing behaviors, network timezones, and webhook reliability policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Workspace Info Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-rose-400" />
          <span>Workspace Environment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-neutral-400">Workspace Identifier</label>
            <input
              type="text"
              readOnly
              value={activeWorkspace.name}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white font-medium focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400">Default Publishing Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e18] border border-white/10 text-white focus:outline-hidden cursor-pointer"
            >
              <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
              <option value="UTC (GMT+0)">UTC (GMT+0)</option>
              <option value="America/New_York (EST)">America/New_York (EST)</option>
              <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
              <option value="Europe/London (GMT+1)">Europe/London (GMT+1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publishing Intelligence Policies */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#090912]/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Automation &amp; Formatting Intelligence</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/6">
            <div>
              <div className="font-semibold text-white">Auto-Split Character Overflow</div>
              <div className="text-[11px] text-neutral-400">
                Automatically split posts longer than 280 chars into numbered threads on X and Threads.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoThreadSplit}
              onChange={(e) => setAutoThreadSplit(e.target.checked)}
              className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/6">
            <div>
              <div className="font-semibold text-white">Non-Destructive Media Adaptations</div>
              <div className="text-[11px] text-neutral-400">
                Fallback to primary carousel image when destination lacks multi-image support (e.g. Reddit link format).
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoRetry}
              onChange={(e) => setAutoRetry(e.target.checked)}
              className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/6">
            <div>
              <div className="font-semibold text-white">Instant Failure Telegram Alert</div>
              <div className="text-[11px] text-neutral-400">
                Send emergency ping to admin bot when an OAuth token expires during scheduled publish.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyOnFailure}
              onChange={(e) => setNotifyOnFailure(e.target.checked)}
              className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
