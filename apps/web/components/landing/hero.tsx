"use client";

import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlatformIcon } from "./platform-icons";
import { useAuth } from "../../lib/auth-context";

export function LandingHero() {
  const { isAuthenticated, mockLogin } = useAuth();
  const router = useRouter();

  const handleOpenStudio = () => {
    if (!isAuthenticated) {
      mockLogin();
    }
    router.push("/app");
  };

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white border-b border-line">
      {/* Background Soft Dotted Texture & Warm Amber Gradient */}
      <div className="absolute inset-0 trapped-dots opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[320px] bg-gradient-to-b from-[#F4DCB4]/25 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Badges and Meta Bar */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md">
            <Sparkles className="h-3.5 w-3.5 text-stone-800" />
            <span className="font-bold">for creators &amp; independent builders</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-stone-600 font-normal">multi-network studio</span>
          </div>

          {/* Primary Editorial Headline */}
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl font-sans lowercase leading-tight">
            create once.{" "}
            <span className="font-serif italic font-normal text-stone-800">
              publish at peak hours everywhere.
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-stone-600 font-sans leading-relaxed lowercase">
            one calm studio. every channel you love. draft your idea once, let ai adapt the format,
            and dispatch or schedule across youtube, instagram, tiktok, linkedin, x, and threads.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 lowercase">
            <button
              type="button"
              onClick={handleOpenStudio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-secondary-border bg-secondary px-6 py-3 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-md shadow-xs cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>open creator studio</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <a
              href="#calendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-line bg-white px-5 py-3 font-mono text-xs text-stone-700 hover:border-stone-400 transition-colors rounded-md shadow-2xs"
            >
              <span>explore smart scheduler</span>
            </a>
          </div>

          {/* Key Value Micro-Banners */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-stone-500 lowercase">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>zero password storage (official oauth 2.0)</span>
            </div>
            <span className="hidden sm:inline-block text-stone-300">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#dfc39a]" />
              <span>staggered timezone drops</span>
            </div>
          </div>
        </div>

        {/* Embedded Image Mockup: Creator Studio Interface */}
        <div className="mt-12 relative mx-auto max-w-5xl rounded-md border border-line bg-white p-2 shadow-xl shadow-stone-900/5">
          <div className="relative rounded-sm overflow-hidden border border-line bg-[#faf8f5]">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2 text-xs font-mono text-stone-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>
                  socioconnect.app/studio &middot; multi-network creator studio &amp; scheduler
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">oauth verified</span>
              </div>
            </div>

            {/* Generated Studio Mockup Image */}
            <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
              <img
                src="/images/creator_studio_mockup.jpg"
                alt="socioconnect creator studio interface preview showing multi-channel composer"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Platform Strip Under Hero */}
        <div className="mt-10 pt-8 border-t border-dashed border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500 lowercase">
          <span className="font-semibold text-stone-800">publishing pipelines ready for:</span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { id: "youtube", name: "youtube" },
              { id: "twitch", name: "twitch" },
              { id: "instagram", name: "instagram" },
              { id: "tiktok", name: "tiktok" },
              { id: "linkedin", name: "linkedin" },
              { id: "x", name: "x" },
              { id: "threads", name: "threads" },
              { id: "peerlist", name: "peerlist" },
              { id: "reddit", name: "reddit" },
              { id: "bluesky", name: "bluesky" },
            ].map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 rounded-sm shadow-2xs text-stone-800 font-medium"
              >
                <PlatformIcon platform={p.id} size={13} />
                <span className="text-[11px]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
