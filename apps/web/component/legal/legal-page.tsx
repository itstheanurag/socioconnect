import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

export function LegalPage({
  title,
  eyebrow,
  updated,
  intro,
  children,
}: {
  title: string;
  eyebrow: string;
  updated?: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-neutral-300">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SocioConnect
        </Link>

        <div className="mt-8 border-b border-neutral-800 pb-6">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-300">
            {eyebrow}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
            {title}
          </h1>
          {updated && (
            <div className="mt-2 text-[11px] text-neutral-500">Last updated: {updated}</div>
          )}
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{intro}</p>
        </div>

        <div className="prose-invert mt-8 space-y-8 text-sm leading-relaxed text-neutral-400">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
