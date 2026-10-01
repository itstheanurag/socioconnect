import { useMemo, useState, useEffect, useRef } from "react";
import { COMPLETE_PLATFORM_POOL, PlatformConfig } from "@/component/icons/social-icons";
import { GridRowConfig, SlotMeta } from "./types";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const random = seededRandom(seed + i * 17);
    const j = Math.floor(random * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getNextPlatform(
  queue: PlatformConfig[],
  pool: PlatformConfig[],
  activeSlots: { [posId: string]: PlatformConfig | null },
) {
  const visibleIds = new Set(
    Object.values(activeSlots)
      .filter((p): p is PlatformConfig => p !== null)
      .map((p) => p.id),
  );

  const availableIndex = queue.findIndex((p) => !visibleIds.has(p.id));
  if (availableIndex !== -1) {
    const [platform] = queue.splice(availableIndex, 1);
    return platform;
  }

  const availablePlatforms = pool.filter((p) => !visibleIds.has(p.id));
  if (availablePlatforms.length > 0) {
    const platform = shuffle(availablePlatforms)[0];
    const queueIndex = queue.findIndex((item) => item.id === platform.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }
    return platform;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function generateInitialOccupancy(
  positions: SlotMeta[],
  rows: GridRowConfig[],
  pool: PlatformConfig[],
) {
  const initial: { [posId: string]: PlatformConfig | null } = {};
  positions.forEach((pos) => {
    initial[pos.posId] = null;
  });

  let platformQueue = deterministicShuffle(pool, 42);
  const maxRow = Math.max(...rows.map((r) => r.row));

  rows.forEach(({ row }) => {
    const rowSlots = positions.filter((position) => position.row === row);
    const shuffledSlots = deterministicShuffle(rowSlots, 42 + row * 100);
    // Fill approximately 75-80% of each row
    const target = Math.min(Math.round(rowSlots.length * 0.78), rowSlots.length);

    shuffledSlots.slice(0, target).forEach((slot) => {
      if (platformQueue.length === 0) {
        platformQueue = deterministicShuffle(pool, 42 + row * 1000);
      }
      const platform = platformQueue.shift();
      if (platform) {
        initial[slot.posId] = platform;
      }
    });
  });

  // Ensure bottom row has at least some elements
  const bottomSlots = positions.filter((p) => p.row === maxRow);
  if (bottomSlots.every((s) => initial[s.posId] === null) && bottomSlots.length > 0) {
    const fallbackPlatform = pool[0];
    initial[bottomSlots[0].posId] = fallbackPlatform;
  }

  return initial;
}

export function useHoneycomb(
  rows: GridRowConfig[],
  pool: PlatformConfig[] = COMPLETE_PLATFORM_POOL,
  intervalMs = 2000,
) {
  const totalPositions = useMemo(() => {
    const list: SlotMeta[] = [];
    let idCounter = 0;
    const midRow = (rows.length - 1) / 2;
    const maxCount = Math.max(...rows.map((r) => r.count));

    rows.forEach(({ row, count }) => {
      for (let col = 0; col < count; col++) {
        const normRowDist = Math.abs(row - midRow) / Math.max(1, midRow);
        const normColDist = Math.abs(col - (count - 1) / 2) / (maxCount / 2);
        const dist = Math.sqrt(normRowDist * normRowDist + normColDist * normColDist);

        const opacity = Math.max(0.24, Math.min(1, 1.06 - dist * 0.5));
        const borderAlpha = Math.max(0.04, Math.min(0.18, 0.2 - dist * 0.1));
        const glowFactor = Math.max(0.15, Math.min(1, 1 - dist * 0.6));

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
  }, [rows]);

  const [activeSlots, setActiveSlots] = useState<{ [posId: string]: PlatformConfig | null }>(() =>
    generateInitialOccupancy(totalPositions, rows, pool),
  );

  const platformQueue = useRef<PlatformConfig[]>([]);

  useEffect(() => {
    platformQueue.current = shuffle(pool);

    const interval = setInterval(() => {
      setActiveSlots((prev) => {
        const next = { ...prev };
        const occupiedKeys = Object.keys(next).filter((k) => next[k] !== null);
        const emptyKeys = Object.keys(next).filter((k) => next[k] === null);

        if (occupiedKeys.length === 0 || emptyKeys.length === 0) {
          return prev;
        }

        const maxRow = Math.max(...rows.map((r) => r.row));
        const bottomSlots = totalPositions.filter((s) => s.row === maxRow).map((s) => s.posId);
        const occupiedBottom = bottomSlots.filter((k) => next[k] !== null);

        let removableKeys = occupiedKeys;
        if (occupiedBottom.length <= 2) {
          removableKeys = occupiedKeys.filter((k) => !bottomSlots.includes(k));
        }
        if (removableKeys.length === 0) {
          removableKeys = occupiedKeys;
        }

        const vacateKey = removableKeys[Math.floor(Math.random() * removableKeys.length)];
        const oldPlatform = next[vacateKey];
        if (oldPlatform) {
          platformQueue.current.push(oldPlatform);
        }
        next[vacateKey] = null;

        const populateKey = emptyKeys[Math.floor(Math.random() * emptyKeys.length)];
        const newPlatform = getNextPlatform(platformQueue.current, pool, next);
        next[populateKey] = newPlatform;

        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [totalPositions, rows, pool, intervalMs]);

  return { totalPositions, activeSlots };
}
