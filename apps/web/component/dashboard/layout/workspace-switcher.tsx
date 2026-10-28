"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useNotification } from "@/context/notification-context";
import {
  getCurrentWorkspace,
  getWorkspaces,
  switchWorkspace,
  type WorkspaceSummary,
} from "@/lib/api-client";

export function WorkspaceSwitcher() {
  const { toast } = useNotification();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [current, setCurrent] = useState<WorkspaceSummary | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getWorkspaces(), getCurrentWorkspace()])
      .then(([nextWorkspaces, nextCurrent]) => {
        if (!mounted) return;
        setWorkspaces(nextWorkspaces);
        setCurrent(nextCurrent);
      })
      .catch(() => {
        // Sidebar still works without the switcher.
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSwitch = async (workspace: WorkspaceSummary) => {
    if (workspace.id === current?.id) {
      setOpen(false);
      return;
    }
    setSwitching(workspace.id);
    try {
      await switchWorkspace(workspace.id);
      toast.success("Workspace switched", workspace.name);
      window.location.reload();
    } catch (err) {
      toast.error("Switch failed", err instanceof Error ? err.message : undefined);
      setSwitching(null);
    }
  };

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:text-neutral-100 transition-colors cursor-pointer"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-800">
          <Building2 className="h-3.5 w-3.5 text-rose-300" />
        </span>
        <span className="max-w-36 truncate">
          {loading ? "Workspace" : (current?.name ?? "Select workspace")}
        </span>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-neutral-800 bg-neutral-900 p-2 shadow-2xl backdrop-blur-xl"
          >
            <div className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              Workspaces
            </div>
            <div className="space-y-1">
              {workspaces.map((workspace) => {
                const active = workspace.id === current?.id;
                return (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() => void handleSwitch(workspace)}
                    disabled={Boolean(switching)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "bg-neutral-800 text-neutral-100"
                        : "text-neutral-300 hover:bg-neutral-800/60"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{workspace.name}</span>
                      <span className="block font-mono text-[9px] uppercase text-neutral-500">
                        {workspace.role}
                        {workspace.isPersonal ? " · personal" : ""}
                      </span>
                    </span>
                    {switching === workspace.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                    ) : active ? (
                      <Check className="h-3.5 w-3.5 text-rose-300" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 border-t border-neutral-800 pt-1">
              <a
                href="/dashboard?section=team"
                className="block rounded-xl px-2.5 py-2 text-[11px] text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200"
                onClick={() => setOpen(false)}
              >
                Manage workspaces and team →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
