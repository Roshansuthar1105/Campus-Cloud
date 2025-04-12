import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  // Redirect to dashboard if user doesn't have the required role
  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" replace />;
    } else if (user.role === 'management') {
      return <Navigate to="/management/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

// We're keeping the default export for backward compatibility
// but we've also added a named export above
