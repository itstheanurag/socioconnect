"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Check, Send } from "lucide-react";

import {
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  RedditIcon,
  ThreadsIcon,
  YouTubeIcon,
} from "@/component/icons/social-icons";

type Dispatch = {
  id: string;
  platform: string;
  content: string;
  time: string;
  icon: React.ElementType;
  color: string;
};

const DISPATCHES: Dispatch[] = [
  {
    id: "instagram",
    platform: "Instagram",
    content: "Carousel scheduled",
    time: "10:30 AM",
    icon: InstagramIcon,
    color: "#E1306C",
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    content: "Post scheduled",
    time: "12:00 PM",
    icon: LinkedInIcon,
    color: "#0A66C2",
  },
  {
    id: "x",
    platform: "X",
    content: "Thread scheduled",
    time: "02:30 PM",
    icon: XIcon,
    color: "#FFFFFF",
  },
  {
    id: "reddit",
    platform: "Reddit",
    content: "Community post",
    time: "09:00 AM",
    icon: RedditIcon,
    color: "#FF4500",
  },
  {
    id: "threads",
    platform: "Threads",
    content: "Post scheduled",
    time: "11:30 AM",
    icon: ThreadsIcon,
    color: "#F5F5F7",
  },
  {
    id: "youtube",
    platform: "YouTube",
    content: "Video scheduled",
    time: "06:00 PM",
    icon: YouTubeIcon,
    color: "#FF0000",
  },
];

const MAX_VISIBLE_CARDS = 4;

export default function ScheduleDeck() {
  const [started, setStarted] = useState(false);
  const [dispatchIndex, setDispatchIndex] = useState(0);
  const [deck, setDeck] = useState<Dispatch[]>([]);

  /*
   * Start the scheduling animation.
   */
  const startScheduling = () => {
    if (started) return;

    setStarted(true);

    // Give the button time to collapse before
    // the first dispatch arrives.
    setTimeout(() => {
      setDeck([DISPATCHES[0]]);
      setDispatchIndex(1);
    }, 550);
  };

  /*
   * Once scheduling has started, continuously
   * add a new platform to the top of the deck.
   */
  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setDeck((currentDeck) => {
        const next = DISPATCHES[dispatchIndex % DISPATCHES.length];

        return [next, ...currentDeck].slice(0, MAX_VISIBLE_CARDS);
      });

      setDispatchIndex((current) => current + 1);
    }, 1800);

    return () => clearInterval(interval);
  }, [started, dispatchIndex]);

  return (
    <div className="relative mt-3 flex min-h-90 w-full items-center justify-center overflow-hidden rounded-xl  px-5 py-8">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/6 blur-3xl" />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="schedule-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.65,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10"
          >
            <motion.button
              type="button"
              onClick={startScheduling}
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="group relative flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition-colors hover:bg-white/9"
            >
              {/* Button glow */}
              <span className="absolute inset-0 -z-10 rounded-xl bg-rose-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

              <Calendar className="h-4 w-4 text-rose-400" />

              <span>Schedule post</span>

              <Send className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-300 group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="dispatch-deck"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative h-67.5 w-full max-w-110"
          >
            {/* Small status */}
            <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 -translate-y-full items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-medium text-neutral-400">Dispatching</span>
            </div>

            {/* Card deck */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence initial={false}>
                {deck.map((dispatch, index) => {
                  const Icon = dispatch.icon;

                  return (
                    <motion.div
                      key={`${dispatch.id}-${dispatchIndex - index}`}
                      initial={{
                        opacity: 0,
                        y: -55,
                        scale: 0.92,
                        rotate: index === 0 ? -1 : 0,
                      }}
                      animate={{
                        opacity: 1 - index * 0.2,
                        y: index * 15,
                        scale: 1 - index * 0.055,
                        rotate: index === 0 ? 0 : index === 1 ? -1.2 : 1.2,
                      }}
                      exit={{
                        opacity: 0,
                        y: 45,
                        scale: 0.9,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        zIndex: MAX_VISIBLE_CARDS - index,
                      }}
                      className="absolute w-full max-w-100"
                    >
                      <div
                        className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0c0c14]/95 p-4 shadow-2xl backdrop-blur-xl"
                        style={{
                          boxShadow:
                            index === 0 ? `0 20px 50px -20px ${dispatch.color}30` : undefined,
                        }}
                      >
                        {/* Platform glow */}
                        <div
                          className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-10 blur-3xl"
                          style={{
                            backgroundColor: dispatch.color,
                          }}
                        />

                        <div className="relative flex items-center gap-3">
                          {/* Platform icon */}
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                              color: dispatch.color,
                              backgroundColor: `${dispatch.color}0D`,
                              borderColor: `${dispatch.color}25`,
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {dispatch.platform}
                              </span>

                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                                Scheduled
                              </span>
                            </div>

                            <p className="mt-0.5 text-xs text-neutral-500">{dispatch.content}</p>
                          </div>

                          {/* Time */}
                          <div className="shrink-0 text-right">
                            <div className="font-mono text-xs text-neutral-300">
                              {dispatch.time}
                            </div>

                            <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-neutral-600">
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                              queued
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 translate-y-full items-center gap-2 whitespace-nowrap"
            >
              <span className="text-[10px] text-neutral-600">One post</span>

              <span className="h-px w-5 bg-white/8" />

              <span className="text-[10px] text-neutral-500">everywhere</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
