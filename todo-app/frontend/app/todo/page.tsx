"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import ChatBot from "@/components/ChatBot";
import { Todo, TodoCreate } from "@/types/todo";
import { getAllTodos, exportTodos } from "@/services/todoService";
import { tokenStorage } from "@/services/authService";

export default function TodoListPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddTodo = (newTodo: TodoCreate) => {
    // Optimistically add the new todo to the UI
    // The actual backend creation is handled in TodoForm
    // We'll refresh the list after a short delay
    setTimeout(async () => {
      try {
        const fetchedTodos = await getAllTodos();
        setTodos(fetchedTodos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refresh todos");
      }
    }, 300);
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
      const result = await exportTodos();
      alert(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export todos");
    }
  };

  const handleShowError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-4 py-8 md:py-12">
      <main className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Your Todos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Stay organized and productive</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 md:p-8">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tasks Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {todos.length} {todos.length === 1 ? 'task' : 'tasks'} {todos.filter(t => t.completed).length > 0 && `• ${todos.filter(t => t.completed).length} completed`}
              </p>
            </div>
            <button
              onClick={handleExportTodos}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Todos
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-lg animate-slide-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Todo Form */}
          <div className="mb-8">
            <TodoForm onAdd={handleAddTodo} onError={handleShowError} />
          </div>

          {/* Todos List */}
          <div>
            {todos.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No todos yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Add a new todo above to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo, index) => (
                  <div key={todo.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                    <TodoItem
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                      onError={handleShowError}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <ChatBot />
      </main>
    </div>
  );
}