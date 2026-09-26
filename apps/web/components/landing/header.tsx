"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useAuth } from "../../lib/auth-context";

const NAV_ITEMS = [
  { label: "studio", href: "/app" },
  { label: "features", href: "#features" },
  { label: "schedule", href: "#calendar" },
  { label: "workflow", href: "#workflow" },
  { label: "pricing", href: "#pricing" },
  { label: "faq", href: "#faq" },
];

function NavLink({
  label,
  href,
  mobile = false,
  onClick,
}: {
  label: string;
  href: string;
  mobile?: boolean;
  onClick?: () => void;
}) {
  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={
          mobile
            ? "block py-2 text-xs font-mono font-bold text-stone-900 hover:text-stone-900 transition-colors"
            : "relative py-1 text-xs font-mono font-bold text-stone-900 hover:text-stone-900 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#dfc39a] after:transition-all hover:after:w-full"
        }
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={
        mobile
          ? "block py-2 text-xs font-mono text-stone-700 hover:text-stone-900 transition-colors"
          : "relative py-1 text-xs font-mono font-medium text-stone-600 hover:text-stone-900 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-secondary after:transition-all hover:after:w-full"
      }
    >
      {label}
    </a>
  );
}

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, mockLogin } = useAuth();
  const router = useRouter();
  const { scrollY } = useScroll();

  useEffect(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const handleOpenStudio = () => {
    if (!isAuthenticated) {
      mockLogin();
    }
    router.push("/app");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
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
            ? "mt-3 sm:mt-4 max-w-5xl rounded-md border border-secondary-border bg-white/92 px-4 py-2 shadow-lg shadow-stone-900/6 backdrop-blur-md sm:px-6"
            : "mt-0 max-w-6xl rounded-none border-b border-line bg-white/95 px-4 py-3 sm:px-6 sm:py-3.5"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2 lowercase">
            <span
              className={`flex items-center justify-center rounded-md border bg-white transition-all ${
                isScrolled ? "h-7 w-7 border-secondary-border" : "h-7.5 w-7.5 border-[#dcd5c8]"
              }`}
            >
              <span className="flex h-3.5 w-3.5 items-end gap-[1.5px]">
                <span className="w-0.5 h-[45%] rounded-xs bg-stone-700" />
                <span className="w-0.5 h-[95%] rounded-xs bg-secondary" />
                <span className="w-0.5 h-[65%] rounded-xs bg-stone-700" />
              </span>
            </span>

            <span className="font-mono text-md font-bold tracking-tight text-stone-900">
              socioconnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:gap-5 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} {...item} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 lowercase">
            <button
              type="button"
              onClick={handleOpenStudio}
              className={`group inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-secondary-border bg-secondary font-mono font-bold text-stone-900 transition-all hover:bg-[#ebd0a3] ${
                isScrolled ? "px-3 py-1.5 text-xs" : "px-3.5 py-1.5 text-xs"
              }`}
            >
              <Sparkles className="h-3 w-3" />

              <span>open studio</span>

              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="cursor-pointer rounded-md border border-line bg-white p-2 text-stone-700 transition-colors hover:text-stone-900 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden border-t border-line pt-3 md:hidden"
            >
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.label} {...item} mobile onClick={closeMobileMenu} />
                ))}
              </div>

              <div className="mt-3 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleOpenStudio();
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-secondary-border bg-secondary py-2 font-mono text-xs font-bold text-stone-900 transition-colors hover:bg-[#ebd0a3]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>open studio</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
