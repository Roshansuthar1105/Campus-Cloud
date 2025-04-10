import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiBook,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell
} from 'react-icons/fi';
import notificationAPI from '../../services/notificationApi';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAPI.getNotifications();
        const unreadNotifications = response.data.data.filter(notification => !notification.read);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();

    // Set up interval to check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-blue-700' : '';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-blue-800 text-white">
          <div className="flex items-center justify-center h-16 bg-blue-900">
            <span className="text-xl font-bold">Student Portal</span>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/student/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/dashboard')}`}
              >
                <FiHome className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/student/courses"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/courses')}`}
              >
                <FiBook className="mr-3 h-5 w-5" />
                My Courses
              </Link>
              <Link
                to="/student/quizzes"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/quizzes')}`}
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Quizzes
              </Link>
              <Link
                to="/student/preference-forms"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/preference-forms')}`}
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Preference Forms
              </Link>
              <Link
                to="/student/profile"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/profile')}`}
              >
                <FiUser className="mr-3 h-5 w-5" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed inset-0 z-40 flex bg-black bg-opacity-50" style={{ display: isMenuOpen ? 'flex' : 'none' }}>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800 text-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeMenu}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-center h-16 bg-blue-900">
            <span className="text-xl font-bold">Student Portal</span>
          </div>
          <div className="flex-1 h-0 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              <Link
                to="/student/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/dashboard')}`}
                onClick={closeMenu}
              >
                <FiHome className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/student/courses"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/courses')}`}
                onClick={closeMenu}
              >
                <FiBook className="mr-3 h-5 w-5" />
                My Courses
              </Link>
              <Link
                to="/student/quizzes"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/quizzes')}`}
                onClick={closeMenu}
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Quizzes
              </Link>
              <Link
                to="/student/preference-forms"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/preference-forms')}`}
                onClick={closeMenu}
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Preference Forms
              </Link>
              <Link
                to="/student/profile"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 ${isActive('/student/profile')}`}
                onClick={closeMenu}
              >
                <FiUser className="mr-3 h-5 w-5" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center md:hidden">
                  <button
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
                    onClick={toggleMenu}
                  >
                    <FiMenu className="h-6 w-6" />
                  </button>
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {user?.name || 'Student'}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/student/notifications"
                  className="p-2 text-gray-700 hover:text-blue-600 relative"
                >
                  <FiBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-700 md:hidden">
                        {user?.name || 'Student'}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
