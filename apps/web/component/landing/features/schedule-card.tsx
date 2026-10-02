"use client";

import { motion, type Variants } from "motion/react";
import { Calendar } from "lucide-react";

import FeatureLabel from "@/component/landing/features/label";
import ScheduleDeck from "@/component/landing/features/animations/schedule-deck";
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

export default function ScheduleCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-60px",
      }}
      variants={fadeInUp}
      className="group relative md:col-span-12 lg:col-span-7 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-neutral-700 sm:p-8"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-red-600/8 blur-3xl transition-all duration-700 group-hover:bg-red-600/12" />

      {/* Shared header */}
      <FeatureCardHeader
        number={1}
        category="DISPATCH"
        label={
          <FeatureLabel
            icon={<Calendar className="h-3.5 w-3.5 text-rose-400" />}
            text="Scheduling"
          />
        }
        title={
          <>
            Say it once.{" "}
            <span className="font-serif font-normal italic text-rose-300">
              We&apos;ll deliver it on time.
            </span>
          </>
        }
        description="One idea. Every platform. The right moment."
      />

      {/* Animation only — no card styling */}
      <ScheduleDeck />
    </motion.div>
  );
}
