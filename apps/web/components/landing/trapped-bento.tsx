"use client";

import { useState } from "react";
import {
  Eye,
  Calendar,
  Sparkles,
  ShieldCheck,
  SplitSquareVertical,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

interface FeatureCardProps {
  code: string;
  title: string;
  description: string;
  highlightLabel: string;
  highlightValue: string;
  tag: string;
  icon: React.ReactNode;
  dashed?: boolean;
}

function FeatureCard({
  code,
  title,
  description,
  highlightLabel,
  highlightValue,
  tag,
  icon,
  dashed = false,
}: FeatureCardProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative ${
        dashed
          ? "border border-dashed border-[#dfc39a] bg-[#faf8f5]"
          : "border border-[#ede8df] bg-white"
      } p-6 sm:p-8 transition-all hover:border-[#dfc39a] hover:shadow-md`}
      style={
        {
          backgroundImage: `radial-gradient(350px circle at ${mousePos.x}% ${mousePos.y}%, rgba(244, 220, 180, 0.22), transparent 70%)`,
        } as React.CSSProperties
      }
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#f0ede6] pb-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-stone-500">
          <span className="text-stone-400">{code}</span>
          <span className="text-stone-300">/</span>
          <span className="font-bold text-stone-700 uppercase">{tag}</span>
        </div>
        <span className="text-stone-700 transition-transform group-hover:scale-110">{icon}</span>
      </div>

      {/* Body */}
      <div className="mt-5">
        <h3 className="text-lg font-bold text-stone-900 transition-colors">{title}</h3>
        <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-end justify-between border-t border-dashed border-[#f0ede6] pt-4 font-mono text-xs">
        <div>
          <span className="text-[10px] uppercase text-stone-400 block tracking-wider">
            {highlightLabel}
          </span>
          <span className="font-bold text-stone-900 text-sm">{highlightValue}</span>
        </div>
        <span className="text-[11px] text-stone-400 group-hover:text-stone-900 transition-colors flex items-center gap-1 font-mono">
          LEARN MORE
          <ArrowUpRight className="h-3.5 w-3.5 text-stone-500" />
        </span>
      </div>
    </div>
  );
}

export function TrappedBento() {
  return (
    <section
      id="workflow"
      className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-[#faf8f5]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            BUILT FOR CREATIVE FLOW
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Everything you need to distribute great content.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            Writing good content is hard enough. Managing 5 different post formats shouldn’t drain
            your creativity. SocioConnect automates the tedious distribution work so you can stay in
            creative flow.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            code="FEATURE / 01"
            tag="Visual Previews"
            title="Live Feed Simulation"
            description="See exactly how your hook, line breaks, emojis, and hashtags render in each social feed before you schedule, avoiding embarrassing post-edit mistakes."
            highlightLabel="Supported Feeds"
            highlightValue="5 Social Networks"
            icon={<Eye className="h-4 w-4" />}
          />

          <FeatureCard
            code="FEATURE / 02"
            tag="Smart Guardrails"
            title="Platform Character Budgets"
            description="Automatic character meters warn you before you exceed X's 280-char or Threads' 500-char limits. Auto-split long thoughts into numbered threads."
            highlightLabel="Truncation risk"
            highlightValue="0% Cut-offs"
            icon={<SplitSquareVertical className="h-4 w-4" />}
          />

          <FeatureCard
            code="FEATURE / 03"
            tag="Resilience"
            title="Panic-Free Publishing"
            description="If X is suffering a server hiccup or Threads experiences rate limits, your LinkedIn, Bluesky, and Mastodon posts go live without waiting."
            highlightLabel="Failure propagation"
            highlightValue="Zero Interruption"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />

          <FeatureCard
            code="FEATURE / 04"
            tag="Calendar"
            title="Visual Creator Schedule"
            description="Map out your weekly content themes, newsletter promos, and product launches on a clean, visual drag-and-drop calendar."
            highlightLabel="Timezone support"
            highlightValue="Universal Local Time"
            dashed={true}
            icon={<Calendar className="h-4 w-4" />}
          />

          <FeatureCard
            code="FEATURE / 05"
            tag="Voice & Presets"
            title="Brand Voice Presets"
            description="Save templates for your weekly newsletter drops, milestone celebrations, and discussion starters. Load your signature hashtags in one click."
            highlightLabel="Time saved"
            highlightValue="5+ hrs / week"
            dashed={true}
            icon={<Sparkles className="h-4 w-4" />}
          />

          <FeatureCard
            code="FEATURE / 06"
            tag="Security"
            title="Official OAuth Connections"
            description="Your accounts connect via official, verified developer APIs. We never ask for your passwords, and all session keys remain strictly encrypted."
            highlightLabel="Account safety"
            highlightValue="100% Official APIs"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </div>
    </section>
  );
}
