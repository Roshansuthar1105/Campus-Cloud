import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const DashboardWelcome = ({ user, role, stats }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleText = () => {
    switch (role) {
      case 'student':
        return 'Here\'s an overview of your academic activities';
      case 'faculty':
        return 'Here\'s an overview of your teaching activities';
      case 'management':
        return 'Here\'s an overview of your administrative activities';
      default:
        return 'Welcome to Campus Cloud';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="px-6 py-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="text-purple-100 mb-6">
          {getRoleText()}
        </p>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-100">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <Link 
            to={`/${role}/profile`} 
            className="inline-flex items-center text-white bg-purple-700 bg-opacity-50 hover:bg-opacity-70 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
          >
            View Profile <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcome;
