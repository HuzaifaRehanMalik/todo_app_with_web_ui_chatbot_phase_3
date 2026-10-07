"use client";

import { useState } from "react";
import { TodoCreate } from "@/types/todo";
import { createTodo } from "@/services/todoService";
import { Bezel, Field, Icon, PillButton, TextArea } from "@/components/ui";
import DuePicker from "@/components/DuePicker";
import { relativeDayLabel } from "@/lib/dates";

interface TodoFormProps {
  onAdd: (todo: TodoCreate) => void;
  onError: (error: string) => void;
  /** "card": standalone bezel card. "inline": compact quick-add bar for the top of a list. */
  variant?: "card" | "inline";
  /** Due date new tasks start with (e.g. the day selected in the week strip) until the user picks one. */
  defaultDue?: string | null;
}

export default function TodoForm({ onAdd, onError, variant = "card", defaultDue = null }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showDue, setShowDue] = useState(false);
  // undefined = follow defaultDue; null = explicitly "no date"
  const [chosenDue, setChosenDue] = useState<string | null | undefined>(undefined);
  const due = chosenDue === undefined ? defaultDue : chosenDue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onError("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      const newTodo: TodoCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: due,
      };

      await createTodo(newTodo);
      onAdd(newTodo);

      // Reset form
      setTitle("");
      setDescription("");
      setShowNote(false);
      setShowDue(false);
      setChosenDue(undefined);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-paper/60 p-2 ring-1 ring-ink/[0.06]">
        <div className="flex items-center gap-2">
          <span className="pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-muted">
            <Icon name="plus" />
          </span>
          <input
            type="text"
            aria-label="New task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task and press Enter…"
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            aria-label="Add task"
            className="group flex h-9 shrink-0 items-center gap-2 rounded-full bg-ink pl-4 pr-1 text-sm font-medium text-paper transition-all duration-500 ease-spring active:scale-[0.97] disabled:opacity-30"
          >
            {isLoading ? "Adding…" : "Add"}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper/10 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
              {isLoading ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                <Icon name="arrow" className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
            </span>
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 pl-11">
          <button
            type="button"
            onClick={() => setShowDue(!showDue)}
            aria-expanded={showDue}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-500 ease-spring ${
              due ? "bg-sage-soft text-sage" : showDue ? "bg-ink/[0.08] text-ink" : "text-muted hover:bg-ink/[0.05] hover:text-ink"
            }`}
          >
            <Icon name="clock" className="w-3.5 h-3.5" />
            {due ? relativeDayLabel(due) : "Set date"}
          </button>
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            aria-expanded={showNote}
            className={`rounded-full px-3 py-1.5 text-xs transition-all duration-500 ease-spring ${
              showNote ? "bg-ink/[0.08] text-ink" : "text-muted hover:bg-ink/[0.05] hover:text-ink"
            }`}
          >
            {showNote ? "Hide note" : "Add note"}
          </button>
        </div>
        {showDue && (
          <div className="animate-rise pb-1 pl-11 pt-2">
            <DuePicker value={due} onChange={setChosenDue} disabled={isLoading} />
          </div>
        )}
        {showNote && (
          <div className="animate-rise px-1 pb-1 pt-2 sm:pl-11">
            <TextArea
              aria-label="Note"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A note, if it helps (optional)"
              rows={2}
              disabled={isLoading}
            />
          </div>
        )}
      </form>
    );
  }

  return (
    <Bezel coreClassName="p-6 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">New task</span>
          <h2 className="mt-2 font-display text-3xl leading-none tracking-tight">Add to the list</h2>
        </div>

        <Field
          id="todo-title"
          aria-label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          disabled={isLoading}
        />

        <TextArea
          id="todo-description"
          aria-label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A note, if it helps (optional)"
          rows={3}
          disabled={isLoading}
        />

        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Due</span>
          <DuePicker value={due} onChange={setChosenDue} disabled={isLoading} />
        </div>

        <PillButton
          type="submit"
          icon="plus"
          disabled={isLoading || !title.trim()}
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? "Adding…" : "Add task"}
        </PillButton>
      </form>
    </Bezel>
  );
}
