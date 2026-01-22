"use client";

import { useState } from "react";
import { Todo } from "@/types/todo";
import { updateTodo, completeTodo, deleteTodo } from "@/services/todoService";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const updatedTodo = await updateTodo(todo.id, {
        title: editTitle,
        description: editDescription || undefined,
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

  const handleMarkComplete = async () => {
    if (todo.completed) return;
    setIsLoading(true);
    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: true,
      });
      onUpdate(updatedTodo);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to mark todo as complete");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkIncomplete = async () => {
    if (!todo.completed) return;
    setIsLoading(true);
    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: false,
      });
      onUpdate(updatedTodo);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to mark todo as incomplete");
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

  return (
    <div className={`group relative border-2 rounded-xl p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 ${
      todo.completed 
        ? 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10' 
        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
    }`}>
      {isEditing ? (
        <div className="space-y-4 animate-fade-in">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={isLoading || !editTitle.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(todo.title);
                setEditDescription(todo.description || "");
              }}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 active:scale-95 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="mt-1">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                todo.completed
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-blue-500'
              }`}>
                {todo.completed && (
                  <svg className="absolute inset-0 w-full h-full text-white p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold mb-1 transition-all ${
              todo.completed 
                ? "line-through text-gray-400 dark:text-gray-500" 
                : "text-gray-900 dark:text-white"
            }`}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`text-sm mb-3 transition-all ${
                todo.completed 
                  ? "line-through text-gray-400 dark:text-gray-500" 
                  : "text-gray-600 dark:text-gray-300"
              }`}>
                {todo.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(todo.created_at).toLocaleDateString()}</span>
              </div>
              {new Date(todo.updated_at).getTime() !== new Date(todo.created_at).getTime() && (
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Updated</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Complete/Incomplete Button - Always Visible */}
            {todo.completed ? (
              <button
                onClick={handleMarkIncomplete}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                title="Mark as Incomplete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Incomplete</span>
              </button>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                title="Mark as Complete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Complete</span>
              </button>
            )}

            {/* Edit and Delete Buttons - Show on Hover */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Delete"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}