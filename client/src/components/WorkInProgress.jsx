import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiClock, FiTool } from 'react-icons/fi';

const WorkInProgress = ({
  displayTitle = "This Page is Under Construction",
  message = "We're working hard to bring you this feature. Please check back soon!",
  showBackButton = true,
  estimatedCompletion = null,
  featureDescription = null,
  contactEmail = null,
  contactPerson = null,
  additionalInfo = null
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the back URL based on the current path
  const getBackUrl = () => {
    const pathParts = location.pathname.split('/');

    // If we're in a deeply nested route, go back one level
    if (pathParts.length > 2) {
      return '/' + pathParts.slice(0, pathParts.length - 1).join('/');
    }

    // Otherwise, go to the dashboard based on role
    if (location.pathname.startsWith('/student')) {
      return '/student/dashboard';
    } else if (location.pathname.startsWith('/faculty')) {
      return '/faculty/dashboard';
    } else if (location.pathname.startsWith('/management')) {
      return '/management/dashboard';
    } else {
      return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
              <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{displayTitle}</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>

            {featureDescription && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiTool className="mr-2" />
                  Feature Details
                </h3>
                <p className="mt-2 text-sm text-gray-600">{featureDescription}</p>
              </div>
            )}

            {estimatedCompletion && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <FiClock className="mr-2" />
                <span>Estimated completion: {estimatedCompletion}</span>
              </div>
            )}

            {(contactEmail || contactPerson) && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Need assistance?</h3>
                {contactPerson && (
                  <p className="mt-2 text-sm text-gray-600">Contact: {contactPerson}</p>
                )}
                {contactEmail && (
                  <p className="mt-2 text-sm text-gray-600">
                    <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:text-blue-500">
                      {contactEmail}
                    </a>
                  </p>
                )}
              </div>
            )}

            {additionalInfo && (
              <div className="mt-6 text-sm text-gray-600">
                <p>{additionalInfo}</p>
              </div>
            )}

            {showBackButton && (
              <div className="mt-6">
                <Link
                  to={"/home"}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                  Go Back
                </Link>
                {/* <button
                  onClick={() => navigate(getBackUrl())}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                  Go Back
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Construction animation */}
      <div className="mt-12 flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-t-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-r-4 border-transparent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgress;
