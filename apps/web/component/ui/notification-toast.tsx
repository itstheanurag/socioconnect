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
    bg: "bg-[#0f090e]/95",
    iconBg: "bg-rose-500/15 border border-rose-500/30",
    glow: "shadow-[0_8px_32px_rgba(244,63,94,0.18)]",
    barColor: "bg-rose-500",
  },
  success: {
    border: "border-emerald-500/30",
    bg: "bg-[#090f0c]/95",
    iconBg: "bg-emerald-500/15 border border-emerald-500/30",
    glow: "shadow-[0_8px_32px_rgba(16,185,129,0.18)]",
    barColor: "bg-emerald-500",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-[#0f0e09]/95",
    iconBg: "bg-amber-500/15 border border-amber-500/30",
    glow: "shadow-[0_8px_32px_rgba(245,158,11,0.18)]",
    barColor: "bg-amber-500",
  },
  info: {
    border: "border-sky-500/30",
    bg: "bg-[#090c0f]/95",
    iconBg: "bg-sky-500/15 border border-sky-500/30",
    glow: "shadow-[0_8px_32px_rgba(14,165,233,0.18)]",
    barColor: "bg-sky-500",
  },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const { dismissToast } = useNotification();
  const style = TOAST_STYLES[toast.type];
  const icon = TOAST_ICONS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, x: 20, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.glow} backdrop-blur-2xl p-4 text-white`}
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start gap-3">
        {/* Type Icon Badge */}
        <div className={`p-2 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-semibold tracking-tight text-white leading-snug">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-xs text-neutral-300 font-light leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-0.5 ${style.barColor} opacity-70`}
        />
      )}
    </motion.div>
  );
}

export function NotificationToasts() {
  const { toasts } = useNotification();

  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
