import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiClipboard, FiFileText, FiBarChart2, FiPieChart } from 'react-icons/fi';
import dashboardAPI from '../../services/dashboardApi';
import { useAuth } from '../../context/AuthContext';

const ManagementDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getManagementDashboard();
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
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
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-10">
        <p>No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Administrator'}</h1>
        <p className="text-gray-600">Here's an overview of the system</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.userCounts?.total || 0}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <span className="mr-2">Students: {dashboardData.userCounts?.students || 0}</span>
            <span className="mr-2">Faculty: {dashboardData.userCounts?.faculty || 0}</span>
            <span>Management: {dashboardData.userCounts?.management || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiBook className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.courseCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiClipboard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quizzes</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.quizStats?.total || 0}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <span className="mr-2">Active: {dashboardData.quizStats?.active || 0}</span>
            <span className="mr-2">Upcoming: {dashboardData.quizStats?.upcoming || 0}</span>
            <span>Completed: {dashboardData.quizStats?.completed || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FiFileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Preference Forms</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.formStats?.total || 0}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <span className="mr-2">Published: {dashboardData.formStats?.published || 0}</span>
            <span>Active: {dashboardData.formStats?.active || 0}</span>
          </div>
        </div>
      </div>

      {/* Active Courses */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Courses</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {dashboardData.activeCourses && dashboardData.activeCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.activeCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.faculty && course.faculty.length > 0
                          ? course.faculty.map(f => f.name).join(', ')
                          : 'No faculty assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/management/courses/${course._id}`} className="text-purple-600 hover:text-purple-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No active courses</p>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Quiz Submissions</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {dashboardData.recentSubmissions && dashboardData.recentSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentSubmissions.map((submission) => (
                    <tr key={submission._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.quiz?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.student?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.status === 'graded' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Graded
                          </span>
                        ) : submission.status === 'completed' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Needs Grading
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {submission.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/management/submissions/${submission._id}`} className="text-purple-600 hover:text-purple-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent submissions</p>
          )}
        </div>
      </div>

      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Department Statistics</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {dashboardData.departmentStats && dashboardData.departmentStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.departmentStats.map((dept, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{dept.department}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="text-lg font-semibold">{dept.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Faculty</p>
                      <p className="text-lg font-semibold">{dept.facultyCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Courses</p>
                      <p className="text-lg font-semibold">{dept.courseCount}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link 
                      to={`/management/departments/${encodeURIComponent(dept.department)}`} 
                      className="text-sm text-purple-600 hover:text-purple-900"
                    >
                      View Department Details <FiBarChart2 className="inline ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No department statistics available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
