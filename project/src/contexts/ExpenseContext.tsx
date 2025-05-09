import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Expense } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type ExpenseContextType = {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  getMonthlyExpenses: (year: number, month: number) => Promise<Expense[]>;
  getYearlyExpenses: (year: number) => Promise<Expense[]>;
  getTotalSpent: (expenses: Expense[]) => number;
  getCategoryTotals: (expenses: Expense[]) => Record<string, number>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch expenses when user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setIsLoading(false);
    }
  }, [user]);

  async function fetchExpenses() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }

  async function addExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) {
    try {
      setIsLoading(true);
      setError(null);
      
      const newExpense = {
        ...expense,
        user_id: user?.id,
      };
      
      const { error } = await supabase
        .from('expenses')
        .insert([newExpense]);
      
      if (error) throw error;
      
      toast.success('Expense added successfully');
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteExpense(id: string) {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateExpense(id: string, expense: Partial<Expense>) {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setExpenses(expenses.map(e => e.id === id ? { ...e, ...expense } : e));
      toast.success('Expense updated');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  }

  async function getMonthlyExpenses(year: number, month: number) {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format dates for the start and end of the month
      const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
      const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load monthly expenses');
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  async function getYearlyExpenses(year: number) {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format dates for the start and end of the year
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load yearly expenses');
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  function getTotalSpent(expenses: Expense[]) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  function getCategoryTotals(expenses: Expense[]) {
    return expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  const value = {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    getMonthlyExpenses,
    getYearlyExpenses,
    getTotalSpent,
    getCategoryTotals,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}