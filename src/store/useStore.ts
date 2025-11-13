// Global State Management with Zustand
import { create } from 'zustand';
import { Transaction, Budget, Alert, User } from '../types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;
  deleteAlert: (id: string) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  currentUserId: null,
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  // Budgets
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) =>
    set((state) => ({
      budgets: [...state.budgets, budget],
    })),
  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
  deleteBudget: (id) =>
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    })),

  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),
  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
    })),
  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
