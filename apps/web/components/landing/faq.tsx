"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  code: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    code: "PRIVACY FAQ / 01",
    question: "Do you ever ask for, take, or store my social media passwords?",
    answer:
      "Never. SocioConnect connects exclusively via verified, official OAuth 2.0 PKCE and platform developer protocols (LinkedIn, X, Peerlist, Reddit, Bluesky, Mastodon). You authenticate directly on the platform's official authorization page. We only receive a scoped write-token, which is immediately encrypted at rest with hardware-grade AES-256-GCM. We never see or store your raw login credentials.",
  },
  {
    code: "ARCHITECTURE / 02",
    question: "Do you fetch, read, or scrape my timeline feeds or direct messages?",
    answer:
      "No. SocioConnect is built strictly as a high-performance outbound cross-posting and scheduling engine. We only request write-only permissions (`posts:write`, `w_member_social`, `submit_post`). We do not read, fetch, scrape, or store your private feeds, bookmarks, or direct messages.",
  },
  {
    code: "PLATFORMS / 03",
    question: "Which platforms and apps are currently supported?",
    answer:
      "SocioConnect supports direct simultaneous dispatch and scheduled publishing to X (Twitter), LinkedIn (Personal & Company Pages), Peerlist, Reddit (selected Subreddits), Bluesky (AT Protocol), and Mastodon (ActivityPub instances).",
  },
  {
    code: "RELIABILITY / 04",
    question: "What happens if one platform suffers a network glitch or 429 rate limit?",
    answer:
      "We use an atomic, fault-isolated queue architecture. If X has a momentary outage or Reddit experiences a rate limit, your LinkedIn, Peerlist, and Bluesky posts dispatch on time with zero delay. The failed channel is automatically queued for safe exponential backoff retries without duplicating posts.",
  },
  {
    code: "SCHEDULING / 05",
    question: "How does the visual calendar handle different timezones?",
    answer:
      "The visual calendar allows you to plan your content queue globally. You can switch between UTC, PST, EST, IST, and GMT to ensure your announcements drop exactly when your target audience is active and reading.",
  },
  {
    code: "FORMATTING / 06",
    question: "How does the composer handle character limits between platforms?",
    answer:
      "The composer displays real-time character meters for each selected destination (e.g., 280 chars for X, 300 for Bluesky, 3,000 for LinkedIn). When your post exceeds a platform's budget, our thread splitter can automatically segment and number your thoughts into clean, readable threads.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section id="faq" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <span className="h-2 w-2 rounded-full bg-[#dfc39a]" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Everything you need to know about SocioConnect.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            Clear answers about OAuth security, outbound dispatching, and queue scheduling.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="relative border border-[#ede8df] bg-[#faf8f5] rounded-xs transition-colors hover:border-stone-400"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-mono text-sm transition-colors hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-800 bg-[#F4DCB4]/35 px-2 py-0.5 rounded-xs border border-[#dfc39a] font-bold">
                      {faq.code}
                    </span>
                    <span className="font-bold text-stone-900 font-sans text-sm sm:text-base">
                      {faq.question}
                    </span>
                  </div>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-stone-400 shrink-0 ml-4"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dashed border-[#ede8df] bg-white px-5 pb-5 pt-3 font-sans text-sm text-stone-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
