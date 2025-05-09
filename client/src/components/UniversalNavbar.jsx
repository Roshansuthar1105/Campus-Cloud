import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// We're using inline notification items now
import {
  FiHome,
  FiBook,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiCheck,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';
import notificationAPI from '../services/notificationApi';

const UniversalNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now()); // Add timestamp for forcing re-renders
  const notificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleNotifications = () => {
    // Simple direct toggle without any delays or conditions
    setIsNotificationsOpen(prev => !prev);
  };

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let notificationsData = [];

      try {
        const response = await notificationAPI.getNotifications();
        if (response.data && response.data.data) {
          notificationsData = response.data.data;
        }
      } catch (apiError) {
        console.error('API Error fetching notifications:', apiError);
        // For development, use mock data
        notificationsData = [
          {
            _id: '1',
            title: 'New Quiz Available',
            message: 'A new quiz has been published in Web Development course.',
            type: 'quiz',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Quiz Graded',
            message: 'Your Database Systems midterm quiz has been graded.',
            type: 'grade',
            read: false,
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            _id: '3',
            title: 'Course Announcement',
            message: 'Important information about the upcoming final project.',
            type: 'announcement',
            read: true,
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          }
        ];
      }

      setNotifications(notificationsData);
      // Count unread notifications
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when component mounts and when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();

      // Set up interval to check for new notifications
      const intervalId = setInterval(async () => {
        try {
          // Store the current count before fetching
          const prevCount = unreadCount;

          // Fetch new notifications
          const response = await notificationAPI.getNotifications();
          const newNotifications = response.data.data || [];
          setNotifications(newNotifications);

          // Calculate new unread count
          const newUnreadCount = newNotifications.filter(notification => !notification.read).length;
          setUnreadCount(newUnreadCount);

          // If there are new notifications, show the popup
          if (newUnreadCount > prevCount && newNotifications.length > 0) {
            const latestNotification = newNotifications[0];
            setNewNotification(latestNotification);
            setShowNotificationPopup(true);

            // Auto-hide the popup after 5 seconds
            setTimeout(() => {
              setShowNotificationPopup(false);
            }, 5000);
          }
        } catch (error) {
          console.error('Error checking for new notifications:', error);
        }
      }, 60000); // Check every minute

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if notification is open and click is outside both desktop and mobile notification refs
      if (isNotificationsOpen &&
          ((notificationRef.current && !notificationRef.current.contains(event.target)) ||
           (mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target)))) {
        setIsNotificationsOpen(false);
      }
    };

    // Add both mouse and touch event listeners for mobile compatibility
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Close profile menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if profile menu is open and click is outside both desktop and mobile profile refs
      if (isProfileMenuOpen &&
          ((profileMenuRef.current && !profileMenuRef.current.contains(event.target)) ||
           (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(event.target)))) {
        setIsProfileMenuOpen(false);
      }
    };

    // Add both mouse and touch event listeners for mobile compatibility
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Function to mark a notification as read
  const markAsRead = async (id) => {
    console.log('markAsRead called with id:', id);

    try {
      // Call API first to ensure it works
      console.log('Calling API to mark notification as read...');
      const response = await notificationAPI.markAsRead(id);
      console.log('API response for marking as read:', response);

      // If API call succeeds, update local state
      console.log('Updating local state...');
      setNotifications(prevNotifications => {
        console.log('Previous notifications:', prevNotifications);
        const updated = prevNotifications.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        );
        console.log('Updated notifications:', updated);
        return updated;
      });

      // Update unread count
      setUnreadCount(prevCount => {
        const newCount = Math.max(0, prevCount - 1);
        console.log(`Unread count updated: ${prevCount} -> ${newCount}`);
        return newCount;
      });

      // Force a re-render by updating a timestamp
      setLastUpdated(new Date().getTime());

      console.log('Notification marked as read successfully');
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    console.log('markAllAsRead called');

    try {
      // Call API first to ensure it works
      console.log('Calling API to mark all notifications as read...');
      const response = await notificationAPI.markAllAsRead();
      console.log('API response for marking all as read:', response);

      // If API call succeeds, update local state
      console.log('Updating local state...');
      setNotifications(prevNotifications => {
        console.log('Previous notifications:', prevNotifications);
        const updated = prevNotifications.map(notification => ({ ...notification, read: true }));
        console.log('Updated notifications:', updated);
        return updated;
      });

      // Reset unread count
      setUnreadCount(0);
      console.log('Unread count reset to 0');

      // Force a re-render by updating a timestamp
      setLastUpdated(new Date().getTime());

      console.log('All notifications marked as read successfully');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Function to get the appropriate icon for a notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <FiInfo className="h-5 w-5 text-blue-500" />;
      case 'grade':
        return <FiCheck className="h-5 w-5 text-green-500" />;
      case 'announcement':
        return <FiAlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <FiInfo className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Determine the base path based on user role
  const getBasePath = () => {
    if (!user || !user.role) return '/';

    switch (user.role) {
      case 'student':
        return '/student';
      case 'faculty':
        return '/faculty';
      case 'management':
        return '/management';
      default:
        return '/';
    }
  };

  const basePath = getBasePath();

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated || !user) {
      // Public navigation links
      return [
        { name: 'Home', path: '/home', icon: <FiHome /> },
        { name: 'About', path: '/about', icon: <FiBook /> },
        { name: 'Contact', path: '/contact', icon: <FiUsers /> }
      ];
    }

    // Common links for all authenticated users
    const links = [
      { name: 'Dashboard', path: `${basePath}/dashboard`, icon: <FiHome /> },
      { name: 'Profile', path: `${basePath}/profile`, icon: <FiUser /> },
      { name: 'Notifications', path: `${basePath}/notifications`, icon: <FiBell /> }
    ];

    // Role-specific links
    switch (user.role) {
      case 'student':
        return [
          ...links,
          { name: 'Courses', path: `${basePath}/courses`, icon: <FiBook /> },
          { name: 'Quizzes', path: `${basePath}/quizzes`, icon: <FiClipboard /> }
        ];
      case 'faculty':
        return [
          ...links,
          { name: 'Courses', path: `${basePath}/courses`, icon: <FiBook /> },
          { name: 'Quizzes', path: `${basePath}/quizzes`, icon: <FiClipboard /> },
          { name: 'Students', path: `${basePath}/students`, icon: <FiUsers /> }
        ];
      case 'management':
        return [
          ...links,
          { name: 'Courses', path: `${basePath}/courses`, icon: <FiBook /> },
          { name: 'Quizzes', path: `${basePath}/quizzes`, icon: <FiClipboard /> },
          { name: 'Users', path: `${basePath}/users`, icon: <FiUsers /> },
          { name: 'Settings', path: `${basePath}/settings`, icon: <FiSettings /> }
        ];
      default:
        return links;
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center">
              <span className="text-purple-600 font-bold text-xl">Campus Cloud</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          {/* User profile and authentication buttons */}
          <div className="hidden md:flex md:items-center">
            {isAuthenticated && user ? (
              <div className="ml-4 relative flex items-center">
                {/* Notification Bell */}
                <div className="relative mr-4" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="p-1 rounded-full text-gray-600 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-label="notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <FiBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50" style={{ maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                      <div className="py-1 divide-y divide-gray-200">
                        <div className="px-4 py-3 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllAsRead()}
                              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-600 px-2 py-1 rounded-md font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {loading && notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 pt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="ml-3 w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="ml-4 flex-shrink-0 flex">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification._id);
                                        }}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-md text-xs font-medium"
                                      >
                                        Mark as read
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Popup */}
                {showNotificationPopup && newNotification && (
                  <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 transform transition-all duration-300 ease-in-out">
                    <div className="bg-purple-600 px-4 py-2 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-white">New Notification</h3>
                      <button
                        onClick={() => setShowNotificationPopup(false)}
                        className="text-white hover:text-gray-200 focus:outline-none"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          {getNotificationIcon(newNotification.type)}
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {newNotification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {newNotification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Profile */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="ml-2 text-gray-700">{user.name || 'User'}</span>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link
                          to={`${basePath}/profile`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to={`${basePath}/settings`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {isAuthenticated && user && (
              <>
                {/* Mobile Notification Bell */}
                <div className="relative mr-2" ref={mobileNotificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="p-1 rounded-full text-gray-600 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-label="notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <FiBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50" style={{ maxWidth: 'calc(100vw - 24px)', right: '-10px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                      <div className="py-1 divide-y divide-gray-200">
                        <div className="px-4 py-3 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllAsRead()}
                              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-600 px-2 py-1 rounded-md font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {loading && notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 pt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="ml-3 w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="ml-4 flex-shrink-0 flex">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification._id);
                                        }}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-md text-xs font-medium"
                                      >
                                        Mark as read
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mr-2" ref={mobileProfileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {/* Mobile profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to={`${basePath}/profile`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to={`${basePath}/settings`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              >
                <FiLogOut className="mr-2" />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default UniversalNavbar;