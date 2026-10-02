"use client";

import { motion, type Variants } from "motion/react";
import { TelegramIcon } from "@/component/icons/social-icons";
import FeatureCardHeader from "@/component/landing/features/feature-header";
import FeatureLabel from "@/component/landing/features/label";
import TelegramPublishFlow from "@/component/landing/features/animations/telegram-publish-flow";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function TelegramCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-neutral-700 sm:p-7 md:col-span-6 lg:col-span-4"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#24A1DE]/8 blur-3xl transition-all duration-700 group-hover:bg-[#24A1DE]/15" />

      <FeatureCardHeader
        number={6}
        category="TELEGRAM"
        label={
          <FeatureLabel
            icon={<TelegramIcon className="h-3.5 w-3.5 text-[#24A1DE]" />}
            text="Bot Publishing Interface"
          />
        }
        title={
          <>
            Publish from{" "}
            <span className="font-serif font-normal italic text-rose-300">telegram.</span>
          </>
        }
        description="Send your content and schedule it directly from Telegram."
      />

      <TelegramPublishFlow />
    </motion.div>
  );
}
