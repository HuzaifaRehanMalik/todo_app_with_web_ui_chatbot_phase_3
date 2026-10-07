"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/services/authService";
import { Bezel, Eyebrow, Icon, PillLink, Reveal } from "@/components/ui";

const previewTasks = [
  { title: "Draft the quarterly letter", meta: "Writing · 40 min", done: true },
  { title: "Call the framer about the prints", meta: "Errand · 10 min", done: false },
  { title: "Read two chapters, slowly", meta: "Evening · no rush", done: false },
];

export default function HomePage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (token) {
      // User is already logged in, redirect to todo page
      router.push("/todo");
    }
  }, [router]);

  return (
    <main className="overflow-x-clip">
      {/* Hero — editorial split */}
      <section className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-16 px-4 pb-24 pt-36 md:grid-cols-12 md:px-8 md:pt-40">
        <div className="md:col-span-7">
          <Reveal>
            <Eyebrow>A quieter to-do list</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-8 font-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">
              Less noise.
              <br />
              <em className="text-sage">More&nbsp;done.</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
              Todoify turns the day&apos;s scattered intentions into a short, calm list — and an assistant
              that adds, finishes and tidies tasks when you simply ask.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillLink href="/signup">Start your list</PillLink>
            <PillLink href="/login" variant="ghost">
              I have an account
            </PillLink>
          </Reveal>
        </div>

        {/* Preview stack */}
        <div className="relative md:col-span-5">
          <Reveal delay={200}>
            <Bezel className="md:rotate-[2deg]" coreClassName="p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Tuesday</span>
                <span className="font-display text-2xl text-ink-soft">1 of 3</span>
              </div>
              <ul className="mt-6 space-y-1">
                {previewTasks.map((t) => (
                  <li key={t.title} className="flex items-start gap-4 rounded-2xl px-2 py-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${
                        t.done ? "bg-sage text-paper ring-sage" : "ring-ink/20"
                      }`}
                    >
                      {t.done && <Icon name="check" className="w-3 h-3" strokeWidth={2} />}
                    </span>
                    <span>
                      <span className={`block text-[15px] ${t.done ? "text-muted line-through decoration-ink/30" : "text-ink"}`}>
                        {t.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{t.meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Bezel>
          </Reveal>
          <Reveal delay={360} className="relative z-10 mt-4 md:-mt-10 md:ml-[-3rem] md:mr-12">
            <Bezel tone="ink" className="md:-rotate-[2deg]" coreClassName="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper/10">
                  <Icon name="spark" className="w-4 h-4" />
                </span>
                <p className="text-sm leading-relaxed text-paper/80">
                  <span className="text-paper">&ldquo;Add pick up flowers for Sunday&rdquo;</span>
                  <br />
                  Done — it&apos;s on your list.
                </p>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>

      {/* Bento */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Considered details</Eyebrow>
          <h2 className="mt-6 font-display text-5xl leading-[1] tracking-[-0.02em] md:text-6xl">
            Built to get out of <em className="text-sage">your way.</em>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-2">
          <Reveal className="md:col-span-7 md:row-span-2">
            <Bezel coreClassName="flex h-full flex-col justify-between gap-16 p-8 md:p-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-soft text-sage">
                <Icon name="chat" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display text-4xl leading-tight tracking-tight">Talk to your list.</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-ink-soft">
                  The built-in assistant understands plain language. Ask it to add, show or finish a task and
                  your list updates beside you.
                </p>
              </div>
            </Bezel>
          </Reveal>
          <Reveal delay={100} className="md:col-span-5">
            <Bezel coreClassName="h-full p-8">
              <Icon name="lock" className="w-5 h-5 text-sage" />
              <h3 className="mt-8 text-lg font-semibold tracking-tight">Private by default</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Token-based sign-in keeps every list visible to you alone.
              </p>
            </Bezel>
          </Reveal>
          <Reveal delay={200} className="md:col-span-5">
            <Bezel coreClassName="h-full p-8">
              <Icon name="download" className="w-5 h-5 text-sage" />
              <h3 className="mt-8 text-lg font-semibold tracking-tight">Take it with you</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Export your tasks whenever you like. Your data stays yours.
              </p>
            </Bezel>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8 md:pb-32">
        <Reveal>
          <Bezel tone="ink" coreClassName="flex flex-col items-start justify-between gap-10 p-10 md:flex-row md:items-end md:p-14">
            <h2 className="max-w-lg font-display text-5xl leading-[1] tracking-[-0.02em] md:text-6xl">
              Tomorrow starts with <em className="text-sage-soft">one line.</em>
            </h2>
            <PillLink href="/signup" variant="sage">Create your list</PillLink>
          </Bezel>
        </Reveal>
        <footer className="mt-16 flex flex-col justify-between gap-2 text-xs text-muted md:flex-row">
          <span>© Todoify</span>
          <span>Secure authentication with JWT · Next.js & Tailwind CSS</span>
        </footer>
      </section>
    </main>
  );
}
