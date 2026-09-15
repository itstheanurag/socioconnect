import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#ede8df] bg-[#faf8f5] py-12 lg:py-16 text-stone-600 font-mono text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center border border-dashed border-[#dfc39a] bg-[#F4DCB4] font-mono text-xs font-bold text-stone-900 rounded-xs shadow-2xs">
                S
              </span>
              <span className="font-mono text-sm font-bold tracking-tight text-stone-900">
                SOCIOCONNECT
              </span>
            </Link>
            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              Calm multi-network cross-posting studio for YouTube, Twitch, Instagram, X, LinkedIn,
              Peerlist &amp; Reddit creators.
            </p>
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero Passwords Stored Guarantee</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <div className="font-bold text-stone-900 uppercase text-[11px] mb-3">Product</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app" className="hover:text-stone-900 transition-colors">
                  Creator Studio Workbench
                </Link>
              </li>
              <li>
                <a href="#live-stream" className="hover:text-stone-900 transition-colors">
                  Live Notifications Stream
                </a>
              </li>
              <li>
                <a href="#calendar" className="hover:text-stone-900 transition-colors">
                  Visual Content Calendar
                </a>
              </li>
              <li>
                <a href="#connectors" className="hover:text-stone-900 transition-colors">
                  Zero-Knowledge Connectors
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-stone-900 transition-colors">
                  Transparent Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Channels */}
          <div>
            <div className="font-bold text-stone-900 uppercase text-[11px] mb-3">
              Supported Channels
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-stone-700">YouTube (Video &amp; Community)</span>
              </li>
              <li>
                <span className="text-stone-700">Twitch (Live Alerts &amp; Clips)</span>
              </li>
              <li>
                <span className="text-stone-700">Instagram (Reels &amp; Carousels)</span>
              </li>
              <li>
                <span className="text-stone-700">LinkedIn &amp; Peerlist</span>
              </li>
              <li>
                <span className="text-stone-700">X (Twitter), Reddit &amp; Bluesky</span>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <div className="font-bold text-stone-900 uppercase text-[11px] mb-3">
              Security &amp; Architecture
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-stone-700">OAuth 2.0 PKCE Session Handshake</span>
              </li>
              <li>
                <span className="text-stone-700">AES-256-GCM Vault Encryption</span>
              </li>
              <li>
                <span className="text-stone-700">Zero Private Feed Scraping</span>
              </li>
              <li>
                <span className="text-stone-700">Independent Asynchronous Workers</span>
              </li>
              <li>
                <span className="text-stone-700">Strict Rate-Limit Backoff Retries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-dashed border-[#ede8df] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>Built for creators with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>by the SocioConnect team</span>
          </div>
          <div>© {new Date().getFullYear()} SocioConnect Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
