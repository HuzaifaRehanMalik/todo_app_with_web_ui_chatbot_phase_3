"use client";

import { UserLogin, UserCreate, AuthResponse, UserPublic } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Failed to connect to the server. Please make sure the backend is running at ${API_BASE_URL}`
      );
    }
    // Re-throw other errors
    throw error;
  }
}

// Sign in (login) user
export async function signIn(credentials: UserLogin): Promise<AuthResponse> {
  return apiCall<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// Sign up (register) user
export async function signUp(userData: UserCreate): Promise<UserPublic> {
  return apiCall<UserPublic>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Token management utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
  
  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", token);
  },
  
  removeToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
  },
  
  getUser: (): UserPublic | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: UserPublic): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  },
  
  removeUser: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
  },
  
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};
