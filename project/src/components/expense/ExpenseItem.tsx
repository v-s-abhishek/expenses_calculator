import React, { useState } from 'react';
import { format } from 'date-fns';
import { Expense } from '../../lib/supabase';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface ExpenseItemProps {
  expense: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { deleteExpense, updateExpense } = useExpenses();
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState(expense);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expense.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedExpense(expense);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedExpense({
      ...editedExpense,
      [name]: name === 'amount' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateExpense(expense.id, editedExpense);
    setIsEditing(false);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Food': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Housing': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-yellow-100 text-yellow-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Utilities': 'bg-indigo-100 text-indigo-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-cyan-100 text-cyan-800',
      'Travel': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={editedExpense.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={editedExpense.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={editedExpense.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={editedExpense.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors duration-150"
          >
            <X size={16} className="mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-150"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-gray-600 text-sm">
              {format(new Date(expense.date), 'MMM dd, yyyy')}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
          </div>
          <p className="text-lg font-semibold">{expense.description}</p>
        </div>
        
        <div className="flex items-center mt-2 md:mt-0">
          <span className="text-lg font-bold text-gray-800 mr-4">
            ${expense.amount.toFixed(2)}
          </span>
          
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
              aria-label="Edit expense"
            >
              <Edit size={18} />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
              aria-label="Delete expense"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;