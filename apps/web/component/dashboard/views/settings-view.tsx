"use client";

import React, { useState } from "react";
import { Globe, Sparkles, Save } from "lucide-react";
import { useNotification } from "@/context/notification-context";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { CustomSelect, CustomSelectOption } from "@/component/dashboard/ui/custom-select";

const TIMEZONE_OPTIONS: CustomSelectOption[] = [
  { value: "Asia/Kolkata (GMT+5:30)", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "UTC (GMT+0)", label: "UTC (GMT+0)" },
  { value: "America/New_York (EST)", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles (PST)", label: "America/Los_Angeles (PST)" },
  { value: "Europe/London (GMT+1)", label: "Europe/London (GMT+1)" },
];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure default publishing behaviors, network timezones, and webhook reliability
            policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold text-xs shadow-lg shadow-red-600/25 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* General Settings */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h3 className="font-display text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-rose-400" />
          <span>General Workspace Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-neutral-400">Workspace Identifier</label>
            <input
              type="text"
              readOnly
              value={activeWorkspace.name}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400">Default Publishing Timezone</label>
            <CustomSelect
              value={timezone}
              onChange={setTimezone}
              options={TIMEZONE_OPTIONS}
              className="w-full"
              buttonClassName="w-full py-2.5 bg-neutral-950"
            />
          </div>
        </div>
      </div>

      {/* Publishing Intelligence Policies */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h3 className="font-display text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Automation &amp; Formatting Intelligence</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800">
            <div>
              <div className="font-semibold text-neutral-100">Auto-Split Character Overflow</div>
              <div className="text-[11px] text-neutral-400">
                Automatically chunk long updates into threaded tweets or split posts when limits
                exceed.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoThreadSplit}
              onChange={(e) => setAutoThreadSplit(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800">
            <div>
              <div className="font-semibold text-neutral-100">Intelligent Rate Limit Backoff</div>
              <div className="text-[11px] text-neutral-400">
                Automatically retry failed webhook and REST dispatches with exponential backoff.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoRetry}
              onChange={(e) => setAutoRetry(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800">
            <div>
              <div className="font-semibold text-neutral-100">Notification Alerts on Failure</div>
              <div className="text-[11px] text-neutral-400">
                Trigger toast, email, or bot alerts whenever a scheduled post fails to publish.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyOnFailure}
              onChange={(e) => setNotifyOnFailure(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
