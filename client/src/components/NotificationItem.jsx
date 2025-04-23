import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInfo, FiCheck, FiAlertCircle } from 'react-icons/fi';
import notificationAPI from '../services/notificationApi';

const NotificationItem = ({ notification, onMarkAsRead, basePath }) => {
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

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

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    
    if (isMarking || notification.read) return;
    
    try {
      setIsMarking(true);
      console.log('Marking notification as read:', notification._id);
      
      // Call API to mark as read
      await notificationAPI.markAsRead(notification._id);
      
      // Notify parent component
      if (onMarkAsRead) {
        onMarkAsRead(notification._id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleNavigate = (e) => {
    e.stopPropagation();
    
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(e);
    }
    
    // Navigate based on notification type
    if (notification.relatedResource) {
      const { resourceType, resourceId } = notification.relatedResource;
      
      // Navigate to the appropriate page
      switch (resourceType) {
        case 'quiz':
          navigate(`${basePath}/quizzes/${resourceId}`);
          break;
        case 'course':
          navigate(`${basePath}/courses/${resourceId}`);
          break;
        case 'preference':
          navigate(`${basePath}/preferences`);
          break;
        default:
          navigate(`${basePath}/notifications`);
      }
    }
  };

  return (
    <div 
      className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''} cursor-pointer`}
      onClick={handleNavigate}
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
              onClick={handleMarkAsRead}
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-md text-xs font-medium flex items-center"
              disabled={isMarking}
            >
              {isMarking ? (
                <>
                  <span className="mr-1 h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                  Marking...
                </>
              ) : 'Mark as read'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
