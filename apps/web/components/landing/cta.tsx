"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlatformIcon } from "./platform-icons";
import { useAuth } from "../../lib/auth-context";

export function LandingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const { isAuthenticated, mockLogin } = useAuth();
  const router = useRouter();

  const handleOpenStudio = () => {
    if (!isAuthenticated) {
      mockLogin();
    }
    router.push("/app");
  };

  const floatingPlatforms = [
    { id: "youtube", pos: { top: "12%", left: "8%" }, delay: 0.3 },
    { id: "twitch", pos: { top: "18%", right: "8%" }, delay: 0.4 },
    { id: "instagram", pos: { top: "45%", left: "4%" }, delay: 0.5 },
    { id: "x", pos: { top: "50%", right: "5%" }, delay: 0.6 },
    { id: "linkedin", pos: { bottom: "18%", left: "10%" }, delay: 0.7 },
    { id: "tiktok", pos: { bottom: "15%", right: "10%" }, delay: 0.8 },
  ];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-white border-t border-line">
      {/* Background Soft Dotted Texture & Warm Amber Glow */}
      <div className="absolute inset-0 trapped-dots opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-gradient-to-t from-[#F4DCB4]/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Floating Animated Platform Badges */}
      {floatingPlatforms.map(({ id, pos, delay }) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay }}
          style={pos}
          className="absolute hidden md:flex items-center justify-center p-2.5 bg-white border border-line rounded-md shadow-xs pointer-events-none z-0 hover:border-secondary-border transition-all"
        >
          <PlatformIcon platform={id} size={20} />
        </motion.div>
      ))}

      <div
        ref={ref}
        className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center lowercase space-y-6 z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md">
            <Sparkles className="h-3.5 w-3.5 text-stone-800" />
            <span>claim back 10 hours every week</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
            ready to publish calmly?{" "}
            <span className="font-serif italic font-normal text-stone-800 block sm:inline">
              all your channels in one studio.
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
            stop juggling 8 separate tabs, reformatting thumbnails, and missing peak timezone drops.
            write your content once and let socioconnect studio take care of the rest.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={handleOpenStudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-secondary-border bg-secondary px-8 py-3.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-md shadow-xs cursor-pointer text-base"
          >
            <Sparkles className="h-4 w-4" />
            <span>open creator studio</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Security & Feature Guarantees */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 border-t border-dashed border-line flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-stone-500"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% private &amp; official oauth 2.0</span>
          </div>
          <span className="text-stone-300">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#dfc39a]" />
            <span>zero password storage</span>
          </div>
          <span className="text-stone-300">&bull;</span>
          <span>cancel or disconnect anytime</span>
        </motion.div>
      </div>
    </section>
  );
}
