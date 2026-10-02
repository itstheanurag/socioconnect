"use client";

import { motion, type Variants } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function PlatformAwareCard() {
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
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            Format Intelligence
          </span>
          <span className="text-xs text-neutral-500 font-mono">08 / NATIVE FORMATS</span>
        </div>

        <h3 className="font-display text-2xl font-bold tracking-tight text-neutral-100">
          Platform-aware publishing.{" "}
          <span className="font-serif italic font-normal text-rose-300">
            Zero copy-paste awkwardness.
          </span>
        </h3>
        <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
          Different networks demand different dialects. We automatically handle character counts,
          hashtag standards, image aspect ratio requirements, and container validations before
          publishing.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">YouTube Shorts</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Vertical 9:16 Video</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">LinkedIn Article</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Long-form editorial</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">Instagram Feed</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Square / 4:5 Carousel</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">X Posts &amp; Threads</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">280 char split logic</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">Reddit Text Post</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Markdown formatted</div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
          <div className="font-medium text-neutral-200">Threads Stream</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Conversational units</div>
        </div>
      </div>
    </motion.div>
  );
}
