import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp, FiBook, FiClipboard, FiCheckCircle } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [reportType, setReportType] = useState('performance-summary');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState('all-time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getStudentCourses();
        setCourses(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCourse(response.data.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!selectedCourse) return;
      
      setLoading(true);
      try {
        // In a real application, you would fetch actual report data from the API
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for different report types
        let mockData;
        
        switch (reportType) {
          case 'performance-summary':
            mockData = {
              title: 'Performance Summary',
              description: 'Your overall performance across all quizzes',
              labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
              datasets: [
                {
                  label: 'Your Score (%)',
                  data: [85, 92, 78, 88, 95]
                },
                {
                  label: 'Class Average (%)',
                  data: [78, 82, 75, 80, 85]
                }
              ],
              summary: 'Your average score is 87.6%, which is above the class average of 80%.'
            };
            break;
          case 'progress-tracker':
            mockData = {
              title: 'Progress Tracker',
              description: 'Your progress throughout the course',
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
              datasets: [
                {
                  label: 'Completed Activities',
                  data: [2, 5, 4, 6, 3, 5, 4, 2]
                },
                {
                  label: 'Quiz Scores',
                  data: [85, 92, 78, 88, 95, 90, 85, 92]
                }
              ],
              summary: 'You have completed 31 out of 35 required activities (88.6%).'
            };
            break;
          case 'strength-weakness':
            mockData = {
              title: 'Strengths & Weaknesses',
              description: 'Analysis of your performance by topic',
              labels: ['Data Structures', 'Algorithms', 'Web Development', 'Databases', 'Networking'],
              datasets: [
                {
                  label: 'Your Score (%)',
                  data: [95, 85, 92, 78, 88]
                },
                {
                  label: 'Class Average (%)',
                  data: [80, 75, 85, 72, 78]
                }
              ],
              summary: 'Your strongest areas are Data Structures (95%) and Web Development (92%). Consider focusing more on Databases (78%).'
            };
            break;
          default:
            mockData = {
              title: 'No Data Available',
              description: 'Please select a report type',
              labels: [],
              datasets: []
            };
        }
        
        setReportData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, selectedCourse, dateRange]);

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No report data available. Please select different criteria.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{reportData.title}</h2>
          <p className="text-gray-600">{reportData.description}</p>
        </div>

        {/* This is a placeholder for where charts would be rendered */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="text-center py-10">
            <FiBarChart2 className="mx-auto h-16 w-16 text-blue-400" />
            <p className="mt-4 text-gray-500">Chart visualization would appear here.</p>
            <p className="text-sm text-gray-400">In a real application, this would be rendered using a charting library like Chart.js or Recharts.</p>
          </div>
        </div>

        {/* Report summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <p className="text-gray-700">{reportData.summary}</p>
          
          {/* Sample metrics */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Quizzes</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">8/10</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiTrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">87.6%</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiPieChart className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Class Percentile</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">85th</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600">View your performance and progress reports</p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiDownload className="mr-2 -ml-1 h-5 w-5" />
          Download Report
        </button>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Report filters */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Options</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  id="report-type"
                  name="report-type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="performance-summary">Performance Summary</option>
                  <option value="progress-tracker">Progress Tracker</option>
                  <option value="strength-weakness">Strengths & Weaknesses</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.length === 0 ? (
                    <option value="">No courses available</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <select
                  id="date-range"
                  name="date-range"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all-time">All Time</option>
                  <option value="current-semester">Current Semester</option>
                  <option value="last-month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      name="start-date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      name="end-date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
              
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <ul className="divide-y divide-gray-200">
              <li className="py-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiClipboard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Completed Quiz: Midterm Examination</p>
                    <p className="text-sm text-gray-500">Score: 85/100</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiFileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Submitted Form: Course Feedback</p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiBook className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Enrolled in New Course</p>
                    <p className="text-sm text-gray-500">Advanced Database Systems</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Report content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            {renderReportContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
