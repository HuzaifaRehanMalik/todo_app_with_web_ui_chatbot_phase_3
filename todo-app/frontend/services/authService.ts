"use client";

import { UserLogin, UserCreate, AuthResponse, UserPublic, ChangePasswordRequest } from "@/types/user";

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

// Ask for a password reset email. The backend answers the same way whether or not the email exists.
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Set a new password using the one-time token from the reset email
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

// Change the signed-in user's password (requires the current password)
export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  return apiCall<{ message: string }>("/auth/change-password", {
    method: "POST",
    // apiCall's own headers are replaced when options.headers is set, so include Content-Type here.
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenStorage.getToken() ?? ""}`,
    },
    body: JSON.stringify(data),
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
