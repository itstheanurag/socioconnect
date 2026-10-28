"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { acceptWorkspaceInvite } from "@/lib/api-client";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useNotification();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const accept = async () => {
    if (!token) return;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setStatus("accepting");
    setError(null);
    try {
      await acceptWorkspaceInvite(token);
      setStatus("accepted");
      toast.success("Invitation accepted", "The workspace is now available in your switcher.");
      setTimeout(() => router.push("/dashboard?section=team"), 900);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not accept the invitation.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-200">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SocioConnect
        </Link>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-7 shadow-2xl backdrop-blur-xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
            {status === "accepted" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <UserPlus className="h-5 w-5 text-rose-300" />
            )}
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-neutral-100">
            {status === "accepted" ? "You are in" : "Join workspace"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            {status === "accepted"
              ? "Redirecting to the team workspace…"
              : "Accept this invitation to add the workspace to your switcher. Sign in with the invited email address."}
          </p>

          {!token && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-200">
              This invitation link is missing a token.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-200">
              {error}
            </div>
          )}

          {status !== "accepted" && (
            <button
              type="button"
              onClick={() => void accept()}
              disabled={!token || status === "accepting"}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              {status === "accepting" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              {isAuthenticated ? "Accept invitation" : "Sign in and accept"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
