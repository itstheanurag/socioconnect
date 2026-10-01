"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastOptions {
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
  toast: {
    error: (title: string, messageOrOptions?: string | ToastOptions) => string;
    success: (title: string, messageOrOptions?: string | ToastOptions) => string;
    warning: (title: string, messageOrOptions?: string | ToastOptions) => string;
    info: (title: string, messageOrOptions?: string | ToastOptions) => string;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 5000 }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast],
  );

  const toast = useMemo(
    () => ({
      error: (title: string, messageOrOptions?: string | ToastOptions) => {
        const msg =
          typeof messageOrOptions === "string" ? messageOrOptions : messageOrOptions?.message;
        const dur = typeof messageOrOptions === "object" ? messageOrOptions?.duration : 6000;
        return showToast({ type: "error", title, message: msg, duration: dur });
      },
      success: (title: string, messageOrOptions?: string | ToastOptions) => {
        const msg =
          typeof messageOrOptions === "string" ? messageOrOptions : messageOrOptions?.message;
        const dur = typeof messageOrOptions === "object" ? messageOrOptions?.duration : 4000;
        return showToast({ type: "success", title, message: msg, duration: dur });
      },
      warning: (title: string, messageOrOptions?: string | ToastOptions) => {
        const msg =
          typeof messageOrOptions === "string" ? messageOrOptions : messageOrOptions?.message;
        const dur = typeof messageOrOptions === "object" ? messageOrOptions?.duration : 5000;
        return showToast({ type: "warning", title, message: msg, duration: dur });
      },
      info: (title: string, messageOrOptions?: string | ToastOptions) => {
        const msg =
          typeof messageOrOptions === "string" ? messageOrOptions : messageOrOptions?.message;
        const dur = typeof messageOrOptions === "object" ? messageOrOptions?.duration : 4000;
        return showToast({ type: "info", title, message: msg, duration: dur });
      },
    }),
    [showToast],
  );

  return (
    <NotificationContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
