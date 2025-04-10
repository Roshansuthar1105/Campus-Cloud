import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiBarChart2, FiArrowLeft, FiUsers, FiBook } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import reportAPI from '../../services/reportApi';

const CourseReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [reportType, setReportType] = useState('quiz-performance');
  const [dateRange, setDateRange] = useState('all-time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourse(id);
        setCourse(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (course) {
      fetchReportData();
    }
  }, [course, reportType, dateRange]);

  const fetchReportData = async () => {
    if (!course) return;

    setLoading(true);
    try {
      // Try to fetch report data from the API
      try {
        let response;
        const params = {
          course: id,
          dateRange: dateRange
        };

        switch (reportType) {
          case 'quiz-performance':
            response = await reportAPI.getQuizPerformanceReport(params);
            break;
          case 'student-engagement':
            response = await reportAPI.getStudentEngagementReport(params);
            break;
          case 'question-analysis':
            response = await reportAPI.getQuestionAnalysisReport(params);
            break;
          default:
            throw new Error('Invalid report type');
        }

        setReportData(response.data.data);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);

        // Fallback to mock data if API fails
        let mockData;

        switch (reportType) {
          case 'quiz-performance':
            mockData = {
              title: 'Quiz Performance Report',
              description: `Average scores across quizzes for ${course.name}`,
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
              description: `Student participation metrics for ${course.name}`,
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
              description: `Performance breakdown by question type for ${course.name}`,
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
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const params = {
        course: id,
        dateRange: dateRange
      };

      const response = await reportAPI.exportReport(reportType, params);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${course.name}-${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again later.');
    }
  };

  if (loading && !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <button
                onClick={() => navigate('/faculty/courses')}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Return to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <p>Course not found.</p>
        <button
          onClick={() => navigate('/faculty/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/faculty/courses')}
            className="mr-4 text-indigo-600 hover:text-indigo-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Reports</h1>
            <p className="text-gray-600">{course.name} ({course.code})</p>
          </div>
        </div>
        <button
          onClick={handleExportReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiDownload className="mr-2 -ml-1 h-5 w-5" />
          Export Report
        </button>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="quiz-performance">Quiz Performance</option>
                <option value="student-engagement">Student Engagement</option>
                <option value="question-analysis">Question Analysis</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-semester">Last Semester</option>
                <option value="all-time">All Time</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={fetchReportData}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && !loading && (
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

      {reportData && !loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{reportData.title}</h2>
            <p className="text-gray-600">{reportData.description}</p>
          </div>
          <div className="p-6">
            <div className="h-80 mb-6">
              {/* This is where you would render a chart based on reportData */}
              {/* For now, we'll just display the data in a simple format */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Labels</h4>
                    <ul className="list-disc pl-5">
                      {reportData.labels.map((label, index) => (
                        <li key={index} className="text-gray-600">{label}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Datasets</h4>
                    {reportData.datasets.map((dataset, index) => (
                      <div key={index} className="mb-4">
                        <p className="text-sm font-medium text-gray-700">{dataset.label}</p>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {dataset.data.map((value, i) => (
                            <div key={i} className="bg-indigo-100 p-2 rounded text-center">
                              <span className="text-indigo-700 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{reportData.summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students Enrolled</p>
              <p className="text-xl font-semibold text-gray-900">{course.studentCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiBook className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quizzes Created</p>
              <p className="text-xl font-semibold text-gray-900">{course.quizCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiBarChart2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-xl font-semibold text-gray-900">{course.averageScore ? `${course.averageScore.toFixed(1)}%` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReports;
