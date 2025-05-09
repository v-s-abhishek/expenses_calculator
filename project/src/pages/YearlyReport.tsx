import React, { useState, useEffect } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import Header from '../components/layout/Header';
import ExpenseLineChart from '../components/charts/ExpenseLineChart';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Expense } from '../lib/supabase';

const YearlyReport = () => {
  const { getYearlyExpenses, getTotalSpent, getCategoryTotals } = useExpenses();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, number>>({});
  const [totalSpent, setTotalSpent] = useState(0);

  // Years for dropdown (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchYearlyData();
  }, [selectedYear]);

  const fetchYearlyData = async () => {
    setLoading(true);
    try {
      const data = await getYearlyExpenses(selectedYear);
      setExpenses(data);
      setTotalSpent(getTotalSpent(data));
      setCategoryTotals(getCategoryTotals(data));
      
      // Calculate monthly totals
      const monthlyData: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const monthName = format(new Date(selectedYear, i), 'MMM');
        monthlyData[monthName] = 0;
      }
      
      data.forEach(expense => {
        const date = new Date(expense.date);
        const month = format(date, 'MMM');
        monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
      });
      
      setMonthlyTotals(monthlyData);
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(selectedYear + 1);
    }
  };

  const downloadCSVReport = () => {
    // Create CSV content
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map(expense => [
      expense.date,
      expense.category,
      expense.description,
      expense.amount.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yearly Report</h1>
            <p className="text-sm text-gray-600">
              Annual overview of your expenses
            </p>
          </div>
          
          <button
            onClick={downloadCSVReport}
            className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <Download size={16} className="mr-2" />
            Download Report
          </button>
        </div>

        {/* Year selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousYear}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              
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
              
              <button
                onClick={handleNextYear}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                disabled={selectedYear === currentYear}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center font-semibold text-2xl text-blue-700">
              ${totalSpent.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-100">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-blue-700">${totalSpent.toFixed(2)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-100">
            <h3 className="text-sm font-medium text-gray-500">Monthly Average</h3>
            <p className="text-2xl font-bold text-green-700">
              ${(totalSpent / (Object.keys(monthlyTotals).filter(month => monthlyTotals[month] > 0).length || 1)).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-100">
            <h3 className="text-sm font-medium text-gray-500">Top Category</h3>
            <p className="text-2xl font-bold text-purple-700">
              {Object.keys(categoryTotals).length > 0 
                ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b) 
                : 'None'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly spending over the year */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Monthly Spending ({selectedYear})</h2>
            <div className="h-80">
              {Object.keys(monthlyTotals).length > 0 ? (
                <ExpenseLineChart 
                  data={monthlyTotals} 
                  title={`Monthly Expenses (${selectedYear})`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this year
                </div>
              )}
            </div>
          </div>
          
          {/* Category breakdown */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Category Breakdown ({selectedYear})</h2>
            <div className="h-80">
              {Object.keys(categoryTotals).length > 0 ? (
                <ExpensePieChart 
                  data={categoryTotals} 
                  title={`Expenses by Category (${selectedYear})`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this year
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly breakdown table */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Annual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(monthlyTotals).map(([month, total]) => {
                  const monthNumber = new Date(Date.parse(`${month} 1, ${selectedYear}`)).getMonth();
                  const monthTransactions = expenses.filter(
                    e => new Date(e.date).getMonth() === monthNumber
                  ).length;
                  const percentOfAnnual = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                  
                  return (
                    <tr key={month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{percentOfAnnual.toFixed(1)}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${percentOfAnnual}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {monthTransactions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YearlyReport;