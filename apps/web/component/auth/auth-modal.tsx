"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5c1.57 0 2.98.54 4.09 1.59l3.07-3.07C17.3 1.72 14.85 1 12 1 7.42 1 3.53 3.61 1.64 7.39l3.72 2.89C6.25 7.24 8.87 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.96 3.71-8.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.36 14.72c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.64 7.47C.6 9.54 0 11.87 0 14.36s.6 4.82 1.64 6.89l3.72-2.89c-.19-.57-.29-1.18-.29-1.8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.13 0-5.75-2.24-6.64-5.28L1.64 16.98C3.53 20.76 7.42 23 12 23z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, isAuthenticating } = useAuth();

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => !isAuthenticating && closeAuthModal()}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md my-8 overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl backdrop-blur-2xl text-neutral-200 z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Top ambient highlight line */}
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-rose-500/40 to-transparent" />

            {/* Inner background glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-600/10 rounded-full blur-[90px] -z-10"
              aria-hidden="true"
            />

            {/* Close Button */}
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Title & Description */}
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 pt-3">
                  Welcome to Socio
                  <span className="font-serif italic font-normal text-rose-300 ml-1">Connect</span>
                </h3>
                <p className="mt-2 text-sm text-neutral-400 font-light leading-relaxed">
                  Sign in or create your account
                </p>
              </div>

              {/* Primary OAuth Action */}
              <div className="space-y-4">
                <motion.button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={loginWithGoogle}
                  whileHover={{ scale: isAuthenticating ? 1 : 1.015 }}
                  whileTap={{ scale: isAuthenticating ? 1 : 0.985 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group relative w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-neutral-100 text-neutral-900 font-medium text-sm shadow-md hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-neutral-700" />
                      <span className="font-semibold text-neutral-800">
                        Redirecting to Google...
                      </span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-5 h-5" />
                      <span className="font-semibold text-neutral-900">Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[11px] text-neutral-500">
                  Google OAuth 2.0 authentication with zero password storage.
                </p>
              </div>

              {/* Security & Privacy Badges */}
              <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted OAuth Sessions &amp; Zero Platform Credentials Storage</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
