import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#ede8df] bg-[#faf8f5] py-12 lg:py-16 text-stone-600 font-mono text-xs lowercase">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center border border-dashed border-[#dfc39a] bg-[#F4DCB4] font-mono text-xs font-bold text-stone-900 rounded-sm shadow-2xs">
                s
              </span>
              <span className="font-mono text-sm font-bold tracking-tight text-stone-900">
                socioconnect
              </span>
            </Link>
            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              calm multi-network cross-posting studio for youtube, twitch, instagram, x, linkedin,
              peerlist &amp; reddit creators.
            </p>
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>zero passwords stored guarantee</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <div className="font-bold text-stone-900 text-[11px] mb-3">product</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app" className="hover:text-stone-900 transition-colors">
                  creator studio workbench
                </Link>
              </li>
              <li>
                <a href="#live-stream" className="hover:text-stone-900 transition-colors">
                  live post stream
                </a>
              </li>
              <li>
                <a href="#calendar" className="hover:text-stone-900 transition-colors">
                  visual content calendar
                </a>
              </li>
              <li>
                <a href="#connectors" className="hover:text-stone-900 transition-colors">
                  private connections
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-stone-900 transition-colors">
                  transparent pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Channels */}
          <div>
            <div className="font-bold text-stone-900 text-[11px] mb-3">supported channels</div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-stone-700">youtube (video &amp; community)</span>
              </li>
              <li>
                <span className="text-stone-700">twitch (live alerts &amp; clips)</span>
              </li>
              <li>
                <span className="text-stone-700">instagram (reels &amp; carousels)</span>
              </li>
              <li>
                <span className="text-stone-700">linkedin &amp; peerlist</span>
              </li>
              <li>
                <span className="text-stone-700">x (twitter), reddit &amp; bluesky</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Guarantees */}
          <div>
            <div className="font-bold text-stone-900 text-[11px] mb-3">privacy &amp; safety</div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-stone-700">100% private account logins</span>
              </li>
              <li>
                <span className="text-stone-700">zero passwords requested or stored</span>
              </li>
              <li>
                <span className="text-stone-700">zero access to private dms or feeds</span>
              </li>
              <li>
                <span className="text-stone-700">independent channel publishing</span>
              </li>
              <li>
                <span className="text-stone-700">one-click connection revocation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-dashed border-[#ede8df] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>built for creators with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>by the socioconnect team</span>
          </div>
          <div>© {new Date().getFullYear()} socioconnect inc. all rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
