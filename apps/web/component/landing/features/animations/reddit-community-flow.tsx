"use client";

import { motion } from "motion/react";
import { Check, Search, Target } from "lucide-react";
import { RedditIcon } from "@/component/icons/social-icons";

const communities = [
  {
    name: "r/startups",
    description: "Founders & builders",
    score: "98%",
    selected: true,
  },
  {
    name: "r/entrepreneur",
    description: "Business & growth",
    score: "94%",
    selected: true,
  },
  {
    name: "r/contentmarketing",
    description: "Marketing strategy",
    score: "91%",
    selected: true,
  },
  {
    name: "r/technology",
    description: "Tech discussion",
    score: "62%",
    selected: false,
  },
];

type CommunityItemProps = {
  name: string;
  description: string;
  score: string;
  selected: boolean;
  delay: number;
};

function CommunityItem({ name, description, score, selected, delay }: CommunityItemProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -12,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={[
        "group relative flex items-center gap-2.5 overflow-hidden rounded-lg border px-2.5 py-2",
        selected ? "border-[#FF4500]/20 bg-[#FF4500]/5.5" : "border-white/5 bg-white/1.5",
      ].join(" ")}
    >
      {/* Evaluation sweep */}
      <motion.div
        initial={{
          x: "-120%",
          opacity: 0,
        }}
        animate={{
          x: ["-120%", "120%"],
          opacity: [0, 0.35, 0],
        }}
        transition={{
          delay: delay + 0.05,
          duration: 0.55,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-orange-400/8 to-transparent"
      />

      {/* Selection indicator */}
      <motion.div
        initial={{
          scale: 0.7,
          opacity: 0,
        }}
        animate={{
          scale: selected ? 1 : 0.85,
          opacity: selected ? 1 : 0.45,
        }}
        transition={{
          delay: delay + 0.28,
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={[
          "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          selected ? "bg-[#FF4500]/10 text-[#FF4500]" : "bg-white/3 text-neutral-600",
        ].join(" ")}
      >
        {selected ? (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: delay + 0.34,
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Check className="h-3 w-3" />
          </motion.div>
        ) : (
          <RedditIcon className="h-3 w-3" />
        )}
      </motion.div>

      {/* Community information */}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium text-neutral-200">{name}</div>
        <div className="truncate text-[9px] text-neutral-500">{description}</div>
      </div>

      {/* Relevance */}
      <div className="text-right">
        <motion.div
          initial={{
            opacity: 0,
            y: 3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: delay + 0.2,
            duration: 0.3,
          }}
          className={
            selected ? "text-[10px] font-medium text-orange-300" : "text-[10px] text-neutral-600"
          }
        >
          {score}
        </motion.div>
        <div className="text-[8px] uppercase tracking-wider text-neutral-600">match</div>
      </div>

      {/* Selected idle glow */}
      {selected && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.35, 0],
          }}
          transition={{
            delay: delay + 0.7,
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0 rounded-lg bg-orange-400/[0.035]"
        />
      )}

      {/* Selection edge */}
      {selected && (
        <motion.div
          initial={{
            scaleY: 0,
            opacity: 0,
          }}
          animate={{
            scaleY: 1,
            opacity: 1,
          }}
          transition={{
            delay: delay + 0.3,
            duration: 0.3,
          }}
          className="absolute bottom-1.5 left-0 top-1.5 w-px origin-center bg-orange-400/60"
        />
      )}

      {/* Candidate evaluation dot */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
        }}
        transition={{
          delay: delay + 0.05,
          duration: 0.5,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute right-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_6px_rgba(251,146,60,0.8)]"
      />
    </motion.div>
  );
}

export default function RedditCommunityFlow() {
  return (
    <div className="relative mt-7 h-[250px] w-full overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7] }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
          repeat: Infinity,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5.5 blur-3xl"
      />

      {/* Search / source */}
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 mx-auto flex max-w-[230px] items-center gap-2 rounded-xl border border-white/9 bg-[#101018]/90 px-3 py-2.5 backdrop-blur-xl"
      >
        {/* Target icon */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 rgba(255,69,0,0)",
              "0 0 14px rgba(255,69,0,0.18)",
              "0 0 0 rgba(255,69,0,0)",
            ],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]"
        >
          <Target className="h-3.5 w-3.5" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500">
            Matching content
          </div>
          <div className="truncate text-[11px] font-medium text-neutral-200">
            Startup growth strategy
          </div>
        </div>

        {/* Search animation */}
        <motion.div
          animate={{
            rotate: [0, 0, 15, 0],
            scale: [1, 1, 1.08, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeInOut",
          }}
        >
          <Search className="h-3.5 w-3.5 text-neutral-600" />
        </motion.div>
      </motion.div>

      {/* Search connector */}
      <div className="relative mx-auto h-7 w-px overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-orange-400/20" />

        {/* Search packet travelling down */}
        <motion.div
          initial={{
            top: "-8px",
            opacity: 0,
          }}
          animate={{
            top: "100%",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            delay: 0.45,
            duration: 0.65,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 4,
          }}
          className="absolute left-1/2 h-2 w-1 -translate-x-1/2 rounded-full bg-orange-300 shadow-[0_0_8px_rgba(251,146,60,0.9)]"
        />
      </div>

      {/* Community results */}
      <div className="relative mx-auto flex max-w-[280px] flex-col gap-1.5">
        {communities.map((community, index) => (
          <CommunityItem
            key={community.name}
            name={community.name}
            description={community.description}
            score={community.score}
            selected={community.selected}
            delay={0.7 + index * 0.16}
          />
        ))}
      </div>
    </div>
  );
}
