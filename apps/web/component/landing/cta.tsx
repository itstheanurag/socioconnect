"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight, LockKeyhole, Radio } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { LinkedInIcon, RedditIcon, SubstackIcon, XIcon } from "@/component/icons/social-icons";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const channels = [
  {
    name: "X",
    handle: "@socioconnect",
    note: "Thread, 6 posts",
    status: "Ready",
    icon: XIcon,
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },
  {
    name: "LinkedIn",
    handle: "/company/socioconnect",
    note: "Long-form",
    status: "Ready",
    icon: LinkedInIcon,
    tone: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  },
  {
    name: "Reddit",
    handle: "r/SideProject",
    note: "Community post",
    status: "Queued",
    icon: RedditIcon,
    tone: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
  {
    name: "Substack",
    handle: "The Launch Letter",
    note: "Newsletter",
    status: "Scheduled",
    icon: SubstackIcon,
    tone: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  },
];

export default function Cta() {
  const { openAuthModal } = useAuth();

  return (
    <section className="relative w-full bg-neutral-950 px-4 pt-16 pb-12 text-neutral-200 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#12110f]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(246,241,231,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(246,241,231,0.025)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_70%_0%,#000_40%,transparent_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-rose-500/10 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-rose-500/70 via-rose-500/15 to-transparent"
            aria-hidden="true"
          />

          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
                  <span className="relative flex h-2 w-2">
                    <span className="signal-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Transmission desk
                </div>

                <h2 className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.03] tracking-[-0.03em] text-neutral-100 sm:text-5xl lg:text-[3.4rem]">
                  You already have something to say.{" "}
                  <span className="font-serif font-normal italic text-rose-300">
                    Make sure it gets heard.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-neutral-400 sm:text-base">
                  One draft becomes every channel, in its own voice. You choose the moment it goes
                  live.
                </p>
              </div>

              <div className="mt-8">
                <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <motion.button
                    type="button"
                    onClick={openAuthModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-neutral-100 shadow-[0_0_25px_rgba(220,38,38,0.35)] transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                  >
                    Start publishing
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  <motion.a
                    href="#demo"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/60 px-6 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                  >
                    See how it works
                  </motion.a>
                </div>

                <p className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                  <LockKeyhole className="h-3 w-3" />
                  Human approval required before anything publishes
                </p>
              </div>
            </div>

            <div className="relative border-t border-neutral-800 p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  <Radio className="h-3.5 w-3.5 text-rose-300" />
                  Routing preview
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-600">
                  Run 0042
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                      Master draft
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium text-neutral-100">
                      Launch day is here.
                    </p>
                    <p className="mt-1 truncate text-[11px] text-neutral-500">
                      One idea. Four different rooms.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-300">
                    Armed
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {channels.map((channel, index) => {
                    const Icon = channel.icon;
                    return (
                      <motion.div
                        key={channel.name}
                        initial={{ opacity: 0, x: 8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.15 + index * 0.07 }}
                        className="flex items-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 px-3 py-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-300">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-medium text-neutral-200">
                              {channel.name}
                            </span>
                            <span
                              className={`shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] ${channel.tone}`}
                            >
                              {channel.status}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-[10px] text-neutral-500">
                              {channel.handle}
                            </span>
                            <span className="shrink-0 font-mono text-[9px] text-neutral-600">
                              {channel.note}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span className="text-neutral-500">4 channels armed</span>
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Approval gate on
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
