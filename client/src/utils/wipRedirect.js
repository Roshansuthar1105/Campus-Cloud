/**
 * Utility function to redirect to the appropriate work-in-progress page based on user role
 * @param {Object} navigate - The navigate function from useNavigate hook
 * @param {string} userRole - The user's role (student, faculty, management)
 * @param {Object} options - Additional options for the redirect
 * @param {string} options.featureName - Name of the feature (for URL parameters)
 * @param {string} options.estimatedCompletion - Estimated completion date (for URL parameters)
 * @param {boolean} options.useCommonPage - Whether to use the common work-in-progress page instead of role-specific
 * @returns {void}
 */
export const redirectToWIP = (navigate, userRole, options = {}) => {
  const { featureName, estimatedCompletion, useCommonPage } = options;
  
  // Build query parameters if provided
  const queryParams = new URLSearchParams();
  if (featureName) queryParams.append('feature', featureName);
  if (estimatedCompletion) queryParams.append('eta', estimatedCompletion);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Determine the appropriate URL based on role and options
  if (useCommonPage) {
    navigate(`/work-in-progress${queryString}`);
    return;
  }
  
  switch (userRole) {
    case 'student':
      navigate(`/student/work-in-progress${queryString}`);
      break;
    case 'faculty':
      navigate(`/faculty/work-in-progress${queryString}`);
      break;
    case 'management':
      navigate(`/management/work-in-progress${queryString}`);
      break;
    default:
      navigate(`/work-in-progress${queryString}`);
  }
};

/**
 * Creates a handler function that redirects to the work-in-progress page
 * @param {Object} navigate - The navigate function from useNavigate hook
 * @param {string} userRole - The user's role (student, faculty, management)
 * @param {Object} options - Additional options for the redirect
 * @returns {Function} A handler function that can be used in onClick events
 */
export const createWIPHandler = (navigate, userRole, options = {}) => {
  return (e) => {
    if (e) e.preventDefault();
    redirectToWIP(navigate, userRole, options);
  };
};

export default {
  redirectToWIP,
  createWIPHandler
};
