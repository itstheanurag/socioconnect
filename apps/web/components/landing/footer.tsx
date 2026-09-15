import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[#ede8df] bg-[#faf8f5] pt-16 pb-12 font-mono text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Pre-footer Call to Action Card with Dashed Border */}
        <div className="relative mb-16 border border-dashed border-[#dfc39a] bg-white p-8 sm:p-12 shadow-sm rounded-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] text-stone-700 font-bold tracking-widest uppercase block mb-1">
                DISTRIBUTE WITH CONFIDENCE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-sans text-stone-900">
                Ready to take the stress out of multi-app cross-posting?
              </h3>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Join thousands of writers, founders, and creators saving 5+ hours every week. Write
                once, schedule across timezones, and broadcast without password sharing or feed
                tracking.
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
              The calm, outbound multi-network distribution engine built for independent makers,
              writers, and engineering teams.
            </p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              CREATOR ENGINE
            </span>
            <ul className="space-y-2 text-stone-600">
              <li>
                <Link href="/app" className="hover:text-stone-900 transition-colors">
                  Studio Composer
                </Link>
              </li>
              <li>
                <a href="#editor" className="hover:text-stone-900 transition-colors">
                  Multi-App Dispatcher
                </a>
              </li>
              <li>
                <a href="#live-stream" className="hover:text-stone-900 transition-colors">
                  Live Dispatch Stream
                </a>
              </li>
              <li>
                <a href="#calendar" className="hover:text-stone-900 transition-colors">
                  Visual Calendar Queue
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              SUPPORTED NETWORKS
            </span>
            <ul className="space-y-2 text-stone-600">
              <li>X (Twitter) &amp; Thread Breaks</li>
              <li>LinkedIn (Posts &amp; Articles)</li>
              <li>Peerlist (Projects &amp; Posts)</li>
              <li>Reddit (Subreddit Submissions)</li>
              <li>Bluesky &amp; Mastodon</li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-3">
              SECURITY VAULT
            </span>
            <div className="border border-dashed border-[#dfc39a] bg-white p-3 space-y-2 rounded-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">AUTH PROTOCOL</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  OAuth 2.0 PKCE
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">ENCRYPTION</span>
                <span className="text-stone-800 font-bold">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">PASSWORDS STORED</span>
                <span className="text-emerald-700 font-bold">0 (Zero)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} SocioConnect. Outbound cross-posting &amp; scheduling
            engine.
          </div>
          <div className="flex items-center gap-6">
            <span>Official OAuth APIs</span>
            <span>·</span>
            <span>Zero Password Storage</span>
            <span>·</span>
            <span>Zero Feed Scraping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
