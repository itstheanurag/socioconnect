"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { PlatformIcon } from "./platform-icons";
import { useAuth } from "../../lib/auth-context";

export function LandingHero() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  const handleOpenStudio = () => {
    if (isAuthenticated) {
      router.push("/app");
    } else {
      openAuthModal("/app");
    }
  };

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white border-b border-[#ede8df]">
      {/* Background Soft Dotted Texture & Warm Amber Gradient */}
      <div className="absolute inset-0 trapped-dots opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-80 bg-gradient-to-tr from-[#F4DCB4]/45 via-[#fcf7ee]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md shadow-2xs mb-6 lowercase"
          >
            <Sparkles className="h-3.5 w-3.5 text-stone-800" />
            <span>built for content creators</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-600 font-normal">multi-network studio</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl leading-[1.1] lowercase"
          >
            one calm studio. every channel{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-serif italic font-normal text-stone-800">
                at its peak attention.
              </span>
              <span className="absolute inset-x-0 bottom-1.5 h-3 bg-[#F4DCB4] -z-0 -rotate-1 opacity-80 rounded-xs" />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="mt-6 text-base text-stone-600 sm:text-lg lg:text-xl font-normal max-w-3xl mx-auto leading-relaxed lowercase"
          >
            write your announcement, launch story, or stream drop once. socioconnect delivers it to
            youtube, twitch, instagram, x, linkedin, and reddit when each audience is actually
            online — with zero shared passwords.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lowercase"
          >
            <button
              type="button"
              onClick={handleOpenStudio}
              className="group inline-flex items-center gap-3 border border-[#dfc39a] bg-[#F4DCB4] px-6 py-3 text-xs font-mono font-bold text-stone-900 transition-all hover:bg-[#ebd0a3] hover:shadow-md hover:shadow-[#F4DCB4]/40 rounded-md cursor-pointer"
            >
              <span>open creator studio</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-stone-800" />
            </button>

            <a
              href="#editor"
              className="group inline-flex items-center gap-2.5 border border-dashed border-[#dcd5c8] bg-white px-6 py-3 text-xs font-mono font-semibold text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 rounded-md"
            >
              <Zap className="h-3.5 w-3.5 text-stone-800 fill-[#F4DCB4]" />
              <span>try live demo</span>
            </a>
          </motion.div>
        </div>

        {/* Embedded Image Mockup: Creator Studio Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 relative border border-dashed border-[#dfc39a] bg-[#faf8f5] p-2.5 sm:p-3 shadow-sm max-w-5xl mx-auto rounded-md"
        >
          {/* Mockup browser chrome header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#ede8df] bg-white mb-2 rounded-t-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f28b82]" />
              <span className="h-2 w-2 rounded-full bg-[#F4DCB4]" />
              <span className="h-2 w-2 rounded-full bg-[#81c995]" />
              <span className="ml-2 font-mono text-[11px] text-stone-400 lowercase">
                socioconnect.app/studio · multi-network creator studio &amp; scheduler
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-stone-600 lowercase">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>safe &amp; private connection</span>
            </div>
          </div>

          {/* Visual Mockup Image */}
          <div className="relative aspect-video w-full overflow-hidden border border-[#ede8df] bg-white rounded-b-sm">
            <Image
              src="/images/creator_studio_mockup.jpg"
              alt="socioconnect creator studio interface preview showing multi-channel composer"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </motion.div>

        {/* Channels Grid / Proof Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-dashed border-[#ede8df]"
        >
          <p className="text-center font-mono text-xs text-stone-600 mb-6 lowercase">
            official verified creator connections · never share your passwords
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { id: "youtube", name: "youtube", sub: "video & community" },
              { id: "twitch", name: "twitch", sub: "live alerts & clips" },
              { id: "instagram", name: "instagram", sub: "reels & posts" },
              { id: "x", name: "x (twitter)", sub: "threads & drops" },
              { id: "linkedin", name: "linkedin", sub: "creator stories" },
              { id: "peerlist", name: "peerlist", sub: "maker highlights" },
              { id: "reddit", name: "reddit", sub: "subreddit drops" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 border border-[#ede8df] bg-white p-2.5 rounded-md shadow-2xs hover:border-[#dfc39a] transition-colors lowercase"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#ede8df] bg-[#faf8f5] shrink-0">
                  <PlatformIcon platform={item.id} size={15} />
                </div>
                <div className="overflow-hidden">
                  <div className="font-mono text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-stone-600 truncate font-sans">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
