"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { XIcon, LinkedInIcon, RedditIcon, YouTubeIcon } from "@/component/icons/social-icons";

const platforms = [
  {
    name: "LinkedIn",
    type: "Post",
    icon: LinkedInIcon,
    color: "#0A66C2",
    className: "left-[5%] top-[4%]",
  },
  {
    name: "X",
    type: "Thread",
    icon: XIcon,
    color: "#e5e5e5",
    className: "right-[5%] top-[4%]",
  },
  {
    name: "Reddit",
    type: "Community",
    icon: RedditIcon,
    color: "#FF4500",
    className: "left-[5%] bottom-[4%]",
  },
  {
    name: "YouTube",
    type: "Video",
    icon: YouTubeIcon,
    color: "#FF0000",
    className: "right-[5%] bottom-[4%]",
  },
] as const;

/**
 * The important thing here is that every route:
 *
 * 1. starts close to the center
 * 2. travels mostly straight
 * 3. uses a small cubic curve at each turn
 * 4. terminates exactly at the platform
 *
 * Coordinates are based on the 600 x 280 SVG.
 */
const paths = [
  {
    id: "linkedin",
    d: `
      M282 132
      L250 132
      C242 132 238 128 238 120
      L238 58
      C238 50 234 46 226 46
      L70 46
    `,
  },
  {
    id: "x",
    d: `
      M318 132
      L350 132
      C358 132 362 128 362 120
      L362 58
      C362 50 366 46 374 46
      L530 46
    `,
  },
  {
    id: "reddit",
    d: `
      M282 156
      L250 156
      C242 156 238 160 238 168
      L238 222
      C238 230 234 234 226 234
      L70 234
    `,
  },
  {
    id: "youtube",
    d: `
      M318 156
      L350 156
      C358 156 362 160 362 168
      L362 222
      C362 230 366 234 374 234
      L530 234
    `,
  },
];

export default function DistributionFlow() {
  return (
    <div className="relative mt-8 h-[300px] w-full overflow-hidden">
      {/* Ambient center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/[0.055] blur-3xl" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 600 280"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="packet-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {paths.map((path, index) => (
          <g key={path.id}>
            {/* Route */}
            <motion.path
              id={`${path.id}-route`}
              d={path.d}
              stroke="rgba(115,115,115,0.3)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{
                pathLength: 0,
                opacity: 0,
              }}
              animate={{
                pathLength: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
                ease: [0.4, 0, 0.2, 1],
              }}
            />

            {/* Flow packet */}
            <circle r="2.2" fill="#fda4af" filter="url(#packet-glow)">
              <animateMotion
                path={path.d}
                dur="1.45s"
                begin={`${index * 0.12 + 0.55}s`}
                repeatCount="indefinite"
              />

              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="1.45s"
                begin={`${index * 0.12 + 0.55}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* Platform cards */}
      {platforms.map((platform, index) => (
        <PlatformCard key={platform.name} {...platform} delay={0.45 + index * 0.1} />
      ))}

      {/* Center */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute left-1/2 top-1/2 z-20 flex h-[76px] w-[124px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-[0_0_45px_rgba(244,63,94,0.08)] backdrop-blur-xl"
      >
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.65, 1, 0.65],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/[0.10] text-rose-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </motion.div>

        <span className="text-[10px] font-medium text-neutral-300">Your idea</span>
      </motion.div>
    </div>
  );
}

type PlatformCardProps = {
  name: string;
  type: string;
  icon: React.ElementType;
  color: string;
  className: string;
  delay: number;
};

function PlatformCard({ name, type, icon: Icon, color, className, delay }: PlatformCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.04,
      }}
      className={`absolute z-10 w-[112px] rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            color,
            backgroundColor: `${color}10`,
            border: `1px solid ${color}20`,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <div className="text-[10px] font-medium text-neutral-200">{name}</div>

          <div className="text-[9px] text-neutral-500">{type}</div>
        </div>
      </div>
    </motion.div>
  );
}
