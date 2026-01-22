"use client";

import { Todo, TodoCreate, TodoUpdate } from "@/types/todo";
import { tokenStorage } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get the auth token from storage
    const token = tokenStorage.getToken();

    // ✅ FIX: use Record<string, string> instead of HeadersInit
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `API call failed: ${response.status} ${response.statusText}`
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Failed to connect to the server. Please make sure the backend is running at ${API_BASE_URL}`
      );
    }
    throw error;
  }
}

/* =========================
   TODO APIs
========================= */

// Create a new todo
export async function createTodo(todo: TodoCreate): Promise<Todo> {
  return apiCall<Todo>("/todos/", {
    method: "POST",
    body: JSON.stringify(todo),
  });
}

// Get all todos
export async function getAllTodos(
  skip: number = 0,
  limit: number = 100
): Promise<Todo[]> {
  return apiCall<Todo[]>(`/todos/?skip=${skip}&limit=${limit}`);
}

// Get a specific todo by ID
export async function getTodoById(id: number): Promise<Todo> {
  return apiCall<Todo>(`/todos/${id}`);
}

// Update a todo
export async function updateTodo(
  id: number,
  todo: TodoUpdate
): Promise<Todo> {
  return apiCall<Todo>(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todo),
  });
}

// Mark a todo as completed
export async function completeTodo(id: number): Promise<Todo> {
  return apiCall<Todo>(`/todos/${id}/complete`, {
    method: "PATCH",
  });
}

// Delete a todo
export async function deleteTodo(id: number): Promise<void> {
  await apiCall<void>(`/todos/${id}`, {
    method: "DELETE",
  });
}

// Export todos to text file
export async function exportTodos(): Promise<{
  message: string;
  file_path: string;
  exported_count: number;
}> {
  return apiCall<{
    message: string;
    file_path: string;
    exported_count: number;
  }>(`/export/todos`);
}
