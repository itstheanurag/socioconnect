import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[#ede8df] bg-[#faf8f5] pt-16 pb-12 font-mono text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Pre-footer Call to Action Card with Dashed Border */}
        <div className="relative mb-16 border border-dashed border-[#dfc39a] bg-white p-8 sm:p-12 shadow-sm rounded-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] text-stone-700 font-bold tracking-widest uppercase block mb-1">
                CREATE WITH CONFIDENCE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-sans text-stone-900">
                Ready to take the stress out of social distribution?
              </h3>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Join thousands of writers, founders, and creators saving 5+ hours every week. Write
                once, preview across feeds, and publish without anxiety.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 border border-[#dfc39a] bg-[#F4DCB4] px-6 py-3.5 font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-sm shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-stone-800" />
                <span>OPEN CREATOR STUDIO FREE</span>
                <ArrowRight className="h-4 w-4 text-stone-800" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Meta Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-dashed border-[#ede8df]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center border border-[#dcd5c8] bg-white rounded-xs">
                <span className="flex items-end gap-[1.5px] h-3 w-3">
                  <span className="w-0.5 bg-stone-700 h-[40%]" />
                  <span className="w-0.5 bg-[#F4DCB4] h-[95%]" />
                  <span className="w-0.5 bg-stone-700 h-[65%]" />
                </span>
              </span>
              <span className="font-extrabold tracking-widest text-stone-900">SOCIOCONNECT</span>
            </div>
            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              The calm, multi-channel distribution studio built for independent content creators,
              authors, and founders.
            </p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              CREATOR TOOLS
            </span>
            <ul className="space-y-2 text-stone-600">
              <li>
                <Link href="/app" className="hover:text-stone-900 transition-colors">
                  Studio Composer
                </Link>
              </li>
              <li>
                <a href="#editor" className="hover:text-stone-900 transition-colors">
                  Interactive Playground
                </a>
              </li>
              <li>
                <a href="#previews" className="hover:text-stone-900 transition-colors">
                  Live Feed Previews
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-stone-900 transition-colors">
                  Creator Calendar
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              SUPPORTED FEEDS
            </span>
            <ul className="space-y-2 text-stone-600">
              <li>LinkedIn Feed &amp; Carousels</li>
              <li>Threads Discussions</li>
              <li>X (Twitter) &amp; Thread Splitter</li>
              <li>Bluesky &amp; Mastodon</li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              LIVE STUDIO STATUS
            </span>
            <div className="border border-dashed border-[#dfc39a] bg-white p-3 space-y-2 rounded-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">PLATFORM STATUS</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ALL FEEDS NOMINAL
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">DELIVERY SPEED</span>
                <span className="text-stone-700">&lt; 1 sec instant</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">FAIL-SAFE ENGINE</span>
                <span className="text-stone-700">100% Isolated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} SocioConnect. Designed for mindful content distribution.
          </div>
          <div className="flex items-center gap-6">
            <span>Official Social APIs</span>
            <span>·</span>
            <span>Zero Password Sharing</span>
            <span>·</span>
            <span>Privacy First</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
