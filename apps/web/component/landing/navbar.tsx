"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Platforms", href: "#platforms" },
  { name: "Scheduler", href: "#features" },
  { name: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string>("Features");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-[#09090f]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
              : "bg-white/3 backdrop-blur-md border border-white/8"
          }`}
        >
          {/* Logo with Motion Interactive Feedback */}
          <Link href="/" className="group">
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 shadow-md shadow-red-600/25">
                <Share2 className="w-5 h-5 text-white" />
                <div className="absolute -inset-0.5 bg-red-500 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition duration-300 -z-10" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white flex items-center">
                Socio
                <span className="font-serif italic font-normal text-rose-400 text-xl ml-0.5">
                  Connect
                </span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation Links with Animated Pill Glider */}
          <div className="hidden md:flex items-center gap-1 relative p-1 ">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.name;
              return (
                <motion.div
                  key={link.name}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setActiveLink(link.name)}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors inline-block z-10 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navPill"
                        className="absolute inset-0 bg-white/12 border border-white/15 rounded-full shadow-inner -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {link.name}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="#login"
                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="#signup"
                className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/25 transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button with Animated Toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>

        {/* Mobile Menu Dropdown with Motion Animations */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="md:hidden mt-2 p-4 rounded-2xl bg-[#09090f]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3"
            >
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link, index) => {
                  const isActive = activeLink === link.name;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => {
                          setActiveLink(link.name);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-base font-medium rounded-lg transition-colors ${
                          isActive
                            ? "text-white bg-white/10 font-semibold"
                            : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        <span>{link.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    href="#login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center py-2.5 text-sm font-medium text-neutral-200 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    href="#signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
