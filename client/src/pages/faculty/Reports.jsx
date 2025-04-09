import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp, FiUsers, FiBook, FiClipboard } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [reportType, setReportType] = useState('quiz-performance');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateRange, setDateRange] = useState('last-month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getFacultyCourses();
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
          case 'quiz-performance':
            mockData = {
              title: 'Quiz Performance Report',
              description: 'Average scores across quizzes',
              labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
              datasets: [
                {
                  label: 'Average Score (%)',
                  data: [78, 82, 75, 89, 92]
                }
              ],
              summary: 'Overall average score: 83.2%'
            };
            break;
          case 'student-engagement':
            mockData = {
              title: 'Student Engagement Report',
              description: 'Student participation metrics',
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
              datasets: [
                {
                  label: 'Quiz Submissions',
                  data: [45, 42, 38, 40, 43]
                },
                {
                  label: 'Form Responses',
                  data: [30, 35, 28, 32, 38]
                }
              ],
              summary: 'Average weekly engagement: 76.4%'
            };
            break;
          case 'question-analysis':
            mockData = {
              title: 'Question Analysis Report',
              description: 'Performance breakdown by question type',
              labels: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay'],
              datasets: [
                {
                  label: 'Average Score (%)',
                  data: [85, 92, 76, 68]
                }
              ],
              summary: 'Students perform best on True/False questions (92%)'
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
            <FiBarChart2 className="mx-auto h-16 w-16 text-indigo-400" />
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
                    <FiUsers className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">48</div>
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
                    <FiClipboard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Quiz Completion Rate</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">87%</div>
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
                    <FiTrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">83.2%</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and view analytics for your courses</p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiDownload className="mr-2 -ml-1 h-5 w-5" />
          Export Report
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="quiz-performance">Quiz Performance</option>
                  <option value="student-engagement">Student Engagement</option>
                  <option value="question-analysis">Question Analysis</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="last-week">Last Week</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-semester">Last Semester</option>
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
              
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Saved Reports</h2>
            <ul className="divide-y divide-gray-200">
              <li className="py-3">
                <a href="#" className="text-indigo-600 hover:text-indigo-900 font-medium">
                  End of Semester Performance
                </a>
                <p className="text-sm text-gray-500">Generated on May 15, 2023</p>
              </li>
              <li className="py-3">
                <a href="#" className="text-indigo-600 hover:text-indigo-900 font-medium">
                  Student Engagement Analysis
                </a>
                <p className="text-sm text-gray-500">Generated on April 2, 2023</p>
              </li>
              <li className="py-3">
                <a href="#" className="text-indigo-600 hover:text-indigo-900 font-medium">
                  Question Difficulty Analysis
                </a>
                <p className="text-sm text-gray-500">Generated on March 30, 2023</p>
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
