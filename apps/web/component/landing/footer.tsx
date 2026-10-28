import Link from "next/link";
import { Share2 } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-neutral-950 px-4 pb-8 pt-16 text-neutral-400 sm:px-6 sm:pb-10 sm:pt-24 lg:px-8">
      {/* Oversized brand wordmark behind the floating footer */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex select-none justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span className="translate-y-[6%] whitespace-nowrap font-display text-[15vw] font-bold leading-[0.8] tracking-[-0.075em] text-neutral-100/[0.06] sm:text-[12vw]">
          Socio
          <span className="font-serif font-normal italic text-rose-400/[0.13]">Connect</span>
        </span>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-6 h-56 w-[56rem] -translate-x-1/2 rounded-full bg-rose-500/[0.045] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 px-5 py-4 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.95),0_-18px_50px_-38px_rgba(244,63,94,0.45)] backdrop-blur-2xl sm:px-6">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-rose-500/55 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-rose-600/15 blur-[80px]"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-sm shadow-red-600/30">
                <Share2 className="h-4 w-4 text-neutral-100" />
              </span>
              <span className="font-display text-base font-bold tracking-tight text-neutral-100">
                Socio
                <span className="ml-0.5 font-serif text-lg font-normal italic text-rose-400">
                  Connect
                </span>
              </span>
              <span className="hidden border-l border-neutral-700/80 pl-3 text-[11px] text-neutral-500 lg:inline">
                Intelligent Multi-Platform Distribution
              </span>
            </Link>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-400"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded transition-colors hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              © {new Date().getFullYear()} SocioConnect
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-2 px-1 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600 sm:flex-row">
          <span>One idea. Many rooms.</span>
          <span className="flex items-center gap-1.5 text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Broadcast systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
