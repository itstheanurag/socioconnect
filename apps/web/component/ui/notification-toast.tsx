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
    iconBg: "bg-rose-500/10 border border-rose-500/20",
    glow: "shadow-2xl shadow-rose-950/40",
    barColor: "bg-rose-500",
  },
  success: {
    border: "border-emerald-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    glow: "shadow-2xl shadow-emerald-950/40",
    barColor: "bg-emerald-500",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    glow: "shadow-2xl shadow-amber-950/40",
    barColor: "bg-amber-500",
  },
  info: {
    border: "border-sky-500/30",
    bg: "bg-neutral-900/95",
    iconBg: "bg-sky-500/10 border border-sky-500/20",
    glow: "shadow-2xl shadow-sky-950/40",
    barColor: "bg-sky-500",
  },
};

function ToastMessage({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const style = TOAST_STYLES[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-4 backdrop-blur-2xl`}
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        {/* Symmetrical Icon Badge */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          {TOAST_ICONS[toast.type]}
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h4 className="text-xs font-semibold text-neutral-100 leading-snug tracking-tight">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Symmetrical Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Symmetrical Progress Bar */}
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
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-w-sm sm:max-w-md w-full px-4 sm:px-0"
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
