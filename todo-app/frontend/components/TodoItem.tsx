"use client";

import { useState } from "react";
import { Todo } from "@/types/todo";
import { updateTodo, deleteTodo } from "@/services/todoService";
import { Field, Icon, PillButton, TextArea, type IconName } from "@/components/ui";
import DuePicker from "@/components/DuePicker";
import { dueGroup, relativeDayLabel } from "@/lib/dates";

interface TodoItemProps {
  todo: Todo;
  onUpdate: (updatedTodo: Todo) => void;
  onDelete: (id: number) => void;
  onError: (error: string) => void;
}

export default function TodoItem({ todo, onUpdate, onDelete, onError }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [editDue, setEditDue] = useState<string | null>(todo.due_date ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const updatedTodo = await updateTodo(todo.id, {
        title: editTitle,
        description: editDescription || undefined,
        due_date: editDue,
      });
      onUpdate(updatedTodo);
      setIsEditing(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      // Use updateTodo to explicitly toggle the completed status
      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed,
      });
      onUpdate(updatedTodo);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTodo(todo.id);
      onDelete(todo.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete todo");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="animate-rise space-y-4 rounded-[1.5rem] bg-paper/60 p-4 ring-1 ring-ink/[0.06] sm:p-5">
        <Field
          aria-label="Title"
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <TextArea
          aria-label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Due</span>
          <DuePicker value={editDue} onChange={setEditDue} disabled={isLoading} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditTitle(todo.title);
              setEditDescription(todo.description || "");
              setEditDue(todo.due_date ?? null);
            }}
            disabled={isLoading}
            className="rounded-full px-5 py-3 text-sm text-ink-soft transition-all duration-500 ease-spring hover:bg-ink/[0.05] hover:text-ink active:scale-[0.98]"
          >
            Cancel
          </button>
          <PillButton
            onClick={handleSaveEdit}
            icon="check"
            loading={isLoading}
            disabled={isLoading || !editTitle.trim()}
          >
            {isLoading ? "Saving…" : "Save changes"}
          </PillButton>
        </div>
      </div>
    );
  }

  const edited = new Date(todo.updated_at).getTime() !== new Date(todo.created_at).getTime();
  const overdue = !todo.completed && dueGroup(todo.due_date) === "overdue";

  return (
    <div
      className={`group flex items-start gap-4 rounded-[1.5rem] px-3 py-4 transition-all duration-500 ease-spring sm:px-4 ${
        todo.completed ? "" : "hover:bg-paper/70"
      }`}
    >
      {/* Toggle */}
      <button
        onClick={handleToggleComplete}
        disabled={isLoading}
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-spring active:scale-90 ${
          todo.completed
            ? "bg-sage text-paper"
            : "text-transparent ring-1 ring-ink/20 hover:text-ink/30 hover:ring-ink/40"
        }`}
      >
        {isLoading ? (
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent text-ink/40" />
        ) : (
          <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2} />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3
          className={`text-[15px] leading-snug transition-colors duration-500 ease-spring ${
            todo.completed ? "text-muted line-through decoration-ink/25" : "text-ink"
          }`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p className={`mt-1 text-sm leading-relaxed ${todo.completed ? "text-muted/70" : "text-ink-soft"}`}>
            {todo.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {todo.due_date ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-px ${
                overdue ? "bg-clay-soft text-clay" : todo.completed ? "" : "bg-ink/[0.05] text-ink-soft"
              }`}
            >
              <Icon name="clock" className="w-3 h-3" />
              {overdue ? `Overdue · ${relativeDayLabel(todo.due_date)}` : relativeDayLabel(todo.due_date)}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Icon name="clock" className="w-3 h-3" />
              Added {new Date(todo.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
          {edited && <span className="italic">edited</span>}
          {todo.completed && (
            <span className="rounded-full bg-sage-soft px-2 py-px text-[10px] uppercase tracking-[0.14em] text-sage">Done</span>
          )}
        </div>
      </div>

      {/* Actions — always visible on touch, revealed on hover for pointer devices */}
      <div className="flex items-center gap-1 transition-opacity duration-500 ease-spring md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <RowAction
          icon={todo.completed ? "undo" : "check"}
          label={todo.completed ? "Reopen" : "Complete"}
          onClick={handleToggleComplete}
          disabled={isLoading}
        />
        <RowAction
          icon="pencil"
          label="Edit"
          onClick={() => {
            // Start from the latest values (the assistant may have changed them since mount).
            setEditTitle(todo.title);
            setEditDescription(todo.description || "");
            setEditDue(todo.due_date ?? null);
            setIsEditing(true);
          }}
          disabled={isLoading}
        />
        <RowAction icon="trash" label="Delete" onClick={handleDelete} disabled={isLoading} danger />
      </div>
    </div>
  );
}

function RowAction({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all duration-500 ease-spring active:scale-90 disabled:opacity-40 ${
        danger ? "hover:bg-clay-soft hover:text-clay" : "hover:bg-ink/[0.06] hover:text-ink"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}
