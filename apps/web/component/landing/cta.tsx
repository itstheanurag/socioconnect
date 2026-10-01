"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Cta() {
  const { openAuthModal } = useAuth();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
      className="mt-28 sm:mt-36 relative rounded-3xl border border-white/1 bg-linear-to-b from-[#0c0c14] to-[#07070d] p-8 sm:p-14 text-center overflow-hidden shadow-2xl"
    >
      {/* Subtle Ambient Radial Glow Behind CTA */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
          You already have something to say.{" "}
          <span className="font-serif italic font-normal text-rose-300">
            Make sure it gets heard.
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-neutral-300 font-light leading-relaxed max-w-2xl">
          Create once. Choose where it belongs. Decide when it should be heard.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <motion.button
            type="button"
            onClick={openAuthModal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] transition-all duration-300 cursor-pointer"
          >
            <span>Start publishing</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.a
            href="#demo"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-200 hover:text-white"
          >
            <span>See how it works</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
