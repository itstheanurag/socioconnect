"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("establishing secure creator session...");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken") || searchParams.get("access_token");
    const ticket = searchParams.get("ticket");
    const next = searchParams.get("next") || "/app";
    const error = searchParams.get("error");

    if (error) {
      setStatus(`authentication error: ${error}`);
      setTimeout(() => {
        router.push("/?auth=login");
      }, 2000);
      return;
    }

    if (accessToken) {
      document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (ticket) {
      document.cookie = `socioconnect_ticket=${encodeURIComponent(ticket)}; path=/; max-age=300; SameSite=Lax`;
    }

    router.replace(next);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4 lowercase font-mono">
      <div className="border border-[#ede8df] bg-white p-8 rounded-md shadow-xs text-center max-w-sm w-full space-y-4">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
        <h2 className="text-sm font-bold text-stone-900">socioconnect</h2>
        <p className="text-xs text-stone-600">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-mono text-xs text-stone-500 lowercase">
          loading authentication callback...
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
