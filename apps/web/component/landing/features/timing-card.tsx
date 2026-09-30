"use client";

import { motion, type Variants } from "motion/react";
import { Clock } from "lucide-react";

import FeatureLabel from "@/component/landing/features/label";
import TimingVisualization from "@/component/landing/features/animations/timing-visualization";
import FeatureCardHeader from "@/component/landing/features/feature-header";

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function TimingCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-60px",
      }}
      variants={fadeInUp}
      className="group relative flex overflow-hidden rounded-2xl border border-white/8 bg-[#0c0c14]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 sm:p-8 md:col-span-12 lg:col-span-5"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-rose-500/6 blur-3xl transition-all duration-500 group-hover:bg-rose-500/[9" />

      <div className="relative flex w-full flex-col">
        <FeatureCardHeader
          number={2}
          category="TIMING"
          label={
            <FeatureLabel
              icon={<Clock className="h-3.5 w-3.5 text-rose-400" />}
              text="Audience Synchronicity"
            />
          }
          title={
            <>
              Be there{" "}
              <span className="font-serif font-normal italic text-rose-300">when they are.</span>
            </>
          }
          description="Every audience has its moment."
        />

        {/* Animation only */}
        <TimingVisualization />
      </div>
    </motion.div>
  );
}
