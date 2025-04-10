import { Outlet, Link } from 'react-router-dom';
import UniversalNavbar from '../UniversalNavbar';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Universal Navbar */}
      <UniversalNavbar />

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} Campus Cloud. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to="/about" className="text-gray-600 hover:text-purple-600 text-sm">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-purple-600 text-sm">Contact</Link>
              <Link to="/home" className="text-gray-600 hover:text-purple-600 text-sm">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
