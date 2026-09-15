"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Can I schedule a single post to go out at different times on different platforms?",
    a: "Yes! This is one of SocioConnect's core strengths. Because your LinkedIn audience is active during morning coffee (e.g. 8:30 AM), while your YouTube viewers or Twitch streams peak in the afternoon and evening (e.g. 3:00 PM and 6:30 PM), you can compose your post once and choose between an 'Instant Simultaneous Blast' or 'Staggered Peak Windows' for each connected network.",
  },
  {
    q: "How does SocioConnect handle YouTube, Twitch, and Instagram connections?",
    a: "SocioConnect uses 100% official OAuth 2.0 PKCE and Developer APIs (Google Identity, Twitch API, Meta Graph API for Creators). When connecting an account, you authenticate directly on the platform's official authorization page. We only request write permissions to publish community posts, premieres, stream alerts, and captions. We NEVER ask for, receive, or store your actual login passwords.",
  },
  {
    q: "Do you read, scrape, or store my private social media feeds?",
    a: "No, never. SocioConnect is strictly an outbound cross-posting and scheduling engine. We do not fetch, read, parse, or scrape your private feed, timeline data, DMs, or browsing history. Our platform only pushes outbound dispatches when you compose or schedule posts.",
  },
  {
    q: "How are my OAuth access tokens protected?",
    a: "All authorization tokens are encrypted at rest using AES-256-GCM hardware vaults with automatic encryption key rotation and memory-sharded isolation. Even in the improbable event of a database compromise, encrypted ciphertexts cannot be deciphered without dedicated enclave keys.",
  },
  {
    q: "What happens if one social platform goes down during a simultaneous broadcast?",
    a: "We practice strict fault isolation. Every connected network (YouTube, Twitch, Instagram, X, LinkedIn, Peerlist, Reddit, Bluesky) is dispatched via separate, atomic asynchronous worker tasks. If one platform has a 503 outage or rate-limit hiccup, your other posts publish successfully on time, and our scheduler automatically retries the failed channel with exponential backoff.",
  },
  {
    q: "Can I disconnect an app at any time?",
    a: "Yes, instantly. You can revoke any connected platform with a single click in your Creator Studio settings. Doing so immediately purges the encrypted token from our vault, and you can also revoke access directly from your Google, Twitch, Meta, or X account security dashboards.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }

  return (
    <section id="faq" className="relative py-16 lg:py-24 border-t border-[#ede8df] bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            <Sparkles className="h-3.5 w-3.5 text-stone-700" />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Security, Privacy &amp; Distribution Architecture
          </h2>
          <p className="mt-3 text-base text-stone-600">
            Everything you need to know about our zero-password policy, outbound-only dispatches,
            and staggered peak-time scheduling.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border transition-colors rounded-xs ${
                  isOpen
                    ? "border-stone-900 bg-[#faf8f5]"
                    : "border-[#ede8df] bg-white hover:border-[#dfc39a]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-mono text-sm font-bold text-stone-900"
                >
                  <span className="font-sans text-base font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-stone-900" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-dashed border-[#ede8df] px-5 pb-5 pt-3">
                    <p className="font-sans text-sm text-stone-600 leading-relaxed font-normal">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
