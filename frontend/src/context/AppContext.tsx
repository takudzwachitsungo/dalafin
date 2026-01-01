import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Date;
  isImpulse: boolean;
  note?: string;
}

export interface Reflection {
  id: string;
  date: Date;
  regretPurchase?: string;
  goodPurchase?: string;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  color: string;
  deadline?: Date;
}

export interface CategoryLimit {
  category: string;
  monthlyLimit: number;
  spent: number;
}

interface AppState {
  transactions: Transaction[];
  reflections: Reflection[];
  goals: Goal[];
  monthlyIncome: number;
  fixedExpenses: number;
  dailyLimit: number;
  streakDays: number;
  impulsesAvoided: number;
  rolloverBudget: number; // Accumulated unused budget (max 3 days worth)
  categoryLimits: CategoryLimit[];
}

interface AppContextType extends AppState {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addReflection: (reflection: Omit<Reflection, 'id' | 'date'>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  incrementImpulsesAvoided: () => void;
  getTodaySpent: () => number;
  getWeekSpent: () => number;
  hasReflectedToday: () => boolean;
  getAvailableToday: () => number; // Daily limit + rollover
  updateCategorySpent: (category: string, amount: number) => void;
  getCategoryRemaining: (category: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'finance-app-state';

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<AppState>({
    transactions: [],
    reflections: [],
    goals: [],
    monthlyIncome: user?.monthly_income || 0,
    fixedExpenses: user?.fixed_expenses || 0,
    dailyLimit: 0,
    streakDays: 0,
    impulsesAvoided: 0,
    rolloverBudget: 0,
    categoryLimits: []
  });
  const [loading, setLoading] = useState(true);

  // Load data from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadBackendData();
    }
  }, [isAuthenticated]);

  // Auto-refresh data every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      loadBackendData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Update user-related state when user changes
  useEffect(() => {
    if (user) {
      const disposableIncome = (user.monthly_income || 0) - (user.fixed_expenses || 0);
      const daysInMonth = 30;
      const calculatedDailyLimit = disposableIncome / daysInMonth;
      
      setState(prev => ({
        ...prev,
        monthlyIncome: user.monthly_income || 0,
        fixedExpenses: user.fixed_expenses || 0,
        dailyLimit: calculatedDailyLimit
      }));
    }
  }, [user]);

  const loadBackendData = async () => {
    try {
      setLoading(true);
      const [transactions, goals, reflections, budget] = await Promise.all([
        api.getTransactions().catch(() => []),
        api.getGoals().catch(() => []),
        api.getReflections().catch(() => []),
        api.getBudget().catch(() => null)
      ]);

      setState(prev => ({
        ...prev,
        transactions: Array.isArray(transactions) ? transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })) : [],
        goals: Array.isArray(goals) ? goals.map((g: any) => ({
          id: g.id,
          name: g.name,
          current: parseFloat(g.current_amount || 0),
          target: parseFloat(g.target_amount || 0),
          color: 'bg-blue-500',
          deadline: g.target_date ? new Date(g.target_date) : undefined
        })) : [],
        reflections: Array.isArray(reflections) ? reflections.map((r: any) => ({
          ...r,
          date: new Date(r.created_at)
        })) : [],
        rolloverBudget: budget?.rollover_amount || 0,
        streakDays: budget?.streak_days || 0,
        impulsesAvoided: budget?.impulses_avoided || 0,
        categoryLimits: Array.isArray(budget?.category_limits) ? budget.category_limits : []
      }));
    } catch (error) {
      console.error('Failed to load backend data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loading]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    try {
      const newTransaction = await api.createTransaction({
        amount: transaction.amount,
        category: transaction.category,
        is_impulse_buy: transaction.isImpulse,
        notes: transaction.note,
        date: new Date().toISOString().split('T')[0]
      });
      
      setState(prev => ({
        ...prev,
        transactions: [
          ...prev.transactions,
          {
            ...transaction,
            id: newTransaction.id,
            date: new Date(newTransaction.date)
          }
        ]
      }));
      
      // Reload budget to get updated rollover and streak
      const budget = await api.getBudget();
      setState(prev => ({
        ...prev,
        rolloverBudget: budget?.rollover_amount || 0,
        streakDays: budget?.streak_days || 0
      }));
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const addReflection = async (reflection: Omit<Reflection, 'id' | 'date'>) => {
    try {
      const newReflection = await api.createReflection({
        mood: reflection.mood,
        notes: reflection.notes,
        learned: reflection.learned,
        proud_of: reflection.proudOf
      });
      
      setState(prev => ({
        ...prev,
        reflections: [
          ...prev.reflections,
          {
            ...reflection,
            id: newReflection.id,
            date: new Date(newReflection.created_at)
          }
        ]
      }));
    } catch (error) {
      console.error('Failed to add reflection:', error);
      throw error;
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const newGoal = await api.createGoal({
        name: goal.name,
        target_amount: goal.target,
        current_amount: goal.current || 0,
        target_date: goal.deadline?.toISOString().split('T')[0]
      });
      
      setState(prev => ({
        ...prev,
        goals: [
          ...prev.goals,
          {
            id: newGoal.id,
            name: newGoal.name,
            current: parseFloat(newGoal.current_amount || 0),
            target: parseFloat(newGoal.target_amount || 0),
            color: goal.color || 'bg-blue-500',
            deadline: newGoal.target_date ? new Date(newGoal.target_date) : undefined
          }
        ]
      }));
    } catch (error) {
      console.error('Failed to add goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await api.updateGoal(id, {
        name: updates.name,
        target_amount: updates.target,
        current_amount: updates.current,
        target_date: updates.deadline?.toISOString().split('T')[0]
      });
      
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      }));
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  };

  const incrementImpulsesAvoided = () => {
    setState(prev => ({
      ...prev,
      impulsesAvoided: prev.impulsesAvoided + 1
    }));
  };

  const getTodaySpent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === today.getTime();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getWeekSpent = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return state.transactions
      .filter(t => new Date(t.date) >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const hasReflectedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.reflections.some(r => {
      const rDate = new Date(r.date);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === today.getTime();
    });
  };

  const getAvailableToday = () => {
    return state.dailyLimit + state.rolloverBudget;
  };

  const updateCategorySpent = (category: string, amount: number) => {
    setState(prev => ({
      ...prev,
      categoryLimits: prev.categoryLimits.map(cl =>
        cl.category === category
          ? { ...cl, spent: cl.spent + amount }
          : cl
      )
    }));
  };

  const getCategoryRemaining = (category: string) => {
    const categoryLimit = state.categoryLimits.find(cl => cl.category === category);
    if (!categoryLimit) return 0;
    return Math.max(0, categoryLimit.monthlyLimit - categoryLimit.spent);
  };

  // Update rollover budget at midnight
  useEffect(() => {
    const checkRollover = () => {
      const todaySpent = getTodaySpent();
      const unused = Math.max(0, state.dailyLimit - todaySpent);
      
      if (unused > 0) {
        setState(prev => ({
          ...prev,
          rolloverBudget: Math.min(
            prev.dailyLimit * 3, // Max 3 days worth
            prev.rolloverBudget + unused
          )
        }));
      }
    };

    // Check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(checkRollover, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [state.dailyLimit]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTransaction,
        addReflection,
        addGoal,
        updateGoal,
        incrementImpulsesAvoided,
        getTodaySpent,
        getWeekSpent,
        hasReflectedToday,
        getAvailableToday,
        updateCategorySpent,
        getCategoryRemaining
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
