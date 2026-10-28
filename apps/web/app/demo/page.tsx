"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Share2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@socioconnect.app";

export default function DemoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/v1/auth/demo/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(body.message || "Demo access is not available.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the API. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-200">
      <div className="fixed top-0 left-1/3 h-80 w-80 rounded-full bg-rose-600/10 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SocioConnect
        </Link>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-7 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/25">
              <Share2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-neutral-100">Demo access</div>
              <div className="text-[11px] text-neutral-500">Marketplace review account</div>
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-neutral-400">
            Sign in to a seeded workspace with sample accounts, drafts, scheduled posts, and agent
            activity. Publishing still requires an explicit preview and confirmation.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="demo-email" className="text-xs font-medium text-neutral-300">
                Email
              </label>
              <input
                id="demo-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-rose-500/50 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="demo-password" className="text-xs font-medium text-neutral-300">
                Password
              </label>
              <input
                id="demo-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Provided with the submission"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-rose-500/50 focus:outline-hidden"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              {loading ? "Signing in…" : "Enter demo workspace"}
            </button>
          </form>

          <p className="mt-5 text-center text-[10px] leading-relaxed text-neutral-600">
            Demo login is disabled unless explicitly enabled by the deployment. It is intended for
            marketplace reviewers, not production customers.
          </p>
        </div>
      </div>
    </main>
  );
}
