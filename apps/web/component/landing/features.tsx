"use client";

import {
  FeaturesHeader,
  ScheduleCard,
  TimingCard,
  DistributionCard,
  RedditCard,
} from "@/component/landing/features/index";

export default function Features() {
  return (
    <section
      id="features"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#050508] text-white overflow-hidden"
    >
      {/* Subtle Background Glow Accent */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/5 rounded-full blur-[140px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Core Philosophy Header */}
        <FeaturesHeader />

        {/* Asymmetric Card Grid Composition */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 1: Schedule Everything (Span 7) */}
          <ScheduleCard />

          {/* Card 2: Timing Matters (Span 5) */}
          <TimingCard />

          {/* Card 3: One Idea Many Platforms (Span 8) */}
          <DistributionCard />

          {/* Card 4: Reddit Communities (Span 4) */}
          <RedditCard />
        </div>
      </div>
    </section>
  );
}
