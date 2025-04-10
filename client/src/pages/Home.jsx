import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiClipboard, FiAward } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Campus Cloud Quiz Management System
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              A comprehensive platform for creating, managing, and taking quizzes in an educational environment
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-600 px-6 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiBookOpen className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Course Management</h3>
            <p className="text-gray-600">
              Create and manage courses, enroll students, and assign faculty members
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiClipboard className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Quiz Creation</h3>
            <p className="text-gray-600">
              Create quizzes with multiple question types, set time limits, and customize scoring
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiUsers className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Role-Based Access</h3>
            <p className="text-gray-600">
              Different interfaces and permissions for students, faculty, and management
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <FiAward className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Grading & Analytics</h3>
            <p className="text-gray-600">
              Automatic grading for objective questions and detailed performance analytics
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Create Courses</h3>
              <p className="text-gray-600">
                Set up courses, add learning materials, and invite students and faculty
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Design Quizzes</h3>
              <p className="text-gray-600">
                Create engaging quizzes with various question types and customizable settings
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Analyze Results</h3>
              <p className="text-gray-600">
                Review performance data, track progress, and identify areas for improvement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">
                "Campus Cloud has transformed how we administer assessments. The platform is intuitive and the analytics help us improve our teaching methods."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dr. Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Professor of Computer Science</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">
                "As a student, I appreciate how organized all my courses and quizzes are. The interface is clean and it's easy to track my progress."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Michael Chen</h4>
                  <p className="text-gray-500 text-sm">Engineering Student</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">
                "The administrative features have streamlined our department's assessment process. We've seen improved student engagement and performance."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dr. Robert Williams</h4>
                  <p className="text-gray-500 text-sm">Department Chair</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of educational institutions already using Campus Cloud
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Create an Account
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-md font-medium text-lg transition duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Campus Cloud</h3>
              <p className="text-gray-400">© 2023 All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/about" className="hover:text-purple-400 transition duration-300">
                About
              </Link>
              <Link to="/contact" className="hover:text-purple-400 transition duration-300">
                Contact
              </Link>
              <Link to="/privacy" className="hover:text-purple-400 transition duration-300">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;