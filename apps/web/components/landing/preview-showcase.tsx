"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PreviewShowcase() {
  return (
    <section id="previews" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            NATIVE FEED ADAPTATION
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            One message. Tailored for every feed.
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Every platform has its own unwritten culture. LinkedIn rewards structured career
            lessons. Threads thrives on casual coffee chats. X favors sharp, punchy hooks.
            SocioConnect lets you fine-tune and preview your voice for each platform before you
            publish.
          </p>
        </div>

        {/* Showcase Box */}
        <div className="relative border border-[#ede8df] bg-[#faf8f5] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Image Presentation with Dashed Accent Frame */}
            <div className="lg:col-span-7 relative">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xs border border-dashed border-[#dfc39a] shadow-xs bg-white p-1">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src="/images/creator_preview_cards.jpg"
                    alt="Side-by-side comparison of social media posts on LinkedIn, Threads, and X"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="mt-3 text-center font-mono text-xs text-stone-400">
                Visual feed previews render in real-time as you type
              </div>
            </div>

            {/* Explanation & Benefits */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="border border-[#ede8df] bg-white p-4 rounded-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 mb-1">
                    <span className="h-2 w-2 rounded-full bg-[#0a66c2]" />
                    <span>LINKEDIN: LONG-FORM CLARITY</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Keep your professional network engaged with proper spacing, clean headers, and
                    carousel-ready formatting.
                  </p>
                </div>

                <div className="border border-dashed border-[#dfc39a] bg-white p-4 rounded-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 mb-1">
                    <span className="h-2 w-2 rounded-full bg-stone-800" />
                    <span>THREADS: CONVERSATION STARTERS</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Spur authentic discussions with lifestyle and founder questions that encourage
                    quick comments and reposts.
                  </p>
                </div>

                <div className="border border-[#ede8df] bg-white p-4 rounded-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 mb-1">
                    <span className="h-2 w-2 rounded-full bg-stone-900" />
                    <span>X (TWITTER): VIRAL THREAD BREAKS</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Auto-split deep essays into numbered, tweetable thread segments when your
                    thoughts exceed 280 characters.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[#ede8df]">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 font-mono text-xs font-bold text-stone-900 hover:text-stone-700 underline decoration-[#F4DCB4] decoration-2 underline-offset-4 transition-colors"
                >
                  <span>EXPLORE THE STUDIO EDITOR</span>
                  <ArrowRight className="h-4 w-4 text-stone-700" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
