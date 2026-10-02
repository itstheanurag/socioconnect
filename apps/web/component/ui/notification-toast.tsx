"use client";

import { motion, AnimatePresence } from "motion/react";
import { useNotification, ToastItem, ToastType } from "@/context/notification-context";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
};

const TOAST_STYLES: Record<
  ToastType,
  {
    border: string;
    bg: string;
    iconBg: string;
    glow: string;
    barColor: string;
  }
> = {
  error: {
    border: "border-rose-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-rose-500/15 border border-rose-500/30",
    glow: "shadow-[0_8px_32px_rgba(244,63,94,0.18)]",
    barColor: "bg-rose-500",
  },
  success: {
    border: "border-emerald-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-emerald-500/15 border border-emerald-500/30",
    glow: "shadow-[0_8px_32px_rgba(16,185,129,0.18)]",
    barColor: "bg-emerald-500",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-amber-500/15 border border-amber-500/30",
    glow: "shadow-[0_8px_32px_rgba(245,158,11,0.18)]",
    barColor: "bg-amber-500",
  },
  info: {
    border: "border-sky-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-sky-500/15 border border-sky-500/30",
    glow: "shadow-[0_8px_32px_rgba(14,165,233,0.18)]",
    barColor: "bg-sky-500",
  },
};

function ToastMessage({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const style = TOAST_STYLES[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-4 backdrop-blur-2xl`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          {TOAST_ICONS[toast.type]}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h4 className="text-xs font-semibold text-neutral-100 leading-snug">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Duration Bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-0.5 ${style.barColor}`}
        />
      )}
    </motion.div>
  );
}

export function NotificationToastContainer() {
  const { toasts, dismissToast } = useNotification();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastMessage key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const NotificationToasts = NotificationToastContainer;
