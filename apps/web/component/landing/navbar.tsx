"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, Menu, X, Sparkles, ArrowRight, LogOut, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/auth-context";

const NAV_LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#platforms", label: "Platforms" },
  { href: "#architecture", label: "Architecture" },
  { href: "#open-source", label: "Open Source" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, isLoading, openAuthModal, logout } = useAuth();

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
        scrolled
          ? "bg-[#050508]/80 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 shadow-lg shadow-red-600/30 transition-transform duration-300 group-hover:scale-105">
              <Share2 className="w-4 h-4 text-white" />
              <div className="absolute -inset-1 bg-red-500 rounded-xl blur-xs opacity-40 group-hover:opacity-75 transition duration-300 -z-10" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white flex items-center">
              Socio
              <span className="font-serif italic font-normal text-rose-400 text-xl ml-0.5">
                Connect
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-full transition-colors hover:bg-white/[0.06]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA & Authentication */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer text-sm font-medium text-white"
                  >
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold">
                        {user.firstName ? user.firstName[0]?.toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="text-xs text-neutral-200">{user.firstName}</span>
                  </motion.button>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </div>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0a14] border border-white/12 shadow-2xl p-2 z-50 text-white backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-white/8 mb-1">
                        <p className="text-xs font-semibold text-white">
                          {user.firstName} {user.lastName || ""}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Command Center</span>
                      </Link>

                      <button
                        type="button"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={openAuthModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group overflow-hidden px-4 py-2 rounded-full text-xs font-semibold text-white bg-linear-to-r from-red-600 via-rose-600 to-red-600 bg-size-200 hover:bg-right transition-all duration-300 shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 text-rose-200 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white bg-white/5 border border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 bg-[#07070c]/95 backdrop-blur-2xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-md"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-rose-400 text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-md"
                  >
                    Sign In / Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
