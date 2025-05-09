import React, { useState, useEffect } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import ExpenseList from '../components/expense/ExpenseList';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { PlusCircle, DollarSign, CreditCard, Calendar, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { expenses, isLoading, getTotalSpent, getCategoryTotals, getMonthlyExpenses } = useExpenses();
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    const fetchMonthlyData = async () => {
      // Current month data
      const thisMonthData = await getMonthlyExpenses(currentYear, currentMonth);
      const thisMonthTotal = getTotalSpent(thisMonthData);
      setMonthlyTotal(thisMonthTotal);
      setCategoryData(getCategoryTotals(thisMonthData));
      
      // Previous month data for comparison
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const lastMonthData = await getMonthlyExpenses(lastMonthYear, lastMonth);
      const lastMonthTotal = getTotalSpent(lastMonthData);
      setPreviousMonthTotal(lastMonthTotal);
      
      // Calculate percentage change
      if (lastMonthTotal > 0) {
        const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
        setMonthlyChange(parseFloat(change.toFixed(1)));
      }
    };

    if (user) {
      fetchMonthlyData();
    }
  }, [user, expenses]);

  // Calculate daily average
  const getDailyAverage = () => {
    if (monthlyTotal === 0) return 0;
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const passedDays = Math.min(today.getDate(), daysInCurrentMonth);
    return monthlyTotal / passedDays;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.email?.split('@')[0]}! Here's your expense overview.
            </p>
          </div>
          
          <Link
            to="/add-expense"
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Expense
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="This Month"
            value={`$${monthlyTotal.toFixed(2)}`}
            change={monthlyChange}
            icon={<DollarSign size={24} />}
            color="blue"
          />
          
          <StatCard
            title="Daily Average"
            value={`$${getDailyAverage().toFixed(2)}`}
            icon={<Calendar size={24} />}
            color="green"
          />
          
          <StatCard
            title="Last Expense"
            value={expenses.length > 0 ? `$${expenses[0].amount.toFixed(2)}` : '$0.00'}
            icon={<CreditCard size={24} />}
            color="purple"
          />
          
          <StatCard
            title="Biggest Category"
            value={Object.keys(categoryData).length > 0 
              ? Object.keys(categoryData).reduce((a, b) => categoryData[a] > categoryData[b] ? a : b) 
              : 'None'}
            icon={<TrendingDown size={24} />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
            <div className="h-80">
              {Object.keys(categoryData).length > 0 ? (
                <ExpensePieChart data={categoryData} title="Spending by Category" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this month
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Expenses */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Expenses</h2>
              <span className="text-sm text-gray-500">
                {format(today, 'MMMM yyyy')}
              </span>
            </div>
            <ExpenseList expenses={expenses.slice(0, 5)} title="" />
            
            {expenses.length > 5 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/monthly-report" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all expenses →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;