"use client";

import type { ReactNode } from "react";
import { Bezel, Eyebrow, Reveal } from "@/components/ui";

export default function AuthShell({
  eyebrow,
  title,
  lede,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-32 md:grid-cols-12 md:gap-16 md:px-8">
      <div className="md:col-span-6">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-8 font-display text-[clamp(3rem,7vw,5.75rem)] leading-[0.95] tracking-[-0.02em]">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-soft">{lede}</p>
        </Reveal>
      </div>

      <div className="md:col-span-6 md:pl-8">
        <Reveal delay={200}>
          <Bezel coreClassName="p-6 sm:p-8 md:p-10">{children}</Bezel>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-6 px-2 text-center text-sm text-muted">{footer}</div>
        </Reveal>
      </div>
    </main>
  );
}
