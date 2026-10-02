"use client";

import { motion, type Variants } from "motion/react";
import { RedditIcon } from "@/component/icons/social-icons";
import RedditCommunityFlow from "@/component/landing/features/animations/reddit-community-flow";
import FeatureCardHeader from "@/component/landing/features/feature-header";
import FeatureLabel from "@/component/landing/features/label";

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

export default function RedditCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-60px",
      }}
      variants={fadeInUp}
      className="group relative md:col-span-12 lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-neutral-700 sm:p-8"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/6 blur-3xl transition-all duration-700 group-hover:bg-orange-500/10" />

      {/* Header */}
      <FeatureCardHeader
        number={4}
        category="REDDIT"
        label={
          <FeatureLabel
            icon={<RedditIcon className="h-3.5 w-3.5 text-[#FF4500]" />}
            text="Community Precision"
          />
        }
        title={
          <>
            Reach the right subreddit,{" "}
            <span className="font-serif font-normal italic text-rose-300">not just a feed.</span>
          </>
        }
        description="Find the communities where your idea actually belongs."
      />

      {/* Community matching visualization */}
      <RedditCommunityFlow />
    </motion.div>
  );
}
