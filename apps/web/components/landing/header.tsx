"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsScrolled(window.scrollY > 20);
    }
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4 sm:px-6">
      <motion.header
        layout
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 32,
          mass: 0.8,
        }}
        className={`pointer-events-auto w-full transition-all duration-300 rounded-none ${
          isScrolled
            ? "mt-3 sm:mt-4 max-w-4xl bg-white/92 backdrop-blur-md shadow-lg shadow-stone-900/6 border border-[#dfc39a] py-2 px-4 sm:px-6"
            : "mt-0 max-w-6xl bg-white/95 backdrop-blur-xs shadow-none border-b border-[#ede8df] border-t-transparent border-x-transparent border-t-0 border-x-0 py-3 sm:py-3.5 px-4 sm:px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <span
              className={`flex items-center justify-center border bg-white rounded-none transition-all ${
                isScrolled ? "h-6 w-6 border-[#dfc39a]" : "h-7 w-7 border-[#dcd5c8]"
              }`}
            >
              <span className="flex items-end gap-[1.5px] h-3 w-3">
                <span className="w-0.5 bg-stone-700 h-[45%]" />
                <span className="w-0.5 bg-[#F4DCB4] h-[95%]" />
                <span className="w-0.5 bg-stone-700 h-[65%]" />
              </span>
            </span>
            <span
              className={`font-mono font-bold tracking-[0.16em] text-stone-900 transition-all ${
                isScrolled ? "text-[11px]" : "text-xs"
              }`}
            >
              SOCIOCONNECT
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-[11px] font-mono tracking-wide text-stone-600 font-medium">
            <a
              href="#editor"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              STUDIO
            </a>
            <a
              href="#previews"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              PREVIEWS
            </a>
            <a
              href="#workflow"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              WORKFLOW
            </a>
            <a
              href="#pricing"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              PRICING
            </a>
            <a
              href="#faq"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              FAQ
            </a>
          </nav>

          {/* Action CTA & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className={`group inline-flex items-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] font-mono font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-xs shadow-2xs ${
                isScrolled ? "px-3 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]"
              }`}
            >
              <Sparkles className="h-3 w-3 text-stone-800" />
              <span>WRITE</span>
              <ArrowRight className="h-3 w-3 text-stone-700 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border border-[#ede8df] p-1.5 text-stone-700 hover:text-stone-900 bg-white rounded-xs"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Sharp architectural dropdown) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="border-t border-dashed border-[#ede8df] pt-3 pb-1 md:hidden"
            >
              <nav className="flex flex-col gap-2 font-mono text-xs text-stone-700 px-1">
                <a
                  href="#editor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  STUDIO COMPOSER
                </a>
                <a
                  href="#previews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  VISUAL PREVIEWS
                </a>
                <a
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  CREATOR WORKFLOW
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  PRICING
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  FAQ
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
