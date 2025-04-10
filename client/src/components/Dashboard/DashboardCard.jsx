import React from 'react';

const DashboardCard = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
    teal: 'bg-teal-100 text-teal-600'
  };

  const bgColor = colorClasses[color] || 'bg-gray-100 text-gray-600';

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${onClick ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
