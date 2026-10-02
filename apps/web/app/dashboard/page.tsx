"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { DashboardProvider } from "@/component/dashboard/context/dashboard-context";
import { DashboardLayout } from "@/component/dashboard/layout/dashboard-layout";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
            <Share2 className="w-6 h-6 text-neutral-100 animate-spin" />
          </div>
          <p className="text-sm font-mono text-neutral-400">Loading your command center...</p>
        </div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return null;
  }

  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
