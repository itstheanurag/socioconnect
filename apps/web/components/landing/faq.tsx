"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "can i schedule a single post to go out at different times on different platforms?",
    a: "yes! that's one of socioconnect's best features. because your linkedin network reads during morning coffee (e.g. 8:30 am), while your youtube viewers or twitch streams peak in the afternoon and evening (e.g. 4:00 pm and 6:30 pm), you can write your post once and choose 'staggered peak hours' to automatically hit each platform at the ideal time.",
  },
  {
    q: "how does socioconnect connect to youtube, twitch, and instagram?",
    a: "socioconnect uses official, verified creator logins directly with google, twitch, meta, and x. when connecting an account, you authenticate on that platform's official security screen. we only ask for permission to publish your posts. we never ask for, see, or store your passwords.",
  },
  {
    q: "do you read, scrape, or look at my private social media feeds?",
    a: "no, never. socioconnect is strictly a publishing and scheduling studio. we do not read your private feeds, timelines, dms, or follower browsing history. we only send out the posts and announcements you approve.",
  },
  {
    q: "how are my account connections protected?",
    a: "all connections are hardware-encrypted and kept 100% private. even if someone tried to access our systems, they could never log into your accounts or see your passwords. you remain in complete control at all times.",
  },
  {
    q: "what happens if one social platform has a glitch or temporary downtime?",
    a: "your other posts go live without any delay! socioconnect handles each social network independently. if one platform is experiencing high traffic or a brief error, our system automatically tries again until your post is published safely.",
  },
  {
    q: "can i disconnect an account at any time?",
    a: "yes, instantly. you can disconnect any platform with one click in your studio settings. you can also revoke access anytime directly from your google, twitch, instagram, or x account security settings.",
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
        <div className="text-center mb-12 lowercase">
          <div className="inline-flex items-center gap-2 border border-dashed border-secondary-border bg-secondary/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md mb-4">
            <Sparkles className="h-3.5 w-3.5 text-stone-700" />
            <span>commonly asked questions</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            everything you need to know
          </h2>
          <p className="mt-3 text-base text-stone-600">
            clear answers about account safety, privacy, timed drops, and keeping your channels in
            sync.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 lowercase">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border transition-colors rounded-md overflow-hidden ${
                  isOpen
                    ? "border-stone-900 bg-[#faf8f5]"
                    : "border-[#ede8df] bg-white hover:border-secondary-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-mono text-sm font-bold text-stone-900 cursor-pointer"
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
