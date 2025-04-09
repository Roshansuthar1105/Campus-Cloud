import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiDownload, FiUpload, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'College Quiz System',
    siteDescription: 'A comprehensive quiz management system for educational institutions',
    academicYear: '2023-2024',
    currentSemester: 'Fall',
    maintenanceMode: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@example.com',
    smtpPassword: '********',
    fromEmail: 'no-reply@example.com',
    fromName: 'College Quiz System',
    enableEmailNotifications: true
  });
  
  const [quizSettings, setQuizSettings] = useState({
    defaultQuizDuration: 60,
    allowQuizRetakes: false,
    maxRetakeAttempts: 1,
    showCorrectAnswersAfterSubmission: false,
    defaultGradeReleaseDelay: 24,
    enableAutoGrading: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch settings from the API
        // const response = await api.get('/settings');
        // setGeneralSettings(response.data.general);
        // setEmailSettings(response.data.email);
        // setQuizSettings(response.data.quiz);
        
        // For now, we'll just use the default values
        
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQuizSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizSettings({
      ...quizSettings,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value)
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, you would save settings to the API
      // await api.put('/settings', {
      //   general: generalSettings,
      //   email: emailSettings,
      //   quiz: quizSettings
      // });
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    alert('Data export functionality would be implemented here.');
  };

  const handleImportData = () => {
    // In a real app, this would open a file picker for data import
    alert('Data import functionality would be implemented here.');
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear the system cache? This may temporarily affect performance.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would call the API to clear the cache
      // await api.post('/settings/clear-cache');
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Cache cleared successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error clearing cache:', err);
      setError('Failed to clear cache. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  rows={3}
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    id="academicYear"
                    value={generalSettings.academicYear}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="currentSemester" className="block text-sm font-medium text-gray-700">
                    Current Semester
                  </label>
                  <select
                    id="currentSemester"
                    name="currentSemester"
                    value={generalSettings.currentSemester}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenanceMode"
                    name="maintenanceMode"
                    type="checkbox"
                    checked={generalSettings.maintenanceMode}
                    onChange={handleGeneralSettingsChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                    Maintenance Mode
                  </label>
                  <p className="text-gray-500">Put the system in maintenance mode. Only administrators will be able to access the system.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700">
                  SMTP Server
                </label>
                <input
                  type="text"
                  name="smtpServer"
                  id="smtpServer"
                  value={emailSettings.smtpServer}
                  onChange={handleEmailSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    name="smtpPort"
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    name="smtpUsername"
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    name="smtpPassword"
                    id="smtpPassword"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                    From Email
                  </label>
                  <input
                    type="email"
                    name="fromEmail"
                    id="fromEmail"
                    value={emailSettings.fromEmail}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
                  From Name
                </label>
                <input
                  type="text"
                  name="fromName"
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={handleEmailSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="enableEmailNotifications"
                    name="enableEmailNotifications"
                    type="checkbox"
                    checked={emailSettings.enableEmailNotifications}
                    onChange={handleEmailSettingsChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="enableEmailNotifications" className="font-medium text-gray-700">
                    Enable Email Notifications
                  </label>
                  <p className="text-gray-500">Send email notifications for important events like quiz availability and grades.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quiz Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="defaultQuizDuration" className="block text-sm font-medium text-gray-700">
                  Default Quiz Duration (minutes)
                </label>
                <input
                  type="number"
                  name="defaultQuizDuration"
                  id="defaultQuizDuration"
                  min="1"
                  value={quizSettings.defaultQuizDuration}
                  onChange={handleQuizSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allowQuizRetakes"
                    name="allowQuizRetakes"
                    type="checkbox"
                    checked={quizSettings.allowQuizRetakes}
                    onChange={handleQuizSettingsChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allowQuizRetakes" className="font-medium text-gray-700">
                    Allow Quiz Retakes
                  </label>
                  <p className="text-gray-500">Allow students to retake quizzes they've already completed.</p>
                </div>
              </div>
              
              {quizSettings.allowQuizRetakes && (
                <div>
                  <label htmlFor="maxRetakeAttempts" className="block text-sm font-medium text-gray-700">
                    Maximum Retake Attempts
                  </label>
                  <input
                    type="number"
                    name="maxRetakeAttempts"
                    id="maxRetakeAttempts"
                    min="1"
                    value={quizSettings.maxRetakeAttempts}
                    onChange={handleQuizSettingsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showCorrectAnswersAfterSubmission"
                    name="showCorrectAnswersAfterSubmission"
                    type="checkbox"
                    checked={quizSettings.showCorrectAnswersAfterSubmission}
                    onChange={handleQuizSettingsChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="showCorrectAnswersAfterSubmission" className="font-medium text-gray-700">
                    Show Correct Answers After Submission
                  </label>
                  <p className="text-gray-500">Show students the correct answers immediately after they submit a quiz.</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="defaultGradeReleaseDelay" className="block text-sm font-medium text-gray-700">
                  Default Grade Release Delay (hours)
                </label>
                <input
                  type="number"
                  name="defaultGradeReleaseDelay"
                  id="defaultGradeReleaseDelay"
                  min="0"
                  value={quizSettings.defaultGradeReleaseDelay}
                  onChange={handleQuizSettingsChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">Set to 0 for immediate release.</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="enableAutoGrading"
                    name="enableAutoGrading"
                    type="checkbox"
                    checked={quizSettings.enableAutoGrading}
                    onChange={handleQuizSettingsChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="enableAutoGrading" className="font-medium text-gray-700">
                    Enable Auto-Grading
                  </label>
                  <p className="text-gray-500">Automatically grade objective questions (multiple choice, true/false).</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Maintenance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Maintenance</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Data Management</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiDownload className="mr-2 -ml-1 h-5 w-5" />
                    Export Data
                  </button>
                  <button
                    type="button"
                    onClick={handleImportData}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                    Import Data
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Cache Management</h3>
                <p className="mt-1 text-sm text-gray-500">Clear system cache to resolve performance issues.</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiRefreshCw className="mr-2 -ml-1 h-5 w-5" />
                    Clear Cache
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-red-700">Danger Zone</h3>
                <p className="mt-1 text-sm text-gray-500">These actions cannot be undone.</p>
                <div className="mt-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiTrash2 className="mr-2 -ml-1 h-5 w-5" />
                    Reset System
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {saving ? 'Saving...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
