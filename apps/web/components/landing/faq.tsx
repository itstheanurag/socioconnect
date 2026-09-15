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
    code: "CREATOR FAQ / 01",
    question: "Will my posts look automated or lose their personal touch?",
    answer:
      "Not at all. SocioConnect is built to preserve your authentic voice. You see a real-time, pixel-perfect preview of how your words, emojis, line breaks, and hashtags will render on each specific feed before hitting publish. You maintain 100% editorial control over your content.",
  },
  {
    code: "CREATOR FAQ / 02",
    question: "What if my post is too long for X (280 chars) but perfect for LinkedIn?",
    answer:
      "We built smart platform guardrails specifically for this! You can keep your complete long-form essay for LinkedIn, while our automatic thread splitter packages your thoughts into a numbered, easy-to-read thread for X and Threads without losing context.",
  },
  {
    code: "CREATOR FAQ / 03",
    question: "What actually happens if one social platform has a glitch or rate limit?",
    answer:
      "Unlike legacy social schedulers where one error cancels your entire batch, SocioConnect uses an independent delivery model. If X experiences a temporary rate limit or Threads is down for maintenance, your LinkedIn and Bluesky posts go live immediately without delay. The failed feed is safely queued for an automatic quiet retry.",
  },
  {
    code: "CREATOR FAQ / 04",
    question: "Do I ever need to enter my social media passwords?",
    answer:
      "Never. SocioConnect connects solely through official OAuth permissions approved by LinkedIn, Meta (Threads), X, Bluesky, and Mastodon. Your account credentials never touch our servers, and you can revoke access at any time with a single click.",
  },
  {
    code: "CREATOR FAQ / 05",
    question: "Can I schedule posts for different timezones?",
    answer:
      "Yes! You can choose your local timezone or specify the optimal reading hours for your target audience (e.g. 9:00 AM EST for US founders). The visual calendar displays your scheduled drops cleanly so you always know what's going live.",
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
            Everything you need to know about the creator desk.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            Have questions about formatting, scheduling, or channel safety? We&apos;ve got answers.
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
