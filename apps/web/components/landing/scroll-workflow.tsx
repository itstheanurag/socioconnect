"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, KeyRound, Calendar, Send, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PlatformIcon } from "./platform-icons";

interface WorkflowStep {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  metricLabel: string;
  metricValue: string;
  icon: React.ReactNode;
  visualSnippet: React.ReactNode;
}

export function ScrollWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  const STEPS: WorkflowStep[] = [
    {
      number: "01",
      badge: "DRAFT",
      title: "Write in One Calm Editor",
      subtitle: "Zero tab-switching, zero distraction.",
      description:
        "Draft your video launch story, stream alert, or thread in a clean composer. Real-time character meters track platform limits for YouTube, Instagram, LinkedIn, and X.",
      points: [
        "Live character meters for YouTube (5000c), Instagram (2200c), and X (280c)",
        "Automatic thread breaks and splitters for long-form thoughts",
        "Unified media attachments for video thumbnails, reels & images",
      ],
      metricLabel: "Time Saved",
      metricValue: "45 min / day",
      icon: <PenTool className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-[#ede8df] bg-[#faf8f5] p-5 rounded-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-stone-500">
            <span className="font-bold text-stone-800">UNIFIED COMPOSER BUFFER</span>
            <span className="text-emerald-700 font-semibold">● AUTO-SAVED</span>
          </div>
          <div className="bg-white p-3 border border-[#ede8df] rounded-xs font-sans text-stone-800 text-xs leading-relaxed">
            &ldquo;Building in public is much easier when you don&apos;t have to copy-paste across 8
            tabs every morning. Write once, verify budgets, dispatch everywhere.&rdquo;
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="bg-white px-2.5 py-1 border border-[#ede8df] text-stone-700 flex items-center gap-1.5 rounded-xs">
              <PlatformIcon platform="youtube" size={13} />
              <span>YouTube: Ready</span>
            </span>
            <span className="bg-white px-2.5 py-1 border border-[#ede8df] text-stone-700 flex items-center gap-1.5 rounded-xs">
              <PlatformIcon platform="twitch" size={13} />
              <span>Twitch: Alert Set</span>
            </span>
            <span className="bg-white px-2.5 py-1 border border-[#ede8df] text-stone-700 flex items-center gap-1.5 rounded-xs">
              <PlatformIcon platform="instagram" size={13} />
              <span>Instagram: Ready</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      badge: "SECURITY",
      title: "Zero-Knowledge Connectors",
      subtitle: "We never take or store your passwords.",
      description:
        "Connect YouTube, Twitch, Instagram, X, LinkedIn, Reddit, and Peerlist directly through official OAuth 2.0 PKCE. SocioConnect only requests write permissions and stores tokens in hardware-grade AES-256-GCM encrypted vaults.",
      points: [
        "100% official Google, Twitch, Meta & X OAuth 2.0 PKCE authorization",
        "AES-256-GCM encrypted token vaults with secret rotation",
        "Strict outbound write-only scopes — zero feed reading or scraping",
      ],
      metricLabel: "Passwords Stored",
      metricValue: "0 (Zero)",
      icon: <KeyRound className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-[#ede8df] bg-[#faf8f5] p-5 rounded-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-stone-500">
            <span className="font-bold text-stone-800">VAULT KEY ENCRYPTION</span>
            <span className="text-emerald-700 font-semibold">AES-256-GCM</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white p-2.5 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="youtube" size={14} />
                <span>YouTube Google OAuth 2.0</span>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">✓ Verified</span>
            </div>
            <div className="bg-white p-2.5 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="twitch" size={14} />
                <span>Twitch Stream Token</span>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">✓ Verified</span>
            </div>
            <div className="bg-white p-2.5 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="instagram" size={14} />
                <span>Instagram Creator Graph</span>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">✓ Verified</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      badge: "STAGGER",
      title: "Same Post, Staggered Peak Times",
      subtitle: "Hit your audience when they are actually online.",
      description:
        "Your LinkedIn audience checks posts at 9 AM, but your Twitch stream or YouTube video performs best in the afternoon or evening. SocioConnect lets you schedule a single post to go out simultaneously or staggered at custom peak hours.",
      points: [
        "Choose between instant simultaneous blast or staggered per-platform peak hours",
        "Multi-timezone scheduling engine (UTC, PST, EST, IST, GMT)",
        "Automated queue cadence that spaces out announcements naturally",
      ],
      metricLabel: "Engagement Lift",
      metricValue: "3.4x Peak",
      icon: <Calendar className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-[#ede8df] bg-[#faf8f5] p-5 rounded-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-stone-500">
            <span className="font-bold text-stone-800">STAGGERED CADENCE MAP</span>
            <span className="text-blue-700 font-semibold">PEAK WINDOWS</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="linkedin" size={13} />
                <span>LinkedIn</span>
              </span>
              <span className="text-stone-500">08:30 AM (Morning Coffee)</span>
            </div>
            <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="youtube" size={13} />
                <span>YouTube</span>
              </span>
              <span className="text-stone-500">03:00 PM (Afternoon Surge)</span>
            </div>
            <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="twitch" size={13} />
                <span>Twitch</span>
              </span>
              <span className="text-stone-500">06:30 PM (Evening Live)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "04",
      badge: "DISPATCH",
      title: "Fault-Isolated Multi-Network Drops",
      subtitle: "One platform outage never ruins your launch.",
      description:
        "Every video and post channel publishes via independent worker tasks. If X or Reddit suffers a temporary rate limit, your YouTube, Twitch, and Instagram announcements go live on time with automatic retry backoff.",
      points: [
        "Decoupled atomic worker architecture for every connected creator network",
        "Automatic retry with exponential backoff on 429 and 503 errors",
        "Instant delivery telemetry and direct post URLs",
      ],
      metricLabel: "Failure Blast Radius",
      metricValue: "0% Spillover",
      icon: <Send className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-[#ede8df] bg-[#faf8f5] p-5 rounded-xs space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[#ede8df] pb-2 text-stone-500">
            <span className="font-bold text-stone-800">PARALLEL WORKER STATUS</span>
            <span className="text-emerald-700 font-semibold">● 100% OK</span>
          </div>
          <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800">
              <PlatformIcon platform="youtube" size={13} />
              <span>YouTube Premiere</span>
            </span>
            <span className="text-emerald-700 font-semibold">200 OK (94ms)</span>
          </div>
          <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800">
              <PlatformIcon platform="twitch" size={13} />
              <span>Twitch Stream Alert</span>
            </span>
            <span className="text-emerald-700 font-semibold">200 OK (82ms)</span>
          </div>
          <div className="bg-white p-2 border border-[#ede8df] rounded-xs flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800">
              <PlatformIcon platform="instagram" size={13} />
              <span>Instagram Carousel</span>
            </span>
            <span className="text-emerald-700 font-semibold">200 OK (115ms)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="workflow" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            THE 4-STEP DISTRIBUTION ENGINE
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            From draft to staggered peak delivery in four seamless steps.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            Eliminate copy-paste fatigue. Manage your video &amp; post schedule, hit each platform
            during its specific audience peak hour, and broadcast to every community with peace of
            mind.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-4 border transition-all rounded-xs flex flex-col justify-between ${
                  isActive
                    ? "border-stone-900 bg-[#faf8f5] shadow-xs"
                    : "border-[#ede8df] bg-white hover:border-[#dfc39a]"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-3">
                  <span className={`font-bold ${isActive ? "text-stone-900" : "text-stone-400"}`}>
                    STEP / {step.number}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                      isActive ? "bg-[#F4DCB4] text-stone-900" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <div className="font-bold text-sm text-stone-900 font-sans">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Presentation Box */}
        <div className="border border-[#ede8df] bg-[#faf8f5] p-6 sm:p-10 rounded-xs shadow-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Details & Key Points */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-stone-500 mb-2">
                    <span className="font-bold text-stone-900">
                      STEP {STEPS[activeStep].number}
                    </span>
                    <span>/</span>
                    <span className="uppercase text-stone-600 font-semibold">
                      {STEPS[activeStep].badge}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-stone-900">
                    {STEPS[activeStep].title}
                  </h3>
                  <p className="text-sm font-serif italic text-stone-600 mt-1">
                    {STEPS[activeStep].subtitle}
                  </p>
                  <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    {STEPS[activeStep].description}
                  </p>
                </div>

                {/* Key Bullet Highlights */}
                <div className="space-y-2.5 pt-2">
                  {STEPS[activeStep].points.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-white p-3 border border-[#ede8df] rounded-xs font-sans text-xs text-stone-800"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Metric & Action */}
                <div className="pt-4 border-t border-dashed border-[#ede8df] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                      {STEPS[activeStep].metricLabel}
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      {STEPS[activeStep].metricValue}
                    </span>
                  </div>

                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 font-bold text-stone-900 hover:text-stone-700 underline decoration-[#dfc39a] decoration-2 underline-offset-4"
                  >
                    <span>TEST IN CREATOR STUDIO</span>
                    <ArrowRight className="h-4 w-4 text-stone-800" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Interactive Snippet */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-dashed border-[#dfc39a] bg-white p-2 rounded-xs shadow-xs">
                  {STEPS[activeStep].visualSnippet}
                </div>
                <div className="text-center font-mono text-[11px] text-stone-400">
                  Step {activeStep + 1} of {STEPS.length} · Click any step tab to explore workflow
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
