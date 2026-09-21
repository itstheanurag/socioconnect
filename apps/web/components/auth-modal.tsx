"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { PlatformIcon } from "./landing/platform-icons";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsDemoLoading(true);
    try {
      loginWithDemo();
    } catch (err) {
      console.error(err);
      setIsDemoLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative w-full max-w-md border border-[#ede8df] bg-white p-6 sm:p-8 rounded-md shadow-2xl z-10 overflow-hidden lowercase"
        >
          {/* Subtle Warm Amber Glow Behind Header */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: "var(--color-secondary, #F4DCB4)" }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-md hover:bg-stone-100 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="text-center relative">
            <div className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md mb-3">
              <Sparkles className="h-3 w-3 text-stone-800" />
              <span>official google authentication</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
              sign in to creator studio
            </h2>
            <p className="mt-1.5 text-xs text-stone-600 font-sans leading-relaxed">
              connect with your google account to manage scheduled releases, audience peak times,
              and cross-platform publishing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 relative">
            {/* Primary Google Login Button */}
            <button
              type="button"
              disabled={isLoading || isDemoLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-[#ede8df] bg-white p-3 font-sans text-xs font-bold text-stone-800 hover:bg-[#faf8f5] hover:border-stone-400 transition-all rounded-md shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {/* Google G Logo SVG */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? "connecting to google..." : "continue with google"}</span>
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
              )}
            </button>

            {/* Quick Demo Preview Button */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-stone-400 text-center mb-2.5">
                or explore without signing up
              </div>
              <button
                type="button"
                disabled={isLoading || isDemoLoading}
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] p-2.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-md shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {isDemoLoading ? "launching demo..." : "quick demo sign in (dev preview)"}
                </span>
              </button>
            </div>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="mt-6 pt-4 border-t border-dashed border-[#ede8df] space-y-2 font-mono text-[11px] text-stone-500">
            <div className="flex items-center gap-2 text-stone-800 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% private &middot; zero password storage</span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
              we authenticate strictly through official platform screens. we never ask for, view, or
              store your master passwords.
            </p>
          </div>

          {/* Mini Supported Platforms strip */}
          <div className="mt-4 pt-3 border-t border-[#ede8df] flex items-center justify-between text-stone-400">
            <span className="font-mono text-[10px]">publish seamlessly across</span>
            <div className="flex items-center gap-1.5">
              {["youtube", "twitch", "instagram", "linkedin", "x"].map((p) => (
                <div
                  key={p}
                  className="flex h-5 w-5 items-center justify-center rounded-xs border border-[#ede8df] bg-[#faf8f5]"
                >
                  <PlatformIcon platform={p} size={11} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
