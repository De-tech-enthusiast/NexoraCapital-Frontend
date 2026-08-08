// ============================================
// NEXORA CAPITAL - Authentication Store
// ============================================

import { create } from 'zustand';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { authApi } from '@/services/api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: localStorage.getItem('token'),

  // Actions
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login(
        credentials.email,
        credentials.password,
        credentials.rememberMe
      );
      
      const { user, token } = response.data as { user: User; token: string };
      
      // Store token
      localStorage.setItem('token', token);
      
      set({
        user,
        isAuthenticated: true,
        token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
      });
      
      const { user, token } = response.data as { user: User; token: string };
      
      // Store token
      localStorage.setItem('token', token);
      
      set({
        user,
        isAuthenticated: true,
        token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore error
    } finally {
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false,
        token: null,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, ...updates, updatedAt: new Date().toISOString() },
      });
    }
  },
  
  initAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await authApi.getMe();
      set({
        user: response.data as User,
        isAuthenticated: true,
        token,
      });
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('token');
      set({ token: null });
    }
  },
}));
