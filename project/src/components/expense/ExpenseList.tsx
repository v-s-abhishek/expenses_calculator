import React from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import ExpenseItem from './ExpenseItem';
import { Expense } from '../../lib/supabase';
import { FileX } from 'lucide-react';

interface ExpenseListProps {
  expenses?: Expense[];
  title?: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, title = "Recent Expenses" }) => {
  const { expenses: contextExpenses, isLoading } = useExpenses();
  
  const expensesToDisplay = expenses || contextExpenses;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (expensesToDisplay.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center">
          <FileX size={48} className="text-gray-400" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No expenses found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start tracking your expenses by adding a new expense.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {expensesToDisplay.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;