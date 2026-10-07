"use client";

import { useState } from "react";
import { TodoCreate } from "@/types/todo";
import { createTodo } from "@/services/todoService";
import { Bezel, Field, PillButton, TextArea } from "@/components/ui";

interface TodoFormProps {
  onAdd: (todo: TodoCreate) => void;
  onError: (error: string) => void;
}

export default function TodoForm({ onAdd, onError }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      };

      await createTodo(newTodo);
      onAdd(newTodo);

      // Reset form
      setTitle("");
      setDescription("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  };

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
