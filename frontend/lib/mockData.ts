// Mock data for development and demo purposes
import { Transaction } from '../stores/transactionStore';
import { Goal } from '../stores/goalStore';

const today = new Date();
const getDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockTransactions: Transaction[] = [
  // This month - Income
  {
    id: '1',
    user_id: 'demo',
    amount: 45000,
    type: 'income',
    category: 'Salary',
    notes: 'Monthly salary',
    date: getDate(25),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    amount: 5000,
    type: 'income',
    category: 'Freelance',
    notes: 'Website project',
    date: getDate(15),
    mood: 'great',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Recent expenses
  {
    id: '3',
    user_id: 'demo',
    amount: 850,
    type: 'expense',
    category: 'Food',
    notes: 'Groceries for the week',
    date: getDate(0),
    mood: 'neutral',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'demo',
    amount: 250,
    type: 'expense',
    category: 'Food',
    notes: 'Dinner with friends',
    date: getDate(1),
    mood: 'great',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'demo',
    amount: 120,
    type: 'expense',
    category: 'Transport',
    notes: 'Uber to office',
    date: getDate(1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    user_id: 'demo',
    amount: 1200,
    type: 'expense',
    category: 'Shopping',
    notes: 'New shoes',
    date: getDate(2),
    mood: 'good',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    user_id: 'demo',
    amount: 450,
    type: 'expense',
    category: 'Food',
    notes: 'Weekly groceries',
    date: getDate(3),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    user_id: 'demo',
    amount: 2500,
    type: 'expense',
    category: 'Bills',
    notes: 'Electricity + Internet',
    date: getDate(5),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    user_id: 'demo',
    amount: 800,
    type: 'expense',
    category: 'Entertainment',
    notes: 'Movie + Dinner',
    date: getDate(6),
    mood: 'great',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    user_id: 'demo',
    amount: 150,
    type: 'expense',
    category: 'Transport',
    notes: 'Metro recharge',
    date: getDate(7),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    user_id: 'demo',
    amount: 350,
    type: 'expense',
    category: 'Food',
    notes: 'Lunch meetings',
    date: getDate(8),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    user_id: 'demo',
    amount: 2000,
    type: 'expense',
    category: 'Health',
    notes: 'Gym membership',
    date: getDate(10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '13',
    user_id: 'demo',
    amount: 500,
    type: 'expense',
    category: 'Food',
    notes: 'Restaurant',
    date: getDate(12),
    mood: 'good',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '14',
    user_id: 'demo',
    amount: 180,
    type: 'expense',
    category: 'Transport',
    notes: 'Cab rides',
    date: getDate(14),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '15',
    user_id: 'demo',
    amount: 3500,
    type: 'expense',
    category: 'Shopping',
    notes: 'Clothes shopping',
    date: getDate(16),
    mood: 'great',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '16',
    user_id: 'demo',
    amount: 75,
    type: 'expense',
    category: 'Food',
    notes: 'Coffee',
    date: getDate(18),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '17',
    user_id: 'demo',
    amount: 1500,
    type: 'expense',
    category: 'Bills',
    notes: 'Phone bill',
    date: getDate(20),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '18',
    user_id: 'demo',
    amount: 650,
    type: 'expense',
    category: 'Food',
    notes: 'Groceries',
    date: getDate(22),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '19',
    user_id: 'demo',
    amount: 300,
    type: 'expense',
    category: 'Entertainment',
    notes: 'Concert tickets',
    date: getDate(24),
    mood: 'great',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20',
    user_id: 'demo',
    amount: 200,
    type: 'expense',
    category: 'Transport',
    notes: 'Fuel',
    date: getDate(26),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockGoals: Goal[] = [
  {
    id: 'g1',
    user_id: 'demo',
    emoji: '🏠',
    name: 'Emergency Fund',
    target_amount: 100000,
    saved_amount: 45000,
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g2',
    user_id: 'demo',
    emoji: '✈️',
    name: 'Europe Trip',
    target_amount: 150000,
    saved_amount: 32000,
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g3',
    user_id: 'demo',
    emoji: '💻',
    name: 'New Laptop',
    target_amount: 80000,
    saved_amount: 65000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date().toISOString(),
  },
];

export const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    Food: 'restaurant',
    Transport: 'car',
    Shopping: 'cart',
    Bills: 'receipt',
    Entertainment: 'musical-notes',
    Health: 'fitness',
    Education: 'book',
    Salary: 'wallet',
    Freelance: 'briefcase',
    Other: 'ellipsis-horizontal',
  };
  return icons[category] || 'ellipsis-horizontal';
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  }
};