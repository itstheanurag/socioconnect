"use client";

import { motion, type Variants } from "motion/react";
import { Bot, ArrowRight } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AiPublishingCard() {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Bot className="w-3.5 h-3.5" />
            AI Native Bridge
          </span>
          <span className="text-[11px] text-amber-400 font-mono uppercase bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
            Coming Soon
          </span>
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight text-white">
          Publish from the tools{" "}
          <span className="font-serif italic font-normal text-rose-300">
            you already use.
          </span>
        </h3>
        <p className="mt-2.5 text-xs sm:text-sm text-neutral-400 leading-relaxed">
          Direct prompt-to-publish integrations for ChatGPT and Claude are in development,
          enabling instantaneous queueing right from your reasoning tools.
        </p>
      </div>

      {/* AI Integration Conceptual Pipeline */}
      <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-xs font-mono text-neutral-300">
            ChatGPT
          </div>
          <span className="text-neutral-500 text-xs">&amp;</span>
          <div className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-xs font-mono text-neutral-300">
            Claude
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
        <div className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/40 text-xs font-mono text-rose-300">
          SocioConnect API
        </div>
      </div>
    </motion.div>
  );
}
