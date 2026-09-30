"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/8 bg-[#050508] py-12 px-4 sm:px-6 lg:px-8 text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-600 shadow-sm shadow-red-600/30">
            <Share2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-white">
            Socio
            <span className="font-serif italic font-normal text-rose-400 text-lg ml-0.5">
              Connect
            </span>
          </span>
          <span className="text-xs text-neutral-500 pl-3 border-l border-white/10 hidden sm:inline">
            Intelligent Multi-Platform Distribution
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-xs text-neutral-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#platforms" className="hover:text-white transition-colors">
            Platforms
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-neutral-500">
          © {new Date().getFullYear()} SocioConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
