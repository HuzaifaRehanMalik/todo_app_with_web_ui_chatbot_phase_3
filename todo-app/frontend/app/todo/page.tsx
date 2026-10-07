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

export default function TodoListPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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

  const doneCount = todos.filter(t => t.completed).length;
  const openCount = todos.length - doneCount;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

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

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-32 md:px-8 md:pt-40">
      {/* Header */}
      <header className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Reveal>
            <Eyebrow>{today}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em]">
              Your day,
              <br />
              <em className="text-sage">in order.</em>
            </h1>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <PillButton variant="ghost" icon="download" onClick={handleExportTodos} loading={exporting} disabled={exporting}>
            Export list
          </PillButton>
        </Reveal>
      </header>

      {error && (
        <div className="mt-10">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* Bento */}
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
        <aside className="space-y-6 md:sticky md:top-28 md:col-span-5 lg:col-span-4">
          <Reveal delay={120}>
            <Bezel tone="ink" coreClassName="p-7">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-paper/50">Progress</span>
                <span className="text-xs text-paper/50">{progress}%</span>
              </div>
              <p className="mt-8 font-display text-7xl leading-none tracking-tight">
                {doneCount}
                <span className="text-paper/30">/{todos.length}</span>
              </p>
              <p className="mt-3 text-sm text-paper/60">
                {todos.length === 0
                  ? "Nothing yet — a blank page."
                  : openCount === 0
                  ? "Everything's done. Well kept."
                  : `${openCount} still open${doneCount ? `, ${doneCount} finished` : ""}.`}
              </p>
              <div className="mt-6 h-1 overflow-hidden rounded-full bg-paper/10">
                <div
                  className="h-full w-full origin-left rounded-full bg-sage-soft transition-transform duration-1000 ease-spring"
                  style={{ transform: `scaleX(${progress / 100})` }}
                />
              </div>
            </Bezel>
          </Reveal>
          <Reveal delay={200}>
            <TodoForm onAdd={handleAddTodo} onError={handleShowError} />
          </Reveal>
        </aside>

        <section className="md:col-span-7 lg:col-span-8">
          <Reveal delay={160}>
            <Bezel coreClassName="p-3 sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 pt-2 sm:px-4">
                <h2 className="text-sm font-medium text-ink-soft">All tasks</h2>
                <span className="rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-xs tabular-nums text-ink-soft">
                  {todos.length}
                </span>
              </div>

              {todos.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-24 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-sage">
                    <Icon name="leaf" className="w-6 h-6" />
                  </span>
                  <p className="mt-6 font-display text-3xl">A clear page.</p>
                  <p className="mt-2 max-w-xs text-sm text-muted">
                    Add your first task, or ask the assistant in the corner.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {todos.map((todo, index) => (
                    <li key={todo.id} className="animate-rise" style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}>
                      <TodoItem
                        todo={todo}
                        onUpdate={handleUpdateTodo}
                        onDelete={handleDeleteTodo}
                        onError={handleShowError}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Bezel>
          </Reveal>
        </section>
      </div>

      <ChatBot onTodoUpdate={refreshTodos} />
    </main>
  );
}
