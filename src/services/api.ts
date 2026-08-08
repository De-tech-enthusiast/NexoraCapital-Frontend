// ============================================
// NEXORA CAPITAL - API Service
// ============================================

import { mockBackend } from './mockBackend';

const CONFIGURED_API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
const API_URL = CONFIGURED_API_URL || 'http://localhost:5000/api';

// When no real backend URL is configured, use the in-browser backend.
// Set VITE_API_URL to your deployed Node/Express server to switch over.
const USE_MOCK = !CONFIGURED_API_URL;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      response.status,
      data
    );
  }
  
  return data;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

async function request<T>(method: string, endpoint: string, body?: any): Promise<ApiResponse<T>> {
  if (USE_MOCK) {
    try {
      return (await mockBackend.handle(method, endpoint, body)) as ApiResponse<T>;
    } catch (err: any) {
      throw new ApiError(err.message || 'Request failed', err.status || 500);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export const api = {
  get: <T>(endpoint: string) => request<T>('GET', endpoint),
  post: <T>(endpoint: string, body?: any) => request<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body?: any) => request<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string) => request<T>('DELETE', endpoint),
};

// Auth API
export const authApi = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post('/auth/login', { email, password, rememberMe }),
  
  register: (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    country: string;
  }) => api.post('/auth/register', data),
  
  getMe: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

// User API
export const userApi = {
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    country?: string;
    preferredCurrency?: string;
  }) => api.put('/users/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/password', { currentPassword, newPassword }),
  
  getLoginHistory: () => api.get('/users/login-history'),
  
  getSessions: () => api.get('/users/sessions'),
};

// Portfolio API
export const portfolioApi = {
  getDashboard: () => api.get('/portfolio/dashboard'),
  
  getPortfolio: () => api.get('/portfolio'),
  
  getPerformance: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return api.get(`/portfolio/performance?${params.toString()}`);
  },
  
  getGoal: () => api.get('/portfolio/goal'),
  
  createGoal: (data: { name: string; targetAmount: number; duration: number }) =>
    api.post('/portfolio/goal', data),
};

// Deposit API
export const depositApi = {
  getWallets: () => api.get('/deposits/wallets'),
  
  createDeposit: (data: {
    currency: string;
    network: string;
    amount: number;
    txHash?: string;
  }) => api.post('/deposits', data),
  
  getDeposits: () => api.get('/deposits'),
  
  getDeposit: (id: string) => api.get(`/deposits/${id}`),
};

// Withdrawal API
export const withdrawalApi = {
  checkEligibility: () => api.get('/withdrawals/eligibility'),
  
  createWithdrawal: (data: {
    amount: number;
    currency: string;
    network: string;
    destinationAddress: string;
  }) => api.post('/withdrawals', data),
  
  getWithdrawals: () => api.get('/withdrawals'),
  
  getWithdrawal: (id: string) => api.get(`/withdrawals/${id}`),
};

// Transaction API
export const transactionApi = {
  getTransactions: (params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    return api.get(`/transactions?${searchParams.toString()}`);
  },
  
  getTransaction: (id: string) => api.get(`/transactions/${id}`),
  
  getStats: () => api.get('/transactions/stats/summary'),
};

// Notification API
export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread', 'true');
    return api.get(`/notifications?${params.toString()}`);
  },
  
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  getActivities: () => api.get('/notifications/activities'),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),

  getUsers: (params?: { search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    return api.get(`/admin/users?${searchParams.toString()}`);
  },

  getUser: (id: string | number) => api.get(`/admin/users/${id}`),

  updateBalance: (
    id: string | number,
    data: { amount: number; type: 'add' | 'subtract' | 'set'; reason: string }
  ) => api.put(`/admin/users/${id}/balance`, data),

  getPendingDeposits: () => api.get('/admin/deposits/pending'),

  approveDeposit: (id: string | number) => api.put(`/admin/deposits/${id}/approve`),

  rejectDeposit: (id: string | number, reason: string) =>
    api.put(`/admin/deposits/${id}/reject`, { reason }),

  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),

  approveWithdrawal: (id: string | number) =>
    api.put(`/admin/withdrawals/${id}/approve`),

  rejectWithdrawal: (id: string | number, reason: string) =>
    api.put(`/admin/withdrawals/${id}/reject`, { reason }),

  sendNotification: (data: {
    userId: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }) => api.post('/admin/notifications', data),

  getLogs: (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    return api.get(`/admin/logs?${searchParams.toString()}`);
  },
};
