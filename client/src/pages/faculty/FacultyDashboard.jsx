import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBook, FiClipboard, FiFileText, FiUsers, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import dashboardAPI from '../../services/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import DashboardSection from '../../components/Dashboard/DashboardSection';
import DashboardWelcome from '../../components/Dashboard/DashboardWelcome';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getFacultyDashboard();
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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

  // Prepare welcome stats
  const welcomeStats = dashboardData ? [
    { label: 'My Courses', value: dashboardData.courses?.length || 0 },
    { label: 'Created Quizzes', value: dashboardData.recentQuizzes?.length || 0 },
    { label: 'Needs Grading', value: dashboardData.quizzesNeedingGrading?.length || 0 },
    { label: 'Notifications', value: dashboardData.unreadNotificationsCount || 0 }
  ] : null;

  return (
    <div>
      {/* Welcome Banner */}
      <DashboardWelcome
        user={user}
        role="faculty"
        stats={welcomeStats}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard
          title="My Courses"
          value={dashboardData.courses?.length || 0}
          icon={<FiBook className="h-6 w-6" />}
          color="indigo"
          onClick={() => navigate('/faculty/courses')}
        />

        <DashboardCard
          title="Created Quizzes"
          value={dashboardData.recentQuizzes?.length || 0}
          icon={<FiClipboard className="h-6 w-6" />}
          color="green"
          onClick={() => navigate('/faculty/quizzes')}
        />

        <DashboardCard
          title="Needs Grading"
          value={dashboardData.quizzesNeedingGrading?.length || 0}
          icon={<FiFileText className="h-6 w-6" />}
          color="yellow"
          onClick={() => navigate('/faculty/quizzes')}
        />

        <DashboardCard
          title="Notifications"
          value={dashboardData.unreadNotificationsCount || 0}
          icon={<FiUsers className="h-6 w-6" />}
          color="purple"
          onClick={() => navigate('/faculty/notifications')}
        />
      </div>

      {/* Quizzes Needing Grading */}
      <DashboardSection
        title="Quizzes Needing Grading"
        actionText="View All Submissions"
        actionLink="/faculty/quizzes"
        actionIcon={<FiArrowRight />}
      >
        {dashboardData.quizzesNeedingGrading && dashboardData.quizzesNeedingGrading.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.quizzesNeedingGrading.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.quiz?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.student?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/faculty/submissions/${submission._id}/grade`} className="text-purple-600 hover:text-purple-900 font-medium">
                        Grade Now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiClipboard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes need grading</h3>
            <p className="mt-1 text-sm text-gray-500">All student submissions have been graded.</p>
          </div>
        )}
      </DashboardSection>

      {/* Recent Quizzes */}
      <DashboardSection
        title="Recent Quizzes"
        actionText="Create New Quiz"
        actionLink="/faculty/quizzes/create"
        actionIcon={<FiArrowRight />}
      >
        {dashboardData.recentQuizzes && dashboardData.recentQuizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.course?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.isPublished ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link to={`/faculty/quizzes/${quiz._id}`} className="text-purple-600 hover:text-purple-900 font-medium">
                          View
                        </Link>
                        <Link to={`/faculty/quizzes/${quiz._id}/edit`} className="text-blue-600 hover:text-blue-900 font-medium">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiClipboard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent quizzes</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first quiz to get started.</p>
          </div>
        )}
      </DashboardSection>

      {/* Course Statistics */}
      <DashboardSection
        title="Course Statistics"
        actionText="View All Courses"
        actionLink="/faculty/courses"
        actionIcon={<FiArrowRight />}
      >
        {dashboardData.courseStats && dashboardData.courseStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.courseStats.map((stat) => (
              <div key={stat.course._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-medium text-gray-900 mb-4 text-lg">{stat.course.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Students</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.studentCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Quizzes</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.quizCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Submission Rate</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.submissionRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Average Score</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Link
                    to={`/faculty/courses/${stat.course._id}/reports`}
                    className="text-sm text-purple-600 hover:text-purple-900 font-medium inline-flex items-center"
                    onClick={(e) => {
                      // Prevent default behavior if the route doesn't exist yet
                      if (!stat.course._id) {
                        e.preventDefault();
                        alert('Course reports are not available yet.');
                      }
                    }}
                  >
                    View Detailed Reports <FiBarChart2 className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiBook className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No course statistics available</h3>
            <p className="mt-1 text-sm text-gray-500">Statistics will appear once students have taken quizzes.</p>
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

export default FacultyDashboard;
