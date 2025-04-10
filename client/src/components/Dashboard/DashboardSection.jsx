import React from 'react';

const DashboardSection = ({ title, children, actionText, actionLink, actionIcon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {actionText && actionLink && (
          <a 
            href={actionLink} 
            className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center"
          >
            {actionText}
            {actionIcon && <span className="ml-1">{actionIcon}</span>}
          </a>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardSection;
