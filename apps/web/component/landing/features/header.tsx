"use client";

import { motion, type Variants } from "motion/react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function FeaturesHeader() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
      className="max-w-3xl mx-auto text-center mb-16 sm:mb-24"
    >
      {/* Section Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/4 border border-white/10 backdrop-blur-md mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />

        <span className="text-xs font-medium uppercase tracking-wider text-neutral-300">
          Distribution &amp; Timing
        </span>
      </div>

      {/* Core Philosophy Headline */}
      <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
        What you say <span className="font-serif italic font-normal text-rose-300">matters.</span>
        <br />
        <span className="font-serif italic font-normal text-rose-300">
          Where you say it matters even more.
        </span>{" "}
        <br />
      </h2>
    </motion.div>
  );
}
