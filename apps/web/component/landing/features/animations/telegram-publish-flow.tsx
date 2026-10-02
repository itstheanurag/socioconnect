"use client";

import { motion } from "motion/react";
import { Bot, Check, Clock } from "lucide-react";

export default function TelegramPublishFlow() {
  return (
    <div className="relative mt-7 h-[190px] overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#24A1DE]/[0.06] blur-3xl" />

      {/* User message */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.4,
          delay: 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex justify-end"
      >
        <div className="max-w-[82%] rounded-2xl rounded-tr-sm border border-blue-500/20 bg-blue-600/20 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-neutral-200">
            Publish this tomorrow at 10 AM
          </p>

          <div className="mt-1 text-right font-mono text-[8px] text-blue-200/50">09:42 PM</div>
        </div>
      </motion.div>

      {/* Processing line */}
      <div className="relative z-10 flex h-8 items-center justify-center">
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.45,
            duration: 0.3,
          }}
          className="h-full w-px origin-top bg-gradient-to-b from-blue-400/40 to-[#24A1DE]/40"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0] }}
          viewport={{ once: true }}
          transition={{
            delay: 0.55,
            duration: 0.8,
          }}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#24A1DE] shadow-[0_0_8px_rgba(36,161,222,0.8)]"
        />
      </div>

      {/* Bot response */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.65,
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex justify-start"
      >
        <div className="w-[90%] rounded-2xl rounded-tl-sm border border-neutral-800 bg-neutral-950/60 p-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#24A1DE]/10 text-[#24A1DE]">
              <Bot className="h-3 w-3" />
            </div>

            <span className="font-mono text-[9px] text-neutral-400">SocioConnect Bot</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-400">
              <Check className="h-3 w-3" />
            </div>

            <div>
              <div className="text-[10px] font-medium text-neutral-200">Scheduled</div>

              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-neutral-500">
                <Clock className="h-2.5 w-2.5" />
                Tomorrow · 10:00 AM
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
