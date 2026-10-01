"use client";

import { useHoneycomb } from "./use-honeycomb";
import { HoneycombCard } from "./honeycomb-card";
import { GridRowConfig, HoneycombGridProps } from "./types";
import { COMPLETE_PLATFORM_POOL } from "@/component/icons/social-icons";

const DEFAULT_ROWS: GridRowConfig[] = [
  { row: 0, count: 7, offset: false },
  { row: 1, count: 6, offset: true },
  { row: 2, count: 7, offset: false },
];

const CARD_SIZES = {
  sm: "w-10 h-10 sm:w-12 sm:h-12",
  md: "w-12 h-12 sm:w-14 sm:h-14",
  lg: "w-14 h-14 sm:w-16 sm:h-16",
};

export default function HoneycombGrid({
  rows = DEFAULT_ROWS,
  platformPool = COMPLETE_PLATFORM_POOL,
  intervalMs = 2000,
  cardSize = "md",
  selectedCategory,
  onHoverPlatform,
  className = "",
}: HoneycombGridProps) {
  const { totalPositions, activeSlots } = useHoneycomb(rows, platformPool, intervalMs);

  const sizeClass = CARD_SIZES[cardSize];

  return (
    <div
      className={`relative flex w-full select-none flex-col items-center justify-center py-2 ${className}`}
    >
      {/* Radial vignette */}
      <div
        className="relative flex max-w-6xl flex-col items-center justify-center overflow-visible p-2 sm:p-4"
        style={{
          maskImage:
            "radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,1) 38%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.2) 88%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,1) 38%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.2) 88%, transparent 100%)",
        }}
      >
        {/* Honeycomb Rows */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          {rows.map(({ row, count, offset }) => {
            const startIndex = rows
              .slice(0, row)
              .reduce((acc, currentRow) => acc + currentRow.count, 0);
            const rowSlots = totalPositions.slice(startIndex, startIndex + count);

            return (
              <div
                key={`honeycomb-row-${row}`}
                className={`flex items-center gap-1.5 sm:gap-2 ${
                  offset ? "translate-x-3 sm:translate-x-4 md:translate-x-5" : ""
                }`}
              >
                {rowSlots.map((slot) => {
                  const currentPlatform = activeSlots[slot.posId];
                  const isDimmed = Boolean(
                    selectedCategory &&
                      selectedCategory !== "all" &&
                      currentPlatform &&
                      currentPlatform.category !== selectedCategory,
                  );

                  return (
                    <HoneycombCard
                      key={slot.posId}
                      slot={slot}
                      platform={currentPlatform}
                      sizeClass={sizeClass}
                      isDimmed={isDimmed}
                      onHover={onHoverPlatform}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
