"use client";

import { motion, type Variants } from "motion/react";
import { GitFork } from "lucide-react";

import FeatureLabel from "@/component/landing/features/label";
import DistributionFlow from "@/component/landing/features/animations/distribution-flow";
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

export default function DistributionCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-60px",
      }}
      variants={fadeInUp}
      className="group relative md:col-span-12 lg:col-span-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-neutral-700 sm:p-8"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-red-600/8 blur-3xl transition-all duration-700 group-hover:bg-red-600/12" />

      <FeatureCardHeader
        number={3}
        category="FAN-OUT"
        label={
          <FeatureLabel
            icon={<GitFork className="h-3.5 w-3.5 text-rose-400" />}
            text="Distribution"
          />
        }
        title={
          <>
            One idea.{" "}
            <span className="font-serif font-normal italic text-rose-300">Every channel.</span>
          </>
        }
        description="One source. Every platform, in its own language."
      />

      <DistributionFlow />
    </motion.div>
  );
}
