import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const bgColor = `bg-${color}-50`;
  const textColor = `text-${color}-600`;
  const iconBgColor = `bg-${color}-100`;
  const iconTextColor = `text-${color}-600`;

  return (
    <div className={`p-6 rounded-lg shadow-sm border border-gray-200 ${bgColor}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <span className="flex items-center text-green-600 text-sm">
                  <TrendingUp size={16} className="mr-1" />
                  +{change}%
                </span>
              ) : (
                <span className="flex items-center text-red-600 text-sm">
                  <TrendingDown size={16} className="mr-1" />
                  {change}%
                </span>
              )}
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;