const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiError {
  detail: string | { msg: string }[];
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      const message = typeof error.detail === 'string' 
        ? error.detail 
        : error.detail?.[0]?.msg || 'An error occurred';
      throw new Error(message);
    }
    
    // Handle empty responses (204 No Content or empty body)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType?.includes('application/json')) {
      return {} as T;
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If unauthorized, try to refresh token
      if (response.status === 401 && this.refreshToken && endpoint !== '/api/v1/auth/refresh') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        } else {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, monthlyIncome?: number, fixedExpenses?: number) {
    const userData = await this.request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name,
        monthly_income: monthlyIncome,
        fixed_expenses: fixedExpenses,
      }),
    });
    
    // After registration, log the user in
    return await this.login(email, password);
  }

  async login(email: string, password: string) {
    // OAuth2 expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', email);  // OAuth2 uses 'username' field
    formData.append('password', password);
    
    const url = `${this.baseUrl}/api/v1/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await this.handleResponse<{ access_token: string; refresh_token: string; token_type: string }>(response);
    this.setTokens(data.access_token, data.refresh_token);
    
    // After login, fetch user data
    const user = await this.getCurrentUser();
    return { ...data, user };
  }

  async logout() {
    this.clearTokens();
  }

  async getCurrentUser() {
    return this.request<any>('/api/v1/auth/me');
  }

  async updateCurrentUser(data: { name?: string; monthly_income?: number; fixed_expenses?: number }) {
    return this.request<any>('/api/v1/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getTransactions(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request<any[]>(`/api/v1/transactions${params}`);
  }

  async createTransaction(transaction: any) {
    return this.request<any>('/api/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async getTodayTransactions() {
    return this.request<any>('/api/v1/transactions/today');
  }

  // Goals endpoints
  async getGoals() {
    return this.request<any[]>('/api/v1/goals');
  }

  async createGoal(goal: any) {
    return this.request<any>('/api/v1/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async updateGoal(id: string, goal: any) {
    return this.request<any>(`/api/v1/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  async deleteGoal(id: string) {
    return this.request<void>(`/api/v1/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Wishlist endpoints
  async getWishlist() {
    return this.request<any[]>('/api/v1/wishlist');
  }

  async createWishlistItem(item: any) {
    return this.request<any>('/api/v1/wishlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateWishlistItem(id: string, item: any) {
    return this.request<any>(`/api/v1/wishlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  // Budget endpoints
  async getBudget() {
    return this.request<any>('/api/v1/budget');
  }

  async getBudgetHistory() {
    return this.request<any>('/api/v1/budget/history');
  }

  // Reflections endpoints
  async getReflections() {
    return this.request<any[]>('/api/v1/reflections');
  }

  async createReflection(reflection: any) {
    return this.request<any>('/api/v1/reflections', {
      method: 'POST',
      body: JSON.stringify(reflection),
    });
  }

  async checkReflectionStatus() {
    return this.request<{ has_reflected_today: boolean }>('/api/v1/reflections/status');
  }

  // Income endpoints
  income = {
    getAll: (params?: { start_date?: string; end_date?: string; source?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.start_date) searchParams.append('start_date', params.start_date);
      if (params?.end_date) searchParams.append('end_date', params.end_date);
      if (params?.source) searchParams.append('source', params.source);
      const query = searchParams.toString();
      return this.request<{ incomes: any[]; total: number; total_amount: number }>(
        `/api/v1/income${query ? `?${query}` : ''}`
      );
    },
    getSummary: () => {
      return this.request<{
        total_this_month: number;
        total_this_year: number;
        by_source: Record<string, number>;
        recent_incomes: any[];
      }>('/api/v1/income/summary');
    },
    getSources: () => {
      return this.request<string[]>('/api/v1/income/sources');
    },
    create: (income: { amount: number; source: string; description?: string | null; date: string }) => {
      return this.request<any>('/api/v1/income', {
        method: 'POST',
        body: JSON.stringify(income),
      });
    },
    update: (id: string, income: Partial<{ amount: number; source: string; description: string; date: string }>) => {
      return this.request<any>(`/api/v1/income/${id}`, {
        method: 'PUT',
        body: JSON.stringify(income),
      });
    },
    delete: (id: string) => {
      return this.request<void>(`/api/v1/income/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload endpoint
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/v1/upload/image`;
    const headers: HeadersInit = {};
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      const message = typeof error.detail === 'string' 
        ? error.detail 
        : error.detail?.[0]?.msg || 'Upload failed';
      throw new Error(message);
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);
