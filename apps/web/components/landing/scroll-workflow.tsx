"use client";

import { useState } from "react";
import { PenTool, ShieldCheck, Clock, Send, CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "./platform-icons";

export function ScrollWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      badge: "compose",
      title: "one clean creator studio",
      subtitle: "never rewrite the same post in 8 different tabs.",
      description:
        "draft your video launch, community drop, reel caption, or thread in one quiet, focused workspace. smart character limits for youtube, instagram, and x ensure your text always fits perfectly.",
      points: [
        "live character meters for youtube (5000c), instagram (2200c), and x (280c)",
        "automatic thread breaks and splitters for long-form thoughts",
        "unified media attachments for video thumbnails, reels & images",
      ],
      metricLabel: "time saved",
      metricValue: "85% less friction",
      icon: <PenTool className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-line bg-[#faf8f5] p-5 rounded-md space-y-3 font-mono text-xs lowercase">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-2 text-stone-500">
            <span>unified post composer</span>
            <span className="text-emerald-700 font-semibold">● 8 channels ready</span>
          </div>
          <div className="bg-white p-3 border border-line rounded-sm font-sans text-xs text-stone-800 leading-relaxed">
            &ldquo;excited to share our newest video! behind the scenes breakdown of creative
            workflows and channel scheduling.&rdquo;
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="bg-white px-2 py-0.5 border border-line rounded-xs text-stone-600 flex items-center gap-1">
              <PlatformIcon platform="youtube" size={13} />
              <span>youtube: 4,874 left</span>
            </span>
            <span className="bg-white px-2 py-0.5 border border-line rounded-xs text-stone-600 flex items-center gap-1">
              <PlatformIcon platform="twitch" size={13} />
              <span>twitch: 374 left</span>
            </span>
            <span className="bg-white px-2 py-0.5 border border-line rounded-xs text-stone-600 flex items-center gap-1">
              <PlatformIcon platform="instagram" size={13} />
              <span>instagram: 2,074 left</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      badge: "connect",
      title: "100% private account logins",
      subtitle: "we never ask for or store your passwords.",
      description:
        "connect directly through official google, twitch, meta, linkedin, and x login dialogs. we only ask for permission to publish your posts — never to read your private dms, scrape your feeds, or browse your followers.",
      points: [
        "connect securely through official google, twitch, meta & x login dialogs",
        "encrypted connections that you can revoke at any time with one click",
        "strict posting permissions — zero reading of private dms or personal feeds",
      ],
      metricLabel: "stored passwords",
      metricValue: "zero passwords",
      icon: <ShieldCheck className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-line bg-[#faf8f5] p-5 rounded-md space-y-2 font-mono text-xs lowercase">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-2 text-stone-500">
            <span>official creator connections</span>
            <span className="text-emerald-700 font-semibold">● 100% private</span>
          </div>
          <div className="space-y-1.5">
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-sans font-semibold text-stone-800">
                <PlatformIcon platform="youtube" size={14} />
                <span>youtube creator channel</span>
              </span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">● connected</span>
            </div>
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-sans font-semibold text-stone-800">
                <PlatformIcon platform="twitch" size={14} />
                <span>twitch stream alerts</span>
              </span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">● connected</span>
            </div>
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-sans font-semibold text-stone-800">
                <PlatformIcon platform="instagram" size={14} />
                <span>instagram profile</span>
              </span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">● connected</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      badge: "schedule",
      title: "same post, staggered peak times",
      subtitle: "hit your viewers when they are actually online.",
      description:
        "your linkedin audience scrolls during morning coffee, while your youtube subscribers and twitch viewers peak in the afternoon and evening. choose between instant posting or staggered peak hours.",
      points: [
        "choose between instant posting or timed drops for peak engagement",
        "automatic timezone scheduling so you never have to do mental math",
        "spread out announcements naturally so your fans never feel spammed",
      ],
      metricLabel: "audience timing",
      metricValue: "peak attention",
      icon: <Clock className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-line bg-[#faf8f5] p-5 rounded-md space-y-2 font-mono text-xs lowercase">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-2 text-stone-500">
            <span>staggered timing queue</span>
            <span className="text-stone-700 font-semibold">today&apos;s drops</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="linkedin" size={13} />
                <span>linkedin</span>
              </span>
              <span className="text-stone-500">08:30 am (morning read)</span>
            </div>
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="youtube" size={13} />
                <span>youtube</span>
              </span>
              <span className="text-stone-500">04:00 pm (premiere drop)</span>
            </div>
            <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-stone-800">
                <PlatformIcon platform="twitch" size={13} />
                <span>twitch</span>
              </span>
              <span className="text-stone-500">06:30 pm (evening live)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "04",
      badge: "publish",
      title: "worry-free automated publishing",
      subtitle: "one slow network never ruins your release.",
      description:
        "each channel posts independently. if one platform has temporary downtime or a slow server, your other announcements go live smoothly on time with automatic background retries.",
      points: [
        "independent delivery across all your connected social accounts",
        "automatic background retry if any platform is temporarily busy",
        "direct links to view your live posts immediately after publishing",
      ],
      metricLabel: "publishing reliability",
      metricValue: "100% peace of mind",
      icon: <Send className="h-5 w-5 text-stone-800" />,
      visualSnippet: (
        <div className="border border-line bg-[#faf8f5] p-5 rounded-md space-y-2 font-mono text-xs lowercase">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-2 text-stone-500">
            <span className="font-bold text-stone-800">post delivery status</span>
            <span className="text-emerald-700 font-semibold">● live everywhere</span>
          </div>
          <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800 font-sans font-semibold">
              <PlatformIcon platform="youtube" size={13} />
              <span>youtube premiere</span>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> published
            </span>
          </div>
          <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800 font-sans font-semibold">
              <PlatformIcon platform="twitch" size={13} />
              <span>twitch stream alert</span>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> live alert sent
            </span>
          </div>
          <div className="bg-white p-2 border border-line rounded-sm flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-800 font-sans font-semibold">
              <PlatformIcon platform="instagram" size={13} />
              <span>instagram carousel</span>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> published
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="workflow" className="relative py-16 lg:py-24 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lowercase">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            <span>the creator workflow</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            from single draft to everywhere in seconds.
          </h2>
          <p className="mt-3 text-base text-stone-600">
            a calm, dependable publishing studio designed to save your creative energy for making
            content.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 lowercase">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`text-left p-4 border transition-all rounded-md cursor-pointer ${
                  isActive
                    ? "border-stone-900 bg-[#faf8f5] shadow-xs"
                    : "border-line bg-white hover:border-secondary-border"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-2">
                  <span className={`font-bold ${isActive ? "text-stone-900" : "text-stone-400"}`}>
                    step {step.number}
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold">{step.badge}</span>
                </div>
                <div className="font-sans font-bold text-sm text-stone-900">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Content Card */}
        <div className="border border-line bg-[#faf8f5] p-6 sm:p-8 rounded-md shadow-xs lowercase">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Text & Points */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-500 mb-2">
                  {steps[activeStep].icon}
                  <span>
                    step {steps[activeStep].number} · {steps[activeStep].badge}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 font-sans">
                  {steps[activeStep].title}
                </h3>
                <p className="text-base text-stone-600 font-serif italic mt-1">
                  {steps[activeStep].subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                {steps[activeStep].description}
              </p>

              <div className="space-y-2.5 pt-2">
                {steps[activeStep].points.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-sans"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-dashed border-line flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">
                    {steps[activeStep].metricLabel}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {steps[activeStep].metricValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Visual Interactive Snippet */}
            <div className="lg:col-span-6">{steps[activeStep].visualSnippet}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
