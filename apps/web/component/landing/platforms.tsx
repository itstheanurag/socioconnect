"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { PlatformConfig } from "@/component/icons/social-icons";
import { HoneycombGrid, GridRowConfig } from "@/component/landing/honeycomb";
import { CheckCircle2 } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const PLATFORM_GRID_ROWS: GridRowConfig[] = [
  { row: 0, count: 7, offset: false },
  { row: 1, count: 8, offset: true },
  { row: 2, count: 9, offset: false },
  { row: 3, count: 8, offset: true },
  { row: 4, count: 7, offset: false },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "social", label: "Social" },
  { id: "newsletter", label: "Newsletters" },
  { id: "developer", label: "Developer" },
  { id: "community", label: "Communities" },
  { id: "video", label: "Video" },
] as const;

export default function Platforms() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredPlatform, setHoveredPlatform] = useState<PlatformConfig | null>(null);

  return (
    <section
      id="platforms"
      className="relative w-full overflow-hidden border-t border-neutral-800 bg-neutral-950 px-4 py-20 text-neutral-200 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/[0.035] blur-[150px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-300">
              Native distribution matrix
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-neutral-100 sm:text-5xl">
            Wherever they gather.
            <span className="block font-serif font-normal italic text-rose-300">
              Already there.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-neutral-400 sm:text-base">
            43 native integrations. One draft, formatted for each room.
          </p>
        </motion.div>

        <div className="mb-8 mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:mb-10">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 ${
                  isSelected
                    ? "border-neutral-600 bg-neutral-800 text-neutral-100"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <HoneycombGrid
            rows={PLATFORM_GRID_ROWS}
            intervalMs={1500}
            cardSize="lg"
            selectedCategory={selectedCategory}
            onHoverPlatform={setHoveredPlatform}
          />
        </motion.div>

        <div className="mt-6 flex min-h-[36px] items-center justify-center">
          {hoveredPlatform ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-300"
            >
              <span className="font-semibold text-neutral-100">{hoveredPlatform.name}</span>
              <span className="text-neutral-600">•</span>
              <span className="capitalize">{hoveredPlatform.category}</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Native support
              </span>
            </motion.div>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
              Hover a network to inspect support
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
