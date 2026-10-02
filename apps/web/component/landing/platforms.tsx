"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { PlatformConfig } from "@/component/icons/social-icons";
import { HoneycombGrid, GridRowConfig } from "@/component/landing/honeycomb";
import { Sparkles, CheckCircle2 } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// 7 → 8 → 9 → 8 → 7 = 39 slots for grand platform matrix
const PLATFORM_GRID_ROWS: GridRowConfig[] = [
  { row: 0, count: 7, offset: false },
  { row: 1, count: 8, offset: true },
  { row: 2, count: 9, offset: false },
  { row: 3, count: 8, offset: true },
  { row: 4, count: 7, offset: false },
];

const CATEGORIES = [
  { id: "all", label: "All Platforms", count: 32 },
  { id: "social", label: "Social & Short-Form", count: 9 },
  { id: "newsletter", label: "Newsletters & Articles", count: 5 },
  { id: "developer", label: "Developer & Tech", count: 5 },
  { id: "community", label: "Communities & Chat", count: 10 },
  { id: "video", label: "Video & Podcasts", count: 3 },
] as const;

export default function Platforms() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredPlatform, setHoveredPlatform] = useState<PlatformConfig | null>(null);

  return (
    <section
      id="platforms"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-200 overflow-hidden border-t border-neutral-800"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-rose-600/[0.035] rounded-full blur-[170px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          {/* Section Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-300">
              Native Distribution Matrix
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.15]">
            Every platform where your audience gathers.{" "}
            <span className="font-serif italic font-normal text-rose-300">Synchronized.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            From mainstream visual feeds and executive networks to developer forums, newsletters,
            and decentralized protocols — broadcast with native dialect compliance.
          </p>
        </motion.div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "text-neutral-100 bg-neutral-800 border border-neutral-700 shadow-md"
                    : "text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-neutral-800 text-neutral-500 group-hover:text-neutral-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reused Generic Honeycomb Component */}
        <HoneycombGrid
          rows={PLATFORM_GRID_ROWS}
          intervalMs={1800}
          cardSize="md"
          selectedCategory={selectedCategory}
          onHoverPlatform={setHoveredPlatform}
        />

        {/* Platform Hover Information Card */}
        <div className="mt-8 min-h-[44px] flex items-center justify-center">
          {hoveredPlatform && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300"
            >
              <span className="font-semibold text-neutral-100">{hoveredPlatform.name}</span>
              <span className="text-neutral-500">•</span>
              <span className="capitalize">{hoveredPlatform.category}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully Supported
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
