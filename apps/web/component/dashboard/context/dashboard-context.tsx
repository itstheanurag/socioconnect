"use client";

import React, { useEffect } from "react";
import { useNotification } from "@/context/notification-context";
import { useDashboardStore, setDashboardStoreNotifier } from "../store/use-dashboard-store";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useNotification();

  useEffect(() => {
    setDashboardStoreNotifier({
      success: (title, desc) => toast.success(title, desc),
      error: (title, desc) => toast.error(title, desc),
      info: (title, desc) => toast.info(title, desc),
    });
  }, [toast]);

  return <>{children}</>;
}

export function useDashboard() {
  return useDashboardStore();
}

export { useDashboardStore };
