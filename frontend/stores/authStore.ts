import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  currency_symbol: string;
  daily_budget?: number;
  monthly_budget?: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync('auth_token', access_token);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  register: async (name: string, email: string, password: string, currency = 'INR') => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        currency,
        currency_symbol: currency === 'INR' ? '₹' : '$',
      });
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync('auth_token', access_token);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      await SecureStore.deleteItemAsync('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', data);
      set({ user: response.data });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Profile update failed');
    }
  },
}));