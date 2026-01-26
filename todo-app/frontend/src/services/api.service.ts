// src/services/api.service.ts

class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // ✅ Load existing token from localStorage (client-side)
    this.token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
  }

  // ✅ Call this after login to store token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  // ✅ Call this on logout or when token invalid
  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  private buildHeaders(extraHeaders?: HeadersInit): Headers {
    const headers = new Headers(extraHeaders || {});
    // If caller didn't set content-type, default to JSON
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // ✅ Attach Bearer token automatically
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    return headers;
  }

  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.buildHeaders(options.headers),
    });

    // ✅ If unauthorized, clear token and throw
    if (res.status === 401) {
      this.clearToken();
      throw new Error("Unauthorized. Please login again.");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API error (${res.status})`);
    }

    // Some endpoints may return empty responses
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return res.text();
    }

    return res.json();
  }

  // =========================
  // 🔐 AUTH
  // =========================

  async login(email: string, password: string) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Login failed");
    }

    const data = await res.json();
    // ✅ backend returns access_token
    this.setToken(data.access_token);

    return data;
  }

  logout() {
    this.clearToken();
  }

  // =========================
  // ✅ TODOS
  // =========================

  getTodos(skip = 0, limit = 100) {
    return this.request(`/api/v1/todos/?skip=${skip}&limit=${limit}`, {
      method: "GET",
    });
  }

  createTodo(payload: any) {
    return this.request(`/api/v1/todos/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  updateTodo(todoId: number, payload: any) {
    return this.request(`/api/v1/todos/${todoId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteTodo(todoId: number) {
    return this.request(`/api/v1/todos/${todoId}`, {
      method: "DELETE",
    });
  }

  // =========================
  // 💬 CHAT
  // =========================

  chat(message: string) {
    return this.request(`/api/v1/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}

export default new ApiService();
