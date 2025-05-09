import React, { useState, useEffect } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import Header from '../components/layout/Header';
import ExpenseList from '../components/expense/ExpenseList';
import ExpenseBarChart from '../components/charts/ExpenseBarChart';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { Expense } from '../lib/supabase';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const MonthlyReport = () => {
  const { getMonthlyExpenses, getTotalSpent, getCategoryTotals } = useExpenses();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  // Month names for dropdown
  const months = [
    { number: 1, name: 'January' },
    { number: 2, name: 'February' },
    { number: 3, name: 'March' },
    { number: 4, name: 'April' },
    { number: 5, name: 'May' },
    { number: 6, name: 'June' },
    { number: 7, name: 'July' },
    { number: 8, name: 'August' },
    { number: 9, name: 'September' },
    { number: 10, name: 'October' },
    { number: 11, name: 'November' },
    { number: 12, name: 'December' },
  ];

  // Years for dropdown (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchQuery, selectedCategory]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyExpenses(selectedYear, selectedMonth);
      setExpenses(data);
      setTotalSpent(getTotalSpent(data));
      setCategoryTotals(getCategoryTotals(data));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
          <p className="text-sm text-gray-600">
            Detailed breakdown of your expenses for the selected month
          </p>
        </div>

        {/* Month selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  {months.map((month) => (
                    <option key={month.number} value={month.number}>
                      {month.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                disabled={selectedYear === currentYear && selectedMonth === (new Date().getMonth() + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center font-semibold text-2xl text-blue-700">
              ${totalSpent.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
              <div className="h-80">
                {Object.keys(categoryTotals).length > 0 ? (
                  <ExpenseBarChart 
                    data={categoryTotals} 
                    title={`${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}`} 
                    horizontal={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available for this month
                  </div>
                )}
              </div>
            </div>

            {/* Filter and search */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <div className="relative flex-1 mb-4 md:mb-0">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter size={18} className="text-gray-500 mr-2" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="All">All Categories</option>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedCategory === 'All' 
                  ? 'Monthly Expenses' 
                  : `${selectedCategory} Expenses`}
                {searchQuery && ` - Search: "${searchQuery}"`}
              </h2>
              <ExpenseList 
                expenses={filteredExpenses} 
                title="" 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonthlyReport;