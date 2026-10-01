"use client";

import { motion, AnimatePresence } from "motion/react";
import { PlatformConfig } from "@/component/icons/social-icons";
import { SlotMeta } from "./types";

interface HoneycombCardProps {
  slot: SlotMeta;
  platform: PlatformConfig | null;
  sizeClass: string;
  isDimmed?: boolean;
  onHover?: (platform: PlatformConfig | null) => void;
}

export function HoneycombCard({
  slot,
  platform,
  sizeClass,
  isDimmed = false,
  onHover,
}: HoneycombCardProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${sizeClass}`}
      style={{
        opacity: isDimmed ? 0.15 : slot.opacity,
        transition: "opacity 0.3s ease",
      }}
    >
      <AnimatePresence mode="wait">
        {platform ? (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 6 }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ scale: 1.15, zIndex: 30 }}
            onMouseEnter={() => onHover?.(platform)}
            onMouseLeave={() => onHover?.(null)}
            className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-2xl transition-all duration-300 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(12, 12, 20, 0.8)",
              borderColor: `rgba(255, 255, 255, ${slot.borderAlpha})`,
              borderWidth: "1px",
              borderStyle: "solid",
              boxShadow: `0 4px 20px -2px ${platform.glowColor}`,
            }}
          >
            {/* Subtle inner glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${platform.glowColor}, transparent 75%)`,
              }}
            />

            {/* Platform Icon */}
            <div
              className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ color: platform.color }}
            >
              {platform.icon({ className: "w-5 h-5 sm:w-6 sm:h-6" })}
            </div>
          </motion.div>
        ) : (
          <div
            key="empty"
            className="h-full w-full rounded-2xl border border-dashed"
            style={{
              borderColor: `rgba(255, 255, 255, ${Math.max(0.02, slot.borderAlpha * 0.4)})`,
              backgroundColor: "rgba(255, 255, 255, 0.005)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
