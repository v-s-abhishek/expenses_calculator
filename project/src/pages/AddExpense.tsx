import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../contexts/ExpenseContext';
import Header from '../components/layout/Header';
import { useForm } from 'react-hook-form';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { format } from 'date-fns';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

type FormData = {
  date: string;
  category: string;
  amount: number;
  description: string;
};

const AddExpense = () => {
  const { addExpense, isLoading } = useExpenses();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Food',
      amount: 0,
      description: '',
    }
  });
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      await addExpense({
        date: data.date,
        category: data.category,
        amount: parseFloat(data.amount.toString()),
        description: data.description,
      });

      if (saveAndAddAnother) {
        // Reset form but keep the date and category
        reset({
          date: data.date,
          category: data.category,
          amount: 0,
          description: '',
        });
        toast.success('Expense added! You can add another one.');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-sm text-gray-600">
            Track your spending by adding a new expense
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.date ? 'border-red-300' : ''
                  }`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.category ? 'border-red-300' : ''
                  }`}
                  {...register('category', { required: 'Category is required' })}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.amount ? 'border-red-300' : ''
                  }`}
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: {
                      value: 0.01,
                      message: 'Amount must be greater than 0',
                    },
                    validate: (value) => value > 0 || 'Amount must be greater than 0',
                  })}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="E.g., Grocery shopping at Walmart"
                  {...register('description', { 
                    required: 'Description is required',
                    maxLength: {
                      value: 100,
                      message: 'Description cannot exceed 100 characters',
                    },
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <input
                  id="saveAndAddAnother"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={saveAndAddAnother}
                  onChange={() => setSaveAndAddAnother(!saveAndAddAnother)}
                />
                <label htmlFor="saveAndAddAnother" className="ml-2 block text-sm text-gray-700">
                  Save and add another expense
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save size={16} className="mr-2" />
                      Save Expense
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;