"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useInView } from "../../lib/useInView";
import { ArrowRight, Sparkles } from "lucide-react";
import { PlatformIcon } from "./platform-icons";
import { useAuth } from "../../lib/auth-context";

export function LandingCTA() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  const handleOpenStudio = () => {
    if (isAuthenticated) {
      router.push("/app");
    } else {
      openAuthModal("/app");
    }
  };

  const floatingPlatforms = [
    { id: "youtube", pos: { top: "12%", left: "8%" }, delay: 0.3 },
    { id: "twitch", pos: { top: "18%", right: "8%" }, delay: 0.4 },
    { id: "instagram", pos: { bottom: "16%", left: "10%" }, delay: 0.5 },
    { id: "x", pos: { bottom: "22%", right: "10%" }, delay: 0.6 },
    { id: "linkedin", pos: { top: "48%", left: "5%" }, delay: 0.7 },
    { id: "peerlist", pos: { top: "54%", right: "6%" }, delay: 0.8 },
  ];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-white border-t border-[#ede8df]">
      {/* Background Dotted Grid */}
      <div className="absolute inset-0 trapped-dots opacity-40 pointer-events-none" />

      <div ref={ref} className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-md bg-[#faf8f5] border border-[#ede8df] overflow-hidden p-8 sm:p-12 lg:p-16 shadow-xs"
        >
          {/* Subtle Ambient Amber Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#F4DCB4]/50 via-[#fcf7ee]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Floating platform icons (Visible on tablet & desktop) */}
          {floatingPlatforms.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: item.delay, duration: 0.5 }}
              className="absolute hidden md:block"
              style={item.pos}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5, ease: "easeInOut" }}
                className="w-11 h-11 rounded-md border border-[#ede8df] bg-white flex items-center justify-center shadow-2xs"
              >
                <PlatformIcon platform={item.id} size={20} />
              </motion.div>
            </motion.div>
          ))}

          {/* Content */}
          <div className="relative text-center max-w-2xl mx-auto lowercase">
            <div className="inline-flex items-center gap-2 border border-dashed border-[#dfc39a] bg-[#F4DCB4]/30 px-3.5 py-1 text-xs font-mono font-semibold text-stone-900 rounded-md mb-6">
              <Sparkles className="h-3.5 w-3.5 text-stone-800" />
              <span>start publishing calmly</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]">
              your next post shouldn&apos;t take{" "}
              <span className="font-serif italic font-normal text-stone-600">
                five apps to publish.
              </span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
              connect your channels in seconds, schedule at peak viewer hours, and let your calm
              studio take care of the rest.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenStudio}
                className="group inline-flex items-center gap-2.5 border border-[#dfc39a] bg-[#F4DCB4] px-7 py-3 text-xs font-mono font-bold text-stone-900 hover:bg-[#ebd0a3] transition-all rounded-md shadow-xs cursor-pointer"
              >
                <span>open creator studio</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-stone-800" />
              </button>
            </div>

            <p className="mt-4 text-xs font-mono text-stone-400">
              100% free to start · zero passwords stored · no credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LandingCTA;
