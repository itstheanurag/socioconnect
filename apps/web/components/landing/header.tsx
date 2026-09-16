"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useAuth } from "../../lib/auth-context";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();
  const { scrollY } = useScroll();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsScrolled(window.scrollY > 20);
    }
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const handleOpenStudio = () => {
    if (isAuthenticated) {
      router.push("/app");
    } else {
      openAuthModal("/app");
    }
  };

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
        className={`pointer-events-auto w-full transition-all duration-300 ${
          isScrolled
            ? "mt-3 sm:mt-4 max-w-5xl bg-white/92 backdrop-blur-md shadow-lg shadow-stone-900/6 border border-[#dfc39a] py-2 px-4 sm:px-6 rounded-md"
            : "mt-0 max-w-6xl bg-white/95 backdrop-blur-xs shadow-none border-b border-[#ede8df] border-t-transparent border-x-transparent border-t-0 border-x-0 py-3 sm:py-3.5 px-4 sm:px-6 rounded-none"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2 shrink-0 lowercase">
            <span
              className={`flex items-center justify-center border bg-white rounded-md transition-all ${
                isScrolled ? "h-7 w-7 border-[#dfc39a]" : "h-7.5 w-7.5 border-[#dcd5c8]"
              }`}
            >
              <span className="flex items-end gap-[1.5px] h-3.5 w-3.5">
                <span className="w-0.5 bg-stone-700 h-[45%] rounded-xs" />
                <span className="w-0.5 bg-[#F4DCB4] h-[95%] rounded-xs" />
                <span className="w-0.5 bg-stone-700 h-[65%] rounded-xs" />
              </span>
            </span>
            <span
              className={`font-mono font-bold tracking-tight text-stone-900 transition-all text-md`}
            >
              socioconnect
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-xs font-mono text-stone-600 font-medium lowercase">
            <a
              href="#editor"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              studio
            </a>
            <a
              href="#live-stream"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              live dispatch
            </a>
            <a
              href="#calendar"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              calendar
            </a>
            <a
              href="#connectors"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              connectors
            </a>
            <a
              href="#workflow"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              workflow
            </a>
            <a
              href="#pricing"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              pricing
            </a>
            <a
              href="#faq"
              className="hover:text-stone-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#F4DCB4] after:transition-all"
            >
              faq
            </a>
          </nav>

          {/* Action CTA & Mobile Toggle */}
          <div className="flex items-center gap-2 lowercase">
            <button
              type="button"
              onClick={handleOpenStudio}
              className={`group inline-flex items-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] font-mono font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-md shadow-2xs cursor-pointer ${
                isScrolled ? "px-3 py-1.5 text-xs" : "px-3.5 py-1.5 text-xs"
              }`}
            >
              <Sparkles className="h-3 w-3 text-stone-800" />
              <span>open studio</span>
              <ArrowRight className="h-3 w-3 text-stone-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border border-[#ede8df] p-2 text-stone-700 hover:text-stone-900 bg-white rounded-md cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="border-t border-dashed border-[#ede8df] pt-3 pb-1 md:hidden rounded-md lowercase"
            >
              <nav className="flex flex-col gap-2 font-mono text-xs text-stone-700 px-1">
                <a
                  href="#editor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  studio composer
                </a>
                <a
                  href="#live-stream"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  live dispatch
                </a>
                <a
                  href="#calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  calendar
                </a>
                <a
                  href="#connectors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  connectors
                </a>
                <a
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  workflow
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  pricing
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-stone-900 transition-colors"
                >
                  faq
                </a>
                <div className="pt-2 border-t border-dashed border-[#ede8df]">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenStudio();
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 border border-[#dfc39a] bg-[#F4DCB4] font-mono font-bold text-stone-900 py-2.5 text-xs rounded-md cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>open studio</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
