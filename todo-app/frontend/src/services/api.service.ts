/**
 * API Service
 * Handles authenticated requests to the backend API
 */

class ApiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    this.token = null;
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
  }

  // Remove authentication token
  removeAuthToken() {
    this.token = null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // For successful responses, return the JSON data
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request error to ${url}:`, error);
      throw error;
    }
  }

  // Chat API methods
  async sendChatMessage(message, conversationContext = null) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationContext
      })
    });
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Todo methods
  async getTodos() {
    return this.request('/api/todos');
  }

  async createTodo(todoData) {
    return this.request('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todoData)
    });
  }

  async updateTodo(id, todoData) {
    return this.request(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData)
    });
  }

  async deleteTodo(id) {
    return this.request(`/api/todos/${id}`, {
      method: 'DELETE'
    });
  }

  async toggleTodoComplete(id, completed) {
    return this.request(`/api/todos/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    });
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;