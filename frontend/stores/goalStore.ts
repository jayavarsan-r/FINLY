import { create } from 'zustand';
import api from '../lib/api';

export interface Goal {
  id: string;
  user_id: string;
  emoji: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (data: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/goals');
      set({ goals: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    try {
      const response = await api.post('/goals', data);
      set((state) => ({
        goals: [...state.goals, response.data],
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to add goal');
    }
  },

  updateGoal: async (id, data) => {
    try {
      const response = await api.put(`/goals/${id}`, data);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? response.data : g)),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update goal');
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete goal');
    }
  },
}));