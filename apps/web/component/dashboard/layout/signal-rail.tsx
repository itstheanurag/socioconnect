"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Radio } from "lucide-react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import { getAccounts, getCurrentWorkspace, getQuotaSummary } from "@/lib/api-client";

export function SignalRail() {
  const { posts, setCurrentSection } = useDashboard();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<number | null>(null);
  const [dropsLeft, setDropsLeft] = useState<number | null>(null);
  const [dropsMax, setDropsMax] = useState<number | null>(null);

  const scheduled = posts.filter((post) => post.status === "scheduled").length;

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getCurrentWorkspace().catch(() => null),
      getAccounts().catch(() => []),
      getQuotaSummary().catch(() => null),
    ]).then(([workspace, accountList, quota]) => {
      if (!mounted) return;
      setWorkspaceName(workspace?.name ?? null);
      setAccounts(accountList.length);
      if (quota) {
        setPlan(quota.tier.replace("_", " "));
        setDropsLeft(Math.max(0, quota.monthlyDrops.max - quota.monthlyDrops.used));
        setDropsMax(quota.monthlyDrops.max);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="signal-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              On air
            </span>
            <span className="h-3 w-px bg-neutral-800" />
            <span className="truncate text-xs font-semibold text-neutral-200">
              {workspaceName ?? "Workspace"}
            </span>
            <span className="hidden rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500 sm:inline">
              {plan ?? "plan"}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-neutral-500">
            Publishing surface ready · approval required for every public post
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-0">
        <RailMetric label="Queue" value={scheduled} />
        <RailMetric label="Connected" value={accounts ?? "—"} />
        <RailMetric
          label="Drops left"
          value={dropsLeft === null ? "—" : dropsLeft}
          suffix={dropsMax ? `/ ${dropsMax}` : undefined}
          tone="text-sky-300"
        />
        <button
          type="button"
          onClick={() => setCurrentSection("developers")}
          className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-300 transition-colors hover:border-neutral-700 hover:text-neutral-100"
        >
          <Radio className="h-3 w-3 text-rose-300" />
          Agents
          <ArrowUpRight className="h-3 w-3 text-neutral-500" />
        </button>
      </div>
    </div>
  );
}

function RailMetric({
  label,
  value,
  suffix,
  tone = "text-neutral-100",
}: {
  label: string;
  value: number | string;
  suffix?: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5 border-neutral-800 px-3 py-1 first:pl-0 sm:border-l sm:first:border-l-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <span className={`signal-tabular text-xs font-semibold ${tone}`}>{value}</span>
      {suffix && <span className="font-mono text-[9px] text-neutral-600">{suffix}</span>}
    </div>
  );
}
