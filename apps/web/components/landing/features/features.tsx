"use client";

import { useState } from "react";
import {
  Sparkles,
  Layers,
  Calendar,
  Users,
  BarChart3,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Send,
  RefreshCw,
  Eye,
  Hash,
  MessageSquare,
  Bot,
  Flame,
} from "lucide-react";
import { PlatformIcon } from "../platform-icons";

interface FeatureCategory {
  id: string;
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  features: FeatureItem[];
}

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  mockup: React.ReactNode;
}

export function Features() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

  const categories: FeatureCategory[] = [
    {
      id: "studio",
      name: "creative studio & ai",
      tagline: "one prompt &rarr; tailored native formats for every platform",
      icon: Sparkles,
      features: [
        {
          id: "ai-harmonizer",
          badge: "ai format adaptor",
          title: "write your core message once, tailor the tone everywhere",
          subtitle: "never manually reformat hashtags or cut sentences for character limits.",
          description:
            "our ai studio automatically shapes your single idea into punchy x threads, engaging instagram reels captions with spaced hashtags, storytelling linkedin posts, and youtube community questions.",
          bullets: [
            "smart character gauges for x (280c), instagram (2,200c), and youtube (5,000c)",
            "one-click tone adaptors: casual, storytelling, punchy, or educational",
            "automatic thread-splitting with numbered multi-post draft builder",
          ],
          mockup: (
            <div className="border border-line bg-[#faf8f5] p-5 rounded-lg font-mono text-xs space-y-3 lowercase">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-2.5 text-stone-500">
                <span className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Bot className="h-3.5 w-3.5 text-amber-600" />
                  <span>multi-channel format engine</span>
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  4 channels synchronized
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white border border-line rounded-md">
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1 font-sans text-xs">
                    <span className="flex items-center gap-1.5">
                      <PlatformIcon platform="instagram" size={13} />
                      <span>instagram reel caption</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">spacing + 5 tags</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                    ✨ 3 ways we streamlined our daily content workflow &amp; got our weekends back!
                    swipe for the full breakdown 👇 #creatoreconomy #socialgrowth #solopreneur
                  </p>
                </div>

                <div className="p-3 bg-white border border-line rounded-md">
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1 font-sans text-xs">
                    <span className="flex items-center gap-1.5">
                      <PlatformIcon platform="x" size={13} />
                      <span>x (twitter) punchy hook</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">214 / 280 chars</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                    we spent 6 months testing 10+ social schedulers. most burn creator hours with
                    endless tab switching. here are 3 things we built differently 🧵👇
                  </p>
                </div>

                <div className="p-3 bg-white border border-line rounded-md">
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1 font-sans text-xs">
                    <span className="flex items-center gap-1.5">
                      <PlatformIcon platform="linkedin" size={13} />
                      <span>linkedin thought leadership</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      storytelling format
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                    why creator burnout happens when you cross-post manually, and how treating
                    distribution as a calm automated pipeline changes everything.
                  </p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "calendar",
      name: "smart calendar & queues",
      tagline: "schedule once, hit global audience peak hours automatically",
      icon: Calendar,
      features: [
        {
          id: "peak-queue",
          badge: "audience timing autopilot",
          title: "visual drag-and-drop planning mapped to your viewers' peak hours",
          subtitle: "morning readers, lunch scrollers, and evening stream viewers all covered.",
          description:
            "your linkedin audience checks in during their morning commute, while your youtube and tiktok viewers peak in the evening. socioconnect spaces out your drops so your fans get continuous value without feeling spammed.",
          bullets: [
            "color-coded weekly schedule with instant drag-and-drop reordering",
            "intelligent timezone conversion: schedule in your time, drops in their peak time",
            "visual gap detection alerts you when your queue has quiet days",
          ],
          mockup: (
            <div className="border border-line bg-[#faf8f5] p-5 rounded-lg font-mono text-xs space-y-3 lowercase">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-2.5 text-stone-500">
                <span className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>peak audience distribution pipeline</span>
                </span>
                <span className="text-stone-700 font-bold">thursday schedule</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-white border border-line rounded-md">
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform="linkedin" size={15} />
                    <div>
                      <div className="font-bold text-stone-900 font-sans text-xs">
                        creator case study post
                      </div>
                      <div className="text-[10px] text-stone-400">morning commute feed</div>
                    </div>
                  </div>
                  <span className="text-stone-800 font-bold bg-[#F4DCB4] px-2 py-0.5 rounded-xs text-[10px]">
                    08:30 am
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-line rounded-md">
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform="instagram" size={15} />
                    <div>
                      <div className="font-bold text-stone-900 font-sans text-xs">
                        behind-the-scenes reel
                      </div>
                      <div className="text-[10px] text-stone-400">lunch break scrolling window</div>
                    </div>
                  </div>
                  <span className="text-stone-800 font-bold bg-[#F4DCB4] px-2 py-0.5 rounded-xs text-[10px]">
                    12:30 pm
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-line rounded-md">
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform="youtube" size={15} />
                    <div>
                      <div className="font-bold text-stone-900 font-sans text-xs">
                        video premiere &amp; community poll
                      </div>
                      <div className="text-[10px] text-stone-400">
                        evening desktop &amp; tv watch
                      </div>
                    </div>
                  </div>
                  <span className="text-stone-800 font-bold bg-[#F4DCB4] px-2 py-0.5 rounded-xs text-[10px]">
                    04:00 pm
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-line rounded-md">
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform="tiktok" size={15} />
                    <div>
                      <div className="font-bold text-stone-900 font-sans text-xs">
                        short-form takeaway clip
                      </div>
                      <div className="text-[10px] text-stone-400">prime evening entertainment</div>
                    </div>
                  </div>
                  <span className="text-stone-800 font-bold bg-[#F4DCB4] px-2 py-0.5 rounded-xs text-[10px]">
                    07:00 pm
                  </span>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "communities",
      name: "community hubs & groups",
      tagline: "cluster subreddits, discord channels, or groups into 1 broadcast hub",
      icon: Users,
      features: [
        {
          id: "community-clusters",
          badge: "community hubs engine",
          title: "group niche communities and automate rotational topic broadcasts",
          subtitle: "anti-spam interval staggering keeps your accounts safe and respected.",
          description:
            "cluster multiple subreddits (e.g. r/webdev, r/reactjs), discord announcement channels, or facebook groups. load a topic rotation pool and let socioconnect syndicate weekly updates on autopilot.",
          bullets: [
            "safe interval stagger: posts 5–10 minutes apart across targets to prevent spam flags",
            "rotational topic pool: automatically cycles through discussion prompts each week",
            "per-target flair & tag tagging so every community feels authentically addressed",
          ],
          mockup: (
            <div className="border border-line bg-[#faf8f5] p-5 rounded-lg font-mono text-xs space-y-3 lowercase">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-2.5 text-stone-500">
                <span className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Users className="h-3.5 w-3.5 text-amber-700" />
                  <span>cluster hub: tech &amp; creator subreddits</span>
                </span>
                <span className="text-stone-700 font-bold">4 targets</span>
              </div>

              <div className="p-3 bg-white border border-line rounded-md space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-800">active topic in rotation:</span>
                  <span className="text-amber-800 font-bold">rotation #2 of 6</span>
                </div>
                <div className="p-2 bg-[#fcfaf7] border border-[#ede8df] rounded-sm font-sans text-xs text-stone-800">
                  &ldquo;how we cut our social scheduling time from 2 hours to 10 minutes a
                  week&rdquo;
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-line text-[11px]">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <PlatformIcon platform="reddit" size={13} />
                    <span>r/reactjs</span>
                  </span>
                  <span className="text-emerald-700 font-semibold">drop 01 (now)</span>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-line text-[11px]">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <PlatformIcon platform="reddit" size={13} />
                    <span>r/nextjs</span>
                  </span>
                  <span className="text-stone-500 font-medium">+6 min stagger delay</span>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-line text-[11px]">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <PlatformIcon platform="reddit" size={13} />
                    <span>r/webdev</span>
                  </span>
                  <span className="text-stone-500 font-medium">+12 min stagger delay</span>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "growth",
      name: "growth analytics & privacy",
      tagline: "cross-network metrics in 1 dashboard &middot; 0% passwords stored",
      icon: BarChart3,
      features: [
        {
          id: "analytics-security",
          badge: "creator dashboard & security",
          title: "one visual scoreboard for all your channels, built on official oauth 2.0",
          subtitle: "see your aggregate reach without logging in and out of 8 platforms.",
          description:
            "connect with official login dialogs directly from google, meta, tiktok, and x. we never see or store your passwords. track total audience impressions, engagement velocity, and your top converting posts in one calm dashboard.",
          bullets: [
            "zero password exposure: 100% official encrypted oauth 2.0 creator tokens",
            "independent publishing queue: a slow network on one app never halts other posts",
            "weekly cross-network scoreboard showing aggregate reach and follower velocity",
          ],
          mockup: (
            <div className="border border-line bg-[#faf8f5] p-5 rounded-lg font-mono text-xs space-y-3 lowercase">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-2.5 text-stone-500">
                <span className="flex items-center gap-1.5 font-bold text-stone-900">
                  <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
                  <span>unified 30-day audience reach</span>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  +38% monthly growth
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2.5 border border-line rounded-md text-center">
                  <div className="text-[10px] text-stone-400">total impressions</div>
                  <div className="font-bold text-stone-900 text-sm font-sans mt-0.5">248,500</div>
                </div>
                <div className="bg-white p-2.5 border border-line rounded-md text-center">
                  <div className="text-[10px] text-stone-400">scheduled drops</div>
                  <div className="font-bold text-stone-900 text-sm font-sans mt-0.5">48 posts</div>
                </div>
                <div className="bg-white p-2.5 border border-line rounded-md text-center">
                  <div className="text-[10px] text-stone-400">hours saved</div>
                  <div className="font-bold text-stone-900 text-sm font-sans mt-0.5">34.5 hrs</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-line rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-stone-900 font-sans text-xs">
                      100% private permissions
                    </div>
                    <div className="text-[10px] text-stone-400">
                      zero password storage &middot; official tokens
                    </div>
                  </div>
                </div>
                <span className="text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  verified
                </span>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];
  const currentFeature =
    currentCategory.features[activeFeatureIndex] || currentCategory.features[0];

  return (
    <section id="features" className="relative py-16 lg:py-24 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 lowercase">
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md mb-4">
            <Sparkles className="h-3.5 w-3.5 text-stone-800" />
            <span>built for modern creators &amp; creative teams</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl font-sans">
            everything you need to grow across all your channels.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 font-sans leading-relaxed">
            no complicated enterprise jargon. just a calm, powerful studio built to help creators,
            founders, educators, and brands publish consistently and save 10+ hours every week.
          </p>
        </div>

        {/* Feature Category Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 lowercase font-mono text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = cat.id === activeTab;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab(cat.id);
                  setActiveFeatureIndex(0);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#F4DCB4] border-[#dfc39a] text-stone-900 font-bold shadow-xs"
                    : "bg-[#faf8f5] border-line text-stone-600 hover:text-stone-900 hover:bg-white"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isSelected ? "text-stone-900" : "text-stone-500"}`}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Details Container */}
        <div className="rounded-lg border border-line bg-[#faf8f5] p-6 sm:p-10 shadow-xs lowercase">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Feature Description & Bullets */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-xs border border-amber-200/60 mb-3">
                  <Sparkles className="h-3 w-3 text-amber-700" />
                  <span>{currentFeature.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-sans leading-tight">
                  {currentFeature.title}
                </h3>
                <p className="text-base text-stone-600 font-serif italic mt-1.5">
                  {currentFeature.subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                {currentFeature.description}
              </p>

              <div className="space-y-3 pt-2">
                {currentFeature.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 font-sans"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-dashed border-line flex items-center justify-between">
                <a
                  href="/app"
                  className="inline-flex items-center gap-2 font-mono text-xs font-bold text-stone-900 hover:text-amber-900 transition-colors"
                >
                  <span>try this feature in studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[11px] text-stone-400">
                  {currentCategory.tagline}
                </span>
              </div>
            </div>

            {/* Right Column: Live Mockup Card */}
            <div className="lg:col-span-6">{currentFeature.mockup}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
