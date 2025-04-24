import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WIPButton, { WIPLink } from '../components/WIPButton';
import { redirectToWIP } from '../utils/wipRedirect';

const ExampleWIPUsage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Example of programmatic redirect
  const handleProgrammaticRedirect = () => {
    redirectToWIP(navigate, user?.role, {
      featureName: 'Advanced Analytics',
      estimatedCompletion: 'Q4 2023'
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Work In Progress Examples</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Using WIP Components</h2>
          <p className="mt-1 text-sm text-gray-500">
            Examples of different ways to use the Work In Progress functionality
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">1. WIP Button Component</h3>
              <div className="space-y-3">
                <div>
                  <WIPButton label="Basic WIP Button" />
                </div>
                <div>
                  <WIPButton 
                    label="Feature-specific WIP Button" 
                    featureName="Calendar Integration"
                    estimatedCompletion="Next month" 
                  />
                </div>
                <div>
                  <WIPButton 
                    label="Common WIP Page" 
                    useCommonPage={true}
                    className="bg-purple-600 hover:bg-purple-700" 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">2. WIP Link Component</h3>
              <div className="space-y-3">
                <div>
                  <WIPLink label="Basic WIP Link" />
                </div>
                <div>
                  <WIPLink 
                    label="Feature-specific WIP Link" 
                    featureName="Document Collaboration"
                    estimatedCompletion="Q3 2023" 
                  />
                </div>
                <div>
                  <WIPLink 
                    label="Common WIP Page Link" 
                    useCommonPage={true}
                    className="text-purple-600 hover:text-purple-900" 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">3. Programmatic Redirect</h3>
              <button
                onClick={handleProgrammaticRedirect}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Programmatic Redirect to WIP
              </button>
              <p className="mt-2 text-sm text-gray-500">
                This demonstrates how to use the redirectToWIP utility function directly.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">4. Direct URL Navigation</h3>
              <div className="space-y-2">
                <div>
                  <a 
                    href="/work-in-progress" 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Common WIP Page
                  </a>
                </div>
                <div>
                  <a 
                    href="/coming-soon" 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Coming Soon Page
                  </a>
                </div>
                <div>
                  <a 
                    href={`/${user?.role || 'student'}/work-in-progress`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Role-specific WIP Page
                  </a>
                </div>
                <div>
                  <a 
                    href="/work-in-progress?feature=AI%20Grading&eta=Next%20semester" 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    WIP Page with URL Parameters
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ExampleWIPUsage;
