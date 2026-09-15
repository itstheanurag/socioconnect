"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import {
  YouTubeIcon,
  TwitchIcon,
  InstagramIcon,
  XTwitterIcon,
  LinkedInIcon,
  RedditIcon,
  PeerlistIcon,
  BlueskyIcon,
} from "./platform-icons";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-18 pb-16 lg:pt-24 lg:pb-24">
      {/* Background Soft Dotted Texture & Warm Amber Glow */}
      <div className="absolute inset-0 trapped-dots opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-95 bg-linear-to-tr from-[#F4DCB4]/45 via-[#fcf7ee]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Frame */}
        <div className="relative border border-[#ede8df] bg-white p-6 sm:p-10 lg:p-14 shadow-xs">
          {/* Top creator badge */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-[#ede8df] pb-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/35 px-3 py-0.5 text-stone-900 font-semibold rounded">
                <Sparkles className="h-3 w-3 text-stone-700" />
                Stop publishing the same post 8 times.
              </span>
            </div>
            <div className="flex items-center gap-4 text-stone-500">
              {/* Authentic Platform SVG Icons */}
              <div className="flex items-center gap-2.5">
                <YouTubeIcon className="h-3.5 w-3.5 text-[#FF0000]" title="YouTube" />
                <TwitchIcon className="h-3.5 w-3.5 text-[#9146FF]" title="Twitch" />
                <InstagramIcon className="h-3.5 w-3.5 text-[#E1306C]" title="Instagram" />
                <XTwitterIcon className="h-3 w-3 text-stone-900" title="X" />
                <LinkedInIcon className="h-3.5 w-3.5 text-[#0A66C2]" title="LinkedIn" />
                <RedditIcon className="h-3.5 w-3.5 text-[#FF4500]" title="Reddit" />
                <PeerlistIcon className="h-3 w-3 text-[#00AA45]" title="Peerlist" />
                <BlueskyIcon className="h-3 w-3 text-[#0285FF]" title="Bluesky" />
              </div>
              <span className="text-stone-300">/</span>
              <span className="italic text-neutral-400 lowercase tracking-tighter">
                ZERO PASSWORDS STORED
              </span>
            </div>
          </div>

          {/* Headline & Creator Hook */}
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.08]">
                One calm studio. <br />
                <span className="font-serif italic font-normal text-stone-600">
                  Every channel at its peak attention.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed font-normal font-sans"
            >
              Write once in a single distraction-free composer. Choose between an{" "}
              <strong>instant simultaneous blast</strong> or <strong>staggered peak times</strong>{" "}
              across YouTube, Twitch, Instagram, X, LinkedIn, and Reddit — backed by zero-password
              OAuth 2.0 vaults.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/app"
                className="group inline-flex items-center gap-3 border border-[#dfc39a] bg-[#F4DCB4] px-6 py-3.5 text-xs font-mono font-bold text-stone-900 transition-all hover:bg-[#ebd0a3] hover:shadow-md hover:shadow-[#F4DCB4]/40 rounded-sm"
              >
                <span>OPEN CREATOR STUDIO</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-stone-800" />
              </Link>

              <a
                href="#editor"
                className="group inline-flex items-center gap-2.5 border border-dashed border-[#dcd5c8] bg-white px-6 py-3.5 text-xs font-mono font-semibold text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 rounded-sm"
              >
                <Zap className="h-3.5 w-3.5 text-stone-800 fill-[#F4DCB4]" />
                <span>TRY LIVE DISPATCHER</span>
              </a>
            </motion.div>
          </div>

          {/* Embedded Image Mockup: Creator Studio Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 relative border border-dashed border-[#dfc39a] bg-[#faf8f5] p-2 sm:p-3 shadow-sm"
          >
            {/* Mockup browser chrome header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ede8df] bg-white mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f28b82]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F4DCB4]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#81c995]" />
                <span className="ml-2 font-mono text-[11px] text-stone-400">
                  socioconnect.app/studio · multi-network cross-post dispatcher &amp; scheduler
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-stone-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>AES-256 VAULT ACTIVE</span>
              </div>
            </div>

            {/* The Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xs border border-[#ede8df]">
              <Image
                src="/images/creator_studio_mockup.jpg"
                alt="SocioConnect Creator Studio Dashboard showing multi-platform post composer and calendar"
                fill
                priority
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Creator Benefits Strip */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 border-t border-dashed border-[#ede8df] pt-8 gap-4">
            <div className="border-r border-dashed border-b md:border-b-0 border-[#ede8df] p-3 first:pl-0">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-stone-900">8+ Apps</div>
              <div className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Official Channels
              </div>
              <p className="mt-1 text-xs text-stone-500">
                YouTube, Twitch, Instagram, X, LinkedIn &amp; more
              </p>
            </div>

            <div className="border-b md:border-b-0 md:border-r border-dashed border-[#ede8df] p-3">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <span>0</span>
              </div>
              <div className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Passwords Stored
              </div>
              <p className="mt-1 text-xs text-stone-500">
                100% official OAuth 2.0 PKCE token vaults
              </p>
            </div>

            <div className="border-r border-dashed border-[#ede8df] p-3 first:pl-0 sm:pl-3">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-stone-900">
                Peak Hours
              </div>
              <div className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Staggered Windows
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Morning coffee, lunch tech feed, evening stream
              </p>
            </div>

            <div className="p-3 pr-0">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-stone-900">
                0 Panics
              </div>
              <div className="mt-1 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Fault Isolation
              </div>
              <p className="mt-1 text-xs text-stone-500">
                1 platform glitch never halts other posts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
