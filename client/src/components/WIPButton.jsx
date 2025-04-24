import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createWIPHandler } from '../utils/wipRedirect';

/**
 * A button component that redirects to the appropriate work-in-progress page
 * @param {Object} props - Component props
 * @param {string} props.label - Button label
 * @param {string} props.featureName - Name of the feature (for URL parameters)
 * @param {string} props.estimatedCompletion - Estimated completion date (for URL parameters)
 * @param {boolean} props.useCommonPage - Whether to use the common work-in-progress page
 * @param {string} props.className - Additional CSS classes for the button
 * @param {Object} props.buttonProps - Additional props to pass to the button element
 */
const WIPButton = ({ 
  label = "Feature Coming Soon", 
  featureName,
  estimatedCompletion,
  useCommonPage = false,
  className = "",
  ...buttonProps
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = createWIPHandler(navigate, user?.role, {
    featureName,
    estimatedCompletion,
    useCommonPage
  });
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      {...buttonProps}
    >
      {label}
    </button>
  );
};

/**
 * A link component that redirects to the appropriate work-in-progress page
 * @param {Object} props - Component props
 * @param {string} props.label - Link text
 * @param {string} props.featureName - Name of the feature (for URL parameters)
 * @param {string} props.estimatedCompletion - Estimated completion date (for URL parameters)
 * @param {boolean} props.useCommonPage - Whether to use the common work-in-progress page
 * @param {string} props.className - Additional CSS classes for the link
 * @param {Object} props.linkProps - Additional props to pass to the a element
 */
export const WIPLink = ({ 
  label = "Feature Coming Soon", 
  featureName,
  estimatedCompletion,
  useCommonPage = false,
  className = "",
  ...linkProps
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = createWIPHandler(navigate, user?.role, {
    featureName,
    estimatedCompletion,
    useCommonPage
  });
  
  return (
    <a
      href="#"
      onClick={handleClick}
      className={`text-indigo-600 hover:text-indigo-900 ${className}`}
      {...linkProps}
    >
      {label}
    </a>
  );
};

export default WIPButton;
