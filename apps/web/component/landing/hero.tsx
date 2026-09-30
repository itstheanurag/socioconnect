"use client";

import Auralis from "@/component/background/auralis";
import HoneycombGrid from "@/component/landing/honeycomb-grid";
import { motion } from "motion/react";
import { ArrowRight, Play, Check } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#050508]">
      {/* Background Auralis Shader Layer - strictly decorative & non-interactive */}
      <div
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <Auralis
          speed={0.25}
          grain={0.5}
          colors={["#ef4444", "#dc2626", "#991b1b"]}
          className="w-full h-full"
        />
        {/* Subtle Vignette overlays for soft depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/50 via-transparent to-[#050508]" />
      </div>

      {/* Main Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Announcement Pill with subtle italic accent */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-sm mb-6 hover:bg-white/[0.08] transition-all cursor-pointer group"
        >
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-medium text-neutral-300">
            Next-Gen Multi-Platform Scheduler •
          </span>
          <span className="font-serif italic text-xs font-normal text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center">
            effortless cross-posting
          </span>
        </motion.div>

        {/* Headline with editorial Serif Italic + Space Grotesk blend */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12] max-w-4xl">
          One Post.{" "}
          <span className="font-serif italic font-normal text-rose-300">Every Platform.</span>{" "}
          Scheduled in{" "}
          <span className="font-serif italic font-normal text-neutral-100 underline decoration-rose-500/40 decoration-wavy decoration-1 underline-offset-8">
            Seconds.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl font-light leading-relaxed">
          Draft once, customize for your audience, and{" "}
          <span className="font-serif italic font-normal text-white">automatically broadcast</span>{" "}
          across all major social networks simultaneously.
        </p>

        {/* Call to Actions with motion tap/hover */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <motion.a
            href="#get-started"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] transition-all duration-300"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>

          <motion.a
            href="#demo"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-neutral-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md transition-all duration-200 hover:text-white"
          >
            <Play className="w-4 h-4 fill-white/80 text-white/80" />
            <span>Watch 2-min Demo</span>
          </motion.a>
        </div>

        {/* Micro Social Proof */}
        <div className="mt-5 flex items-center gap-6 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            14-day free trial
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Instant multi-channel sync
          </span>
        </div>

        {/* Honeycomb Structured Platform Grid with vanishing/reappearing animations */}
        <div className="mt-14 w-full relative">
          <HoneycombGrid />
        </div>
      </div>
    </section>
  );
}
