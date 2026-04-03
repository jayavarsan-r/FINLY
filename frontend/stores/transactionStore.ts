import { create } from 'zustand';
import api from '../lib/api';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  notes?: string;
  date: string;
  mood?: 'great' | 'good' | 'neutral' | 'sad' | 'stressed';
  created_at: string;
  updated_at: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  filter: {
    type?: 'income' | 'expense';
    category?: string;
    search?: string;
  };
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (filter: any) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  filter: {},

  fetchTransactions: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/transactions');
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    try {
      const response = await api.post('/transactions', data);
      set((state) => ({
        transactions: [response.data, ...state.transactions],
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to add transaction');
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const response = await api.put(`/transactions/${id}`, data);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? response.data : t
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update transaction');
    }
  },

  deleteTransaction: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete transaction');
    }
  },

  setFilter: (filter) => {
    set({ filter });
  },
}));