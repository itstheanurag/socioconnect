"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Clock3, MessageCircle, Rocket, Send, Sparkles, Users } from "lucide-react";

type VisualType = "distribution" | "founder" | "campaign" | "communities";

interface AudienceItem {
  id: string;
  label: string;
  title: React.ReactNode;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  visual: VisualType;
}

const AUDIENCES: AudienceItem[] = [
  {
    id: "creators",
    label: "Creators",
    title: (
      <>
        Turn one idea into{" "}
        <span className="font-serif italic font-normal text-rose-300">everywhere.</span>
      </>
    ),
    description:
      "Create once. Let SocioConnect automatically tailor and distribute your content across every network your audience frequents.",
    icon: Sparkles,
    accent: "text-rose-400",
    visual: "distribution",
  },
  {
    id: "founders",
    label: "Founders",
    title: (
      <>
        Stay visible{" "}
        <span className="font-serif italic font-normal text-rose-300">while you build.</span>
      </>
    ),
    description:
      "Build authority and keep customers updated continuously without spending 2 hours a day context-switching across social feeds.",
    icon: Rocket,
    accent: "text-orange-400",
    visual: "founder",
  },
  {
    id: "marketers",
    label: "Marketers & Teams",
    title: (
      <>
        Every platform.{" "}
        <span className="font-serif italic font-normal text-rose-300">
          One synchronized workflow.
        </span>
      </>
    ),
    description:
      "Plan, adapt, and orchestrate complex multi-channel release campaigns from a single unified distribution engine.",
    icon: Send,
    accent: "text-blue-400",
    visual: "campaign",
  },
  {
    id: "communities",
    label: "Communities",
    title: (
      <>
        Show up{" "}
        <span className="font-serif italic font-normal text-rose-300">when it matters.</span>
      </>
    ),
    description:
      "Engage subreddits, discussion threads, and niche channels at peak synchronicity with zero promotion friction.",
    icon: Users,
    accent: "text-purple-400",
    visual: "communities",
  },
];

function DistributionVisual() {
  const platforms = [
    { label: "X (Twitter)", className: "-translate-x-[140px] -translate-y-[90px]" },
    {
      label: "LinkedIn",
      className: "translate-x-[120px] -translate-y-[90px]",
    },
    {
      label: "Reddit",
      className: "-translate-x-[140px] translate-y-[90px]",
    },
    {
      label: "Telegram",
      className: "translate-x-[120px] translate-y-[90px]",
    },
  ];

  return (
    <div className="relative flex min-h-[360px] h-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.12),transparent_55%)]" />

      <div className="relative flex w-full max-w-2xl items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800/80 shadow-2xl backdrop-blur-xl"
        >
          <Bot className="h-8 w-8 text-rose-400" />
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-rose-500/10 blur-2xl" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-px w-[65%] -translate-x-1/2 bg-linear-to-r from-transparent via-neutral-700 to-transparent" />

        {platforms.map((platform, index) => (
          <motion.div
            key={platform.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.4 }}
            className={`absolute ${platform.className} flex h-12 min-w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 text-xs font-medium text-neutral-300 backdrop-blur-md shadow-lg`}
          >
            {platform.label}
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-5 left-6 flex items-center gap-2 font-mono text-[11px] text-neutral-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        <span>One idea</span>
        <span className="text-neutral-600">→</span>
        <span className="text-neutral-300 font-medium">Broadcast everywhere</span>
      </div>
    </div>
  );
}

function FounderVisual() {
  return (
    <div className="relative flex min-h-[360px] h-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.11),transparent_55%)]" />

      <div className="relative w-full max-w-xl px-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-400/15 flex items-center justify-center text-orange-400">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-28 rounded-full bg-neutral-700" />
              <div className="h-1.5 w-16 rounded-full bg-neutral-800" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="h-2.5 w-[85%] rounded-full bg-neutral-800" />
            <div className="h-2.5 w-[65%] rounded-full bg-neutral-800" />
            <div className="h-2.5 w-[45%] rounded-full bg-neutral-800" />
          </div>
        </div>

        <div className="mx-auto h-8 w-px bg-linear-to-b from-neutral-700 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto flex w-fit items-center gap-2.5 rounded-xl border border-orange-400/20 bg-orange-400/[0.08] px-4 py-2.5 font-mono text-xs text-orange-200"
        >
          <Clock3 className="h-3.5 w-3.5 text-orange-400" />
          Scheduled automatically during peak founder hours
        </motion.div>
      </div>
    </div>
  );
}

function CampaignVisual() {
  const steps = [
    { num: "01", title: "Campaign Core", desc: "One unified narrative" },
    { num: "02", title: "Platform Adaptation", desc: "Native dialects & media specs" },
    { num: "03", title: "Timed Distribution", desc: "Autonomous release queue" },
  ];

  return (
    <div className="relative flex min-h-[360px] h-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_55%)]" />

      <div className="relative w-full max-w-xl space-y-3 px-6 sm:px-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 }}
            className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 font-mono text-xs font-semibold">
              {step.num}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-neutral-100 tracking-tight">
                {step.title}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{step.desc}</div>
            </div>

            {index < steps.length - 1 && (
              <div className="text-neutral-500 text-xs">
                <span>↓</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CommunityVisual() {
  return (
    <div className="relative flex min-h-[360px] h-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_55%)]" />

      <div className="relative w-full max-w-xl flex-col items-center gap-4 px-8">
        <div className="flex -space-x-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: item * 0.08 }}
              className="h-10 w-10 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-purple-300"
            >
              r/
              {item === 0
                ? "dev"
                : item === 1
                  ? "saas"
                  : item === 2
                    ? "build"
                    : item === 3
                      ? "ai"
                      : "tech"}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 backdrop-blur-xl">
          <MessageCircle className="h-4 w-4 text-purple-400 shrink-0" />
          <div className="text-xs text-neutral-200">
            Targeted community precision without spam flags
          </div>
        </div>

        <div className="flex gap-2 pt-1 font-mono text-[11px]">
          {["Optimal Peak", "Live AMA", "Scheduled"].map((item, index) => (
            <div
              key={item}
              className={`rounded-lg border px-3 py-1.5 ${
                index === 0
                  ? "border-purple-400/30 bg-purple-400/15 text-purple-300"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-400"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudienceVisual({ visual }: { visual: VisualType }) {
  switch (visual) {
    case "distribution":
      return <DistributionVisual />;
    case "founder":
      return <FounderVisual />;
    case "campaign":
      return <CampaignVisual />;
    case "communities":
      return <CommunityVisual />;
  }
}

export default function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % AUDIENCES.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  const activeAudience = AUDIENCES[activeIndex];

  return (
    <section
      id="use-cases"
      className="relative w-full overflow-hidden bg-neutral-950 px-4 py-24 text-neutral-100 sm:px-6 sm:py-32 lg:px-8 border-t border-neutral-800/80"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/[0.03] blur-[160px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          {/* Section Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-300">
              Built for Leverage
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.15]">
            Built for{" "}
            <span className="font-serif italic font-normal text-rose-300">
              Someone just like you.
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
            Create once. Let SocioConnect handle the dialect, timing, and cross-platform reach for
            every stage of growth.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-[280px_1px_minmax(0,1fr)] gap-8 lg:gap-0 items-center">
          {/* Left Navigation Column */}
          <div className="flex flex-col justify-center lg:pr-12">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Select Audience
            </div>

            <div className="space-y-2">
              {AUDIENCES.map((audience, index) => {
                const Icon = audience.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={audience.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-neutral-900 border border-neutral-700 text-neutral-100 shadow-lg"
                        : "bg-transparent border border-transparent hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isActive ? "bg-neutral-800" : "bg-transparent group-hover:bg-neutral-800/60"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? audience.accent
                            : "text-neutral-500 group-hover:text-neutral-300"
                        }`}
                      />
                    </span>

                    <span className="text-sm font-medium tracking-tight flex-1 truncate">
                      {audience.label}
                    </span>

                    <span className="font-mono text-[10px] text-neutral-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden bg-neutral-800 lg:block h-full min-h-[400px]" />

          {/* Right Showcase Stage */}
          <div className="relative lg:pl-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAudience.id}
                initial={{ opacity: 0, x: 16, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -16, scale: 0.99 }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full flex flex-col justify-between"
              >
                <AudienceVisual visual={activeAudience.visual} />

                <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-neutral-800/80 pt-5">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 leading-tight">
                      {activeAudience.title}
                    </h3>

                    <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400 font-light">
                      {activeAudience.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 self-start sm:self-auto">
                    {AUDIENCES.map((audience, index) => (
                      <button
                        key={audience.id}
                        type="button"
                        aria-label={`Show ${audience.label}`}
                        onClick={() => setActiveIndex(index)}
                        className="h-2 py-0.5 cursor-pointer"
                      >
                        <span
                          className={`block h-1 rounded-full transition-all duration-300 ${
                            index === activeIndex
                              ? "w-6 bg-rose-400"
                              : "w-2 bg-neutral-700 hover:bg-neutral-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
