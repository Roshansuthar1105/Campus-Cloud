import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiBell, FiLock, FiMail, FiUser, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../services/api';

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [settings, setSettings] = useState({
    receiveLoginNotifications: true,
    receiveEmailUpdates: true
  });
  
  useEffect(() => {
    // Load user settings
    const loadSettings = async () => {
      try {
        const response = await api.get('/api/users/settings');
        if (response.data && response.data.success) {
          setSettings(response.data.settings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        // Use default settings if we can't load from server
      }
    };
    
    loadSettings();
  }, []);
  
  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const saveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put('/api/users/settings', settings);
      if (response.data && response.data.success) {
        setSuccess('Settings saved successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <FiSettings className="text-2xl text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium flex items-center">
              <FiUser className="mr-2 text-indigo-600" />
              Account Information
            </h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name || 'Not available'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || 'Not available'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.role || 'Not available'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{user?.department || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">{user?.isGoogleAccount ? 'Google Account' : 'Email & Password'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">
                  {user?.lastLogin 
                    ? format(new Date(user.lastLogin), 'PPpp') 
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium flex items-center">
              <FiBell className="mr-2 text-indigo-600" />
              Notification Settings
            </h2>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Notifications</p>
                  <p className="text-sm text-gray-500">Receive email notifications when your account is accessed</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="receiveLoginNotifications" 
                    id="receiveLoginNotifications"
                    checked={settings.receiveLoginNotifications}
                    onChange={() => handleToggle('receiveLoginNotifications')}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="receiveLoginNotifications" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      settings.receiveLoginNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Updates</p>
                  <p className="text-sm text-gray-500">Receive important updates about your account and the platform</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="receiveEmailUpdates" 
                    id="receiveEmailUpdates"
                    checked={settings.receiveEmailUpdates}
                    onChange={() => handleToggle('receiveEmailUpdates')}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="receiveEmailUpdates" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      settings.receiveEmailUpdates ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-medium flex items-center">
              <FiInfo className="mr-2 text-indigo-600" />
              Security Information
            </h2>
            
            <div className="mt-4 space-y-4">
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> We will never ask for your password via email. Always make sure you're on the correct website before entering your credentials.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-500">
                    {user?.isGoogleAccount && !user?.password 
                      ? 'No password set (using Google Sign-In)' 
                      : '••••••••'}
                  </p>
                </div>
                <a 
                  href="/forgot-password" 
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Reset Password
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
