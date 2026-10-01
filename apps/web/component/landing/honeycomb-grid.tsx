"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COMPLETE_PLATFORM_POOL, PlatformConfig } from "@/component/icons/social-icons";

// 5 → 7 → 8 → 7 → 5 = 32 slots
//
// The last row is intentionally included so the honeycomb
// doesn't visually terminate too early.
//
//   ● ● ● ● ●
//    ● ● ● ● ● ● ●
//   ● ● ● ● ● ● ● ●
//    ● ● ● ● ● ● ●
//     ● ● ● ● ●
//
const GRID_ROWS = [
  { row: 0, count: 7, offset: false },
  { row: 1, count: 6, offset: true },
  { row: 2, count: 7, offset: false },
];

interface SlotMeta {
  posId: string;
  row: number;
  col: number;
  distFromCenter: number;
  opacity: number;
  borderAlpha: number;
  glowFactor: number;
}

/**
 * Fisher-Yates shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Creates a shuffled platform queue.
 *
 * Instead of doing:
 *
 *   random(platform)
 *
 * every time, we consume this queue sequentially.
 *
 * This means every platform gets a chance to appear
 * before the pool starts repeating.
 */
function createPlatformQueue() {
  return shuffle(COMPLETE_PLATFORM_POOL);
}

/**
 * Get the next platform that isn't already visible.
 *
 * This prevents things like:
 *
 *   Instagram | Instagram | YouTube
 *
 * from happening.
 */
function getNextPlatform(
  queue: PlatformConfig[],
  activeSlots: {
    [posId: string]: PlatformConfig | null;
  },
) {
  const visibleIds = new Set(
    Object.values(activeSlots)
      .filter((platform): platform is PlatformConfig => platform !== null)
      .map((platform) => platform.id),
  );

  // Find the first platform in the queue that isn't currently visible.
  const availableIndex = queue.findIndex((platform) => !visibleIds.has(platform.id));

  if (availableIndex !== -1) {
    const [platform] = queue.splice(availableIndex, 1);
    return platform;
  }

  /**
   * Extremely unlikely case:
   *
   * Every platform in the queue is currently visible.
   *
   * Start a fresh cycle.
   */
  const availablePlatforms = COMPLETE_PLATFORM_POOL.filter(
    (platform) => !visibleIds.has(platform.id),
  );

  if (availablePlatforms.length > 0) {
    const platform = shuffle(availablePlatforms)[0];

    // Remove it from the queue if it exists.
    const queueIndex = queue.findIndex((item) => item.id === platform.id);

    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }

    return platform;
  }

  // Absolute fallback.
  return COMPLETE_PLATFORM_POOL[Math.floor(Math.random() * COMPLETE_PLATFORM_POOL.length)];
}

/**
 * Generate the initial state.
 *
 * We intentionally distribute platforms through the entire
 * honeycomb rather than randomly filling arbitrary positions.
 *
 * This guarantees that the bottom row also starts with platforms.
 */
function generateInitialOccupancy(positions: SlotMeta[]) {
  const initial: {
    [posId: string]: PlatformConfig | null;
  } = {};

  positions.forEach((pos) => {
    initial[pos.posId] = null;
  });

  let platformQueue = createPlatformQueue();

  /**
   * Occupancy per row.
   *
   * We intentionally keep at least:
   *
   *   4 / 5
   *   5 / 7
   *   6 / 8
   *   5 / 7
   *   4 / 5
   *
   * This makes sure the last row is always visually alive.
   */
  const rowOccupancy: Record<number, number> = {
    0: 4,
    1: 5,
    2: 6,
  };

  GRID_ROWS.forEach(({ row }) => {
    const rowSlots = positions.filter((position) => position.row === row);

    const shuffledSlots = shuffle(rowSlots);

    const target = Math.min(rowOccupancy[row], rowSlots.length);

    shuffledSlots.slice(0, target).forEach((slot) => {
      /**
       * If the queue is exhausted, start another shuffled cycle.
       */
      if (platformQueue.length === 0) {
        platformQueue = createPlatformQueue();
      }

      const platform = platformQueue.shift();

      if (platform) {
        initial[slot.posId] = platform;
      }
    });
  });

  return initial;
}

export default function HoneycombGrid() {
  /**
   * Generate the actual slot metadata.
   */
  const totalPositions = useMemo(() => {
    const list: SlotMeta[] = [];

    let idCounter = 0;

    GRID_ROWS.forEach(({ row, count }) => {
      for (let col = 0; col < count; col++) {
        /**
         * Center of the honeycomb.
         *
         * Since we now have 5 rows:
         *
         *   0
         *   1
         *   2 ← center
         *   3
         *   4
         */
        const normRowDist = Math.abs(row - 2) / 2;

        const normColDist = Math.abs(col - (count - 1) / 2) / 3.5;

        const dist = Math.sqrt(normRowDist * normRowDist + normColDist * normColDist);

        /**
         * Center is stronger.
         *
         * Edges progressively fade into the background.
         */
        const opacity = Math.max(0.28, Math.min(1, 1.05 - dist * 0.55));

        const borderAlpha = Math.max(0.04, Math.min(0.18, 0.2 - dist * 0.12));

        const glowFactor = Math.max(0.15, Math.min(1, 1 - dist * 0.65));

        list.push({
          posId: `slot-${idCounter++}`,
          row,
          col,
          distFromCenter: dist,
          opacity,
          borderAlpha,
          glowFactor,
        });
      }
    });

    return list;
  }, []);

  /**
   * Active platform state.
   */
  const [activeSlots, setActiveSlots] = useState<{
    [posId: string]: PlatformConfig | null;
  }>(() => generateInitialOccupancy(totalPositions));

  /**
   * Persistent platform queue.
   *
   * This is the important part.
   *
   * It survives between interval executions and prevents
   * the same few platforms from being selected repeatedly.
   */
  const platformQueue = useRef<PlatformConfig[]>(createPlatformQueue());

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlots((prev) => {
        const next = { ...prev };

        const occupiedKeys = Object.keys(next).filter((key) => next[key] !== null);

        const emptyKeys = Object.keys(next).filter((key) => next[key] === null);

        if (occupiedKeys.length === 0 || emptyKeys.length === 0) {
          return prev;
        }

        /**
         * --------------------------------------------------
         * PICK A SLOT TO VACATE
         * --------------------------------------------------
         *
         * Don't allow the last row to become completely empty.
         */
        const bottomRowSlots = totalPositions
          .filter((slot) => slot.row === 4)
          .map((slot) => slot.posId);

        const occupiedBottomRow = bottomRowSlots.filter((key) => next[key] !== null);

        /**
         * Prefer removing cards from the middle/upper rows.
         *
         * This keeps the bottom edge alive.
         */
        let removableKeys = occupiedKeys;

        if (occupiedBottomRow.length <= 2) {
          removableKeys = occupiedKeys.filter((key) => !bottomRowSlots.includes(key));
        }

        /**
         * If everything happens to be in the bottom row,
         * fall back to all occupied slots.
         */
        if (removableKeys.length === 0) {
          removableKeys = occupiedKeys;
        }

        const vacateKey = removableKeys[Math.floor(Math.random() * removableKeys.length)];

        /**
         * Save the old platform.
         *
         * We put it back at the END of the queue.
         *
         * This means it can return later, but won't
         * immediately dominate the animation.
         */
        const oldPlatform = next[vacateKey];

        if (oldPlatform) {
          platformQueue.current.push(oldPlatform);
        }

        next[vacateKey] = null;

        /**
         * --------------------------------------------------
         * PICK A NEW EMPTY SLOT
         * --------------------------------------------------
         */

        const populateKey = emptyKeys[Math.floor(Math.random() * emptyKeys.length)];

        /**
         * Get a platform that isn't currently visible.
         */
        const newPlatform = getNextPlatform(platformQueue.current, next);

        /**
         * --------------------------------------------------
         * PUT THE NEW PLATFORM INTO THE GRID
         * --------------------------------------------------
         */

        next[populateKey] = newPlatform;

        return next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [totalPositions]);

  return (
    <div className="relative flex w-full select-none flex-col items-center justify-center py-2">
      {/*
        Radial vignette.

        The center remains visible while the outer
        cards dissolve naturally into the background.
      */}
      <div
        className="relative flex max-w-5xl flex-col items-center justify-center overflow-visible p-2 sm:p-4"
        style={{
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.25) 85%, transparent 100%)",

          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.25) 85%, transparent 100%)",
        }}
      >
        {/* Honeycomb Rows */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          {GRID_ROWS.map(({ row, count, offset }) => {
            const startIndex = GRID_ROWS.slice(0, row).reduce(
              (acc, currentRow) => acc + currentRow.count,
              0,
            );

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

                  return (
                    <div
                      key={slot.posId}
                      className="relative flex h-12.5 w-12.5 items-center justify-center rounded-xl sm:h-15.5 sm:w-15.5 md:h-17.5 md:w-17.5"
                    >
                      {/*
                          Fixed ghost grid slot.
                        */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          border: `1px solid rgba(255, 255, 255, ${Math.max(
                            0.015,
                            slot.borderAlpha * 0.25,
                          )})`,

                          backgroundColor: `rgba(255, 255, 255, ${Math.max(
                            0.004,
                            slot.opacity * 0.01,
                          )})`,
                        }}
                      />

                      {/* Living platform */}
                      <AnimatePresence mode="wait">
                        {currentPlatform ? (
                          <motion.div
                            key={`${slot.posId}-${currentPlatform.id}`}
                            initial={{
                              opacity: 0,
                              scale: 0.85,
                            }}
                            animate={{
                              opacity: slot.opacity,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.85,
                            }}
                            transition={{
                              duration: 0.5,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            whileHover={{
                              scale: 1.1,
                              opacity: 1,
                              transition: {
                                duration: 0.15,
                              },
                            }}
                            style={{
                              borderColor: `rgba(255, 255, 255, ${slot.borderAlpha})`,

                              boxShadow: `
                                  0 0 10px -2px ${currentPlatform.glowColor},
                                  inset 0 0 8px -3px ${currentPlatform.glowColor}
                                `,
                            }}
                            className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-xl border bg-[#0c0c14]/90 backdrop-blur-md transition-colors hover:bg-[#141422] hover:border-white/35!"
                          >
                            {/* Platform icon */}
                            <div
                              className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                              style={{
                                color: currentPlatform.color,
                              }}
                            >
                              <currentPlatform.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6.5 md:w-6.5" />
                            </div>
                          </motion.div>
                        ) : (
                          /* Empty ghost cell */
                          <div
                            className="flex h-full w-full items-center justify-center rounded-xl border border-dashed"
                            style={{
                              borderColor: `rgba(255, 255, 255, ${Math.max(
                                0.01,
                                slot.borderAlpha * 0.2,
                              )})`,
                            }}
                          >
                            <span
                              className="h-1 w-1 rounded-full"
                              style={{
                                backgroundColor: `rgba(255, 255, 255, ${Math.max(
                                  0.02,
                                  slot.opacity * 0.08,
                                )})`,
                              }}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
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
