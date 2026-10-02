"use client";

import { motion, type Variants } from "motion/react";
import { Users, Flame, Building2, CircleDot } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AudienceEngineCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="md:col-span-12 lg:col-span-6 group relative rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl hover:border-neutral-700 transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-neutral-800 border border-neutral-700 text-neutral-300">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            Dual Engine
          </span>
          <span className="text-xs text-neutral-500 font-mono">09 / INTENT</span>
        </div>

        <h3 className="font-display text-2xl font-bold tracking-tight text-neutral-100">
          Engineered for{" "}
          <span className="font-serif italic font-normal text-rose-300">
            creators and businesses.
          </span>
        </h3>
        <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
          Whether you are an individual founder building personal distribution leverage or a company
          scaling multi-platform market awareness.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-200">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            For Creators &amp; Founders
          </div>
          <ul className="space-y-1.5 text-neutral-400 text-[11px]">
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Build high distribution leverage
            </li>
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Maintain relentless consistency
            </li>
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Never waste hours in manual posting
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-200">
            <Building2 className="w-3.5 h-3.5 text-rose-400" />
            For Companies &amp; Brands
          </div>
          <ul className="space-y-1.5 text-neutral-400 text-[11px]">
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Synchronize multi-channel launches
            </li>
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Reach hyper-targeted communities
            </li>
            <li className="flex items-center gap-1.5">
              <CircleDot className="w-2.5 h-2.5 text-rose-500" />
              Maintain 24/7 global presence
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
