"use client";

import { motion, type Variants } from "motion/react";
import { MessageSquare } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ThreadsCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="md:col-span-6 lg:col-span-4 group relative rounded-2xl border border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-2xl hover:border-white/20 transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-white/[0.05] border border-white/10 text-neutral-300">
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
            Sequential Slicing
          </span>
          <span className="text-xs text-neutral-500 font-mono">05 / THREADS</span>
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight text-white">
          Multi-part threads,{" "}
          <span className="font-serif italic font-normal text-rose-300">
            structured effortlessly.
          </span>
        </h3>
        <p className="mt-2.5 text-xs sm:text-sm text-neutral-400 leading-relaxed">
          Break deep-dive arguments and tutorials into sequential numbered posts for Threads
          and X without hitting character truncation.
        </p>
      </div>

      {/* Vertical Thread Timeline Mockup */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#07070c] p-3.5">
        <div className="space-y-2.5 relative pl-4 border-l border-white/10 ml-2">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#07070c]" />
            <div className="text-[11px] font-semibold text-neutral-200">1/ The Core Hook</div>
            <div className="text-[10px] text-neutral-400 truncate">Why distribution is 80% of content leverage...</div>
          </div>

          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-white/40 border-2 border-[#07070c]" />
            <div className="text-[11px] font-semibold text-neutral-200">2/ The Framework</div>
            <div className="text-[10px] text-neutral-400 truncate">3 rules for cross-platform timing synchronicity...</div>
          </div>

          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-[#07070c]" />
            <div className="text-[11px] font-semibold text-neutral-200">3/ Call to Discussion</div>
            <div className="text-[10px] text-neutral-400 truncate">What&apos;s your current multi-channel bottleneck?</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
