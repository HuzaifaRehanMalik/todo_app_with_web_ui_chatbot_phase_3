"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import ChatBot from "@/components/ChatBot";
import { Todo } from "@/types/todo";
import { getAllTodos, exportTodos } from "@/services/todoService";
import { tokenStorage } from "@/services/authService";
import { Bezel, ErrorNote, Eyebrow, Icon, PillButton, Reveal } from "@/components/ui";
import { addDays, dueGroup, fromDayKey, relativeDayLabel, todayKey } from "@/lib/dates";

type Filter = "all" | "open" | "done";
type Section = "overdue" | "today" | "tomorrow" | "upcoming" | "none" | "earlier";

const SECTION_ORDER: { key: Section; label: string }[] = [
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "upcoming", label: "Upcoming" },
  { key: "none", label: "No date" },
  { key: "earlier", label: "Earlier" },
];

const ASSISTANT_PROMPTS = ["“Add call mom tomorrow”", "“What’s due this week?”", "“Move the dentist to Friday”"];

/** Overdue only applies to open tasks; finished tasks from past days collect under "Earlier". */
function sectionOf(todo: Todo, today: string): Section {
  const g = dueGroup(todo.due_date, today);
  if (g === "overdue") return todo.completed ? "earlier" : "overdue";
  return g;
}

/** Open before done, then by due date, then oldest first. */
function compareTodos(a: Todo, b: Todo): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const ad = a.due_date ?? "9999-12-31";
  const bd = b.due_date ?? "9999-12-31";
  if (ad !== bd) return ad < bd ? -1 : 1;
  return a.created_at < b.created_at ? -1 : 1;
}

export default function TodoListPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Check authentication and load todos from the backend on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = tokenStorage.getToken();
    if (!token) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTodos = await getAllTodos();
        setTodos(fetchedTodos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load todos");
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes("401")) {
          tokenStorage.clear();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [router]);

  const refreshTodos = async () => {
    try {
      const fetchedTodos = await getAllTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh todos");
    }
  };

  const handleAddTodo = () => {
    // The actual backend creation is handled in TodoForm
    // We'll refresh the list after a short delay
    setTimeout(refreshTodos, 300);
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos(todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleExportTodos = async () => {
    try {
      setError(null);
      setExporting(true);
      const result = await exportTodos();
      alert(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export todos");
    } finally {
      setExporting(false);
    }
  };

  const handleShowError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center px-4">
        <div className="animate-rise text-center">
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="dot-breathe h-1.5 w-1.5 rounded-full bg-ink" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="mt-6 font-display text-3xl text-ink-soft">Gathering your list…</p>
        </div>
      </main>
    );
  }

  // ---- Derived data (client-only after loading, so localStorage/Date are safe here) ----
  const today = todayKey();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (tokenStorage.getUser()?.full_name || "").trim().split(/\s+/)[0];

  const open = todos.filter(t => !t.completed);
  const doneCount = todos.length - open.length;
  const dueToday = open.filter(t => t.due_date === today).length;
  const overdueCount = open.filter(t => dueGroup(t.due_date, today) === "overdue").length;
  const upcomingCount = open.filter(t => !!t.due_date && t.due_date > today).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  const summary =
    todos.length === 0
      ? "Your list is empty — add the first thing on your mind."
      : open.length === 0
      ? `All ${todos.length} ${todos.length === 1 ? "task is" : "tasks are"} done. Nicely kept.`
      : [
          dueToday ? `${dueToday} due today` : "Nothing due today",
          overdueCount ? `${overdueCount} overdue` : null,
          `${open.length} open in total`,
        ].filter(Boolean).join(" · ") + ".";

  // Week strip: today + next 6 days, with open-task counts per day.
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i);
    const d = fromDayKey(key);
    return {
      key,
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.getDate(),
      count: open.filter(t => t.due_date === key).length,
    };
  });

  // Scope = selected day (if any); filter tabs then narrow by status.
  const scoped = selectedDay ? todos.filter(t => t.due_date === selectedDay) : todos;
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: scoped.length },
    { key: "open", label: "Open", count: scoped.filter(t => !t.completed).length },
    { key: "done", label: "Done", count: scoped.filter(t => t.completed).length },
  ];
  const visible = scoped
    .filter(t => (filter === "open" ? !t.completed : filter === "done" ? t.completed : true))
    .sort(compareTodos);

  const sections = selectedDay
    ? [{ key: "today" as Section, label: relativeDayLabel(selectedDay, today), items: visible }]
    : SECTION_ORDER.map(s => ({ ...s, items: visible.filter(t => sectionOf(t, today) === s.key) })).filter(s => s.items.length);

  const nextUp = [...open].sort(compareTodos)[0];

  const stats = [
    { label: "Due today", value: dueToday, hint: dueToday === 1 ? "task for today" : "tasks for today", tone: "" },
    { label: "Overdue", value: overdueCount, hint: overdueCount ? "need attention" : "all caught up", tone: overdueCount ? "text-clay" : "" },
    { label: "Upcoming", value: upcomingCount, hint: "planned ahead", tone: "" },
  ];

  const dayLabel = selectedDay ? relativeDayLabel(selectedDay, today) : "";
  const emptyTitle = selectedDay
    ? `Nothing planned for ${dayLabel === "Today" || dayLabel === "Tomorrow" ? dayLabel.toLowerCase() : dayLabel}.`
    : filter === "done"
    ? "Nothing finished yet."
    : filter === "open"
    ? "Nothing open."
    : "A clear page.";
  const emptyBody = selectedDay
    ? "Add a task above — it will be scheduled for this day."
    : filter === "done"
    ? "Tick a task off and it will show up here."
    : filter === "open"
    ? "Every task is done — enjoy the quiet."
    : "Add your first task above, or ask the assistant.";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-28 md:px-8 md:pt-32">
      {/* Header */}
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal>
            <Eyebrow>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl">
              {greeting}
              {firstName ? <>, <em className="text-sage">{firstName}.</em></> : "."}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-3 text-ink-soft">{summary}</p>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <PillButton variant="ghost" icon="download" onClick={handleExportTodos} loading={exporting} disabled={exporting}>
            Export list
          </PillButton>
        </Reveal>
      </header>

      {error && (
        <div className="mt-8">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* Stats strip */}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={100 + i * 60}>
            <Bezel coreClassName="px-5 py-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">{s.label}</span>
              <p className={`mt-2 font-display text-4xl leading-none tabular-nums ${s.tone}`}>{s.value}</p>
              <p className="mt-1.5 text-xs text-muted">{s.hint}</p>
            </Bezel>
          </Reveal>
        ))}
        <Reveal delay={280}>
          <Bezel tone="ink" coreClassName="px-5 py-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-paper/50">Progress</span>
            <p className="mt-2 font-display text-4xl leading-none tabular-nums">
              {progress}
              <span className="text-paper/40">%</span>
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper/10">
              <div
                className="h-full w-full origin-left rounded-full bg-sage-soft transition-transform duration-1000 ease-spring"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </Bezel>
        </Reveal>
      </div>

      {/* Week strip */}
      <Reveal delay={180} className="mt-6">
        <Bezel coreClassName="p-2">
          <div className="grid grid-cols-7 gap-1">
            {week.map((d) => {
              const active = selectedDay === d.key;
              const isToday = d.key === today;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(active ? null : d.key)}
                  aria-pressed={active}
                  aria-label={`${relativeDayLabel(d.key, today)}: ${d.count} open ${d.count === 1 ? "task" : "tasks"}`}
                  className={`flex flex-col items-center gap-1 rounded-[1.1rem] py-2.5 transition-all duration-500 ease-spring active:scale-[0.97] ${
                    active ? "bg-ink text-paper" : "hover:bg-ink/[0.05]"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-[0.16em] ${active ? "text-paper/60" : isToday ? "text-sage" : "text-muted"}`}>
                    {isToday ? "Today" : d.weekday}
                  </span>
                  <span className="font-display text-xl leading-none tabular-nums">{d.day}</span>
                  <span className="flex h-1.5 items-center gap-0.5">
                    {Array.from({ length: Math.min(d.count, 3) }).map((_, i) => (
                      <span key={i} className={`h-1 w-1 rounded-full ${active ? "bg-paper/70" : "bg-sage"}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Bezel>
      </Reveal>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Task list */}
        <section className="lg:col-span-8">
          <Reveal delay={220}>
            <Bezel coreClassName="p-3 sm:p-4">
              <TodoForm variant="inline" defaultDue={selectedDay} onAdd={handleAddTodo} onError={handleShowError} />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <div role="tablist" aria-label="Filter tasks" className="flex gap-1 rounded-full bg-ink/[0.04] p-1">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      role="tab"
                      aria-selected={filter === f.key}
                      onClick={() => setFilter(f.key)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-500 ease-spring ${
                        filter === f.key ? "bg-card text-ink shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_12px_-4px_rgba(0,0,0,0.6)]" : "text-muted hover:text-ink"
                      }`}
                    >
                      {f.label}
                      <span className="tabular-nums text-muted">{f.count}</span>
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-ink-soft ring-1 ring-ink/10 transition-all duration-500 ease-spring hover:text-ink hover:ring-ink/25"
                  >
                    <Icon name="close" className="w-3 h-3" />
                    Show all days
                  </button>
                )}
              </div>

              <div className="mt-2">
                {sections.length === 0 || sections.every(s => s.items.length === 0) ? (
                  <div className="flex flex-col items-center px-6 py-14 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft text-sage">
                      <Icon name="leaf" className="w-5 h-5" />
                    </span>
                    <p className="mt-4 font-display text-2xl">{emptyTitle}</p>
                    <p className="mt-1.5 max-w-xs text-sm text-muted">{emptyBody}</p>
                  </div>
                ) : (
                  sections.map((s) => (
                    <div key={s.key} className="mt-3 first:mt-1">
                      <div className="flex items-center gap-2 px-3 pb-1 pt-2 sm:px-4">
                        <span className={`text-[10px] font-medium uppercase tracking-[0.2em] ${s.key === "overdue" ? "text-clay" : "text-muted"}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] tabular-nums text-muted/70">{s.items.length}</span>
                        <span className="h-px flex-1 bg-ink/[0.06]" />
                      </div>
                      <ul className="space-y-0.5">
                        {s.items.map((todo, index) => (
                          <li key={todo.id} className="animate-rise" style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}>
                            <TodoItem
                              todo={todo}
                              onUpdate={handleUpdateTodo}
                              onDelete={handleDeleteTodo}
                              onError={handleShowError}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </Bezel>
          </Reveal>
        </section>

        {/* Side column */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:col-span-4">
          <Reveal delay={260}>
            <Bezel coreClassName="p-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Up next</span>
              {nextUp ? (
                <>
                  <p className="mt-3 text-lg font-medium leading-snug tracking-tight">{nextUp.title}</p>
                  {nextUp.description && <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{nextUp.description}</p>}
                  <p
                    className={`mt-3 flex items-center gap-1.5 text-xs ${
                      dueGroup(nextUp.due_date, today) === "overdue" ? "text-clay" : "text-muted"
                    }`}
                  >
                    <Icon name="clock" className="w-3 h-3" />
                    {nextUp.due_date
                      ? `${dueGroup(nextUp.due_date, today) === "overdue" ? "Overdue · " : "Due "}${relativeDayLabel(nextUp.due_date, today)}`
                      : "No date set"}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-lg font-medium tracking-tight">All clear</p>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {todos.length ? "Nothing open right now. Add something new when you’re ready." : "Your next task will appear here."}
                  </p>
                </>
              )}
            </Bezel>
          </Reveal>

          <Reveal delay={320}>
            <Bezel tone="ink" coreClassName="p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/10">
                  <Icon name="spark" />
                </span>
                <div>
                  <p className="font-medium tracking-tight">Ask the assistant</p>
                  <p className="text-xs text-paper/60">Add, schedule and finish tasks in plain words</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {ASSISTANT_PROMPTS.map((p) => (
                  <li key={p} className="rounded-2xl bg-paper/[0.06] px-3.5 py-2.5 text-sm text-paper/80">
                    {p}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setChatOpen(true)}
                className="group mt-5 flex w-full items-center justify-between rounded-full bg-sage py-1.5 pl-5 pr-1.5 text-sm font-medium text-on-accent transition-all duration-500 ease-spring active:scale-[0.98]"
              >
                Open chat
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-on-accent/10 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <Icon name="chat" className="w-4 h-4" strokeWidth={1.5} />
                </span>
              </button>
            </Bezel>
          </Reveal>
        </aside>
      </div>

      <ChatBot
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        onTodoUpdate={refreshTodos}
      />
    </main>
  );
}
