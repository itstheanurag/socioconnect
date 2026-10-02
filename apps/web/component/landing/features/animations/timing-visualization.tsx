"use client";

import { motion } from "motion/react";

import {
  LinkedInIcon,
  RedditIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/component/icons/social-icons";

const platforms = [
  {
    name: "LinkedIn",
    icon: LinkedInIcon,
    color: "#0A66C2",
    time: "09:30",
    start: 15,
    width: 24,
  },
  {
    name: "Reddit",
    icon: RedditIcon,
    color: "#FF4500",
    time: "14:00",
    start: 38,
    width: 23,
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    color: "#E1306C",
    time: "18:30",
    start: 63,
    width: 24,
  },
  {
    name: "YouTube",
    icon: YouTubeIcon,
    color: "#FF0000",
    time: "20:00",
    start: 72,
    width: 20,
  },
];

const hours = ["06", "09", "12", "15", "18", "21"];

export default function TimingVisualization() {
  return (
    <div className="relative mt-8 flex min-h-[250px] items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/6 blur-3xl" />

      {/* Visualization */}
      <div className="relative w-full max-w-[460px]">
        {/* Time labels */}
        <div className="mb-5 grid grid-cols-6">
          {hours.map((hour) => (
            <span key={hour} className="text-center font-mono text-[9px] text-neutral-600">
              {hour}:00
            </span>
          ))}
        </div>

        {/* Activity area */}
        <div className="relative">
          {/* Vertical grid */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-6">
            {hours.map((hour) => (
              <div key={hour} className="border-l border-neutral-800/60 last:border-r" />
            ))}
          </div>

          {/* Moving current-time indicator */}
          <motion.div
            initial={{ left: "0%" }}
            animate={{
              left: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute -top-3 bottom-0 z-20 w-px bg-rose-400/50"
          >
            <motion.div
              animate={{
                scale: [0.8, 1.15, 0.8],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]"
            />
          </motion.div>

          {/* Platform activity */}
          <div className="relative space-y-5">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;

              return (
                <div
                  key={platform.name}
                  className="relative grid grid-cols-[82px_1fr] items-center gap-3"
                >
                  {/* Platform */}
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 shrink-0" />

                    <span className="truncate text-[10px] text-neutral-400">{platform.name}</span>
                  </div>

                  {/* Activity lane */}
                  <div className="relative h-8">
                    {/* Base line */}
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-neutral-800" />

                    {/* Active window */}
                    <motion.div
                      initial={{
                        opacity: 0,
                        scaleX: 0.6,
                      }}
                      whileInView={{
                        opacity: 1,
                        scaleX: 1,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + index * 0.15,
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute top-1/2 h-[3px] -translate-y-1/2 origin-left rounded-full"
                      style={{
                        left: `${platform.start}%`,
                        width: `${platform.width}%`,
                        backgroundColor: platform.color,
                        boxShadow: `0 0 12px ${platform.color}80`,
                      }}
                    >
                      {/* Peak */}
                      <motion.div
                        animate={{
                          scale: [0.8, 1.3, 0.8],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.35,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute right-[35%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                        style={{
                          backgroundColor: platform.color,
                          boxShadow: `0 0 12px ${platform.color}`,
                        }}
                      />
                    </motion.div>

                    {/* Peak time */}
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.7 + index * 0.12,
                      }}
                      className="absolute -top-3 right-0 font-mono text-[8px] text-neutral-600"
                    >
                      {platform.time}
                    </motion.span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <span className="h-px w-8 bg-neutral-800" />

          <span className="text-[10px] text-neutral-600">audience active</span>

          <span className="text-[10px] text-neutral-400">×</span>

          <span className="text-[10px] text-neutral-300">best moment</span>

          <span className="h-px w-8 bg-neutral-800" />
        </motion.div>
      </div>
    </div>
  );
}
