import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClipboard, FiFileText, FiBarChart2, FiArrowRight, FiBookOpen } from 'react-icons/fi';
import dashboardAPI from '../../services/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import DashboardSection from '../../components/Dashboard/DashboardSection';
import DashboardWelcome from '../../components/Dashboard/DashboardWelcome';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getStudentDashboard();
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    { label: 'Enrolled Courses', value: dashboardData.courses?.length || 0 },
    { label: 'Upcoming Quizzes', value: dashboardData.upcomingQuizzes?.length || 0 },
    { label: 'Active Forms', value: dashboardData.activeForms?.length || 0 },
    { label: 'Notifications', value: dashboardData.unreadNotificationsCount || 0 }
  ] : null;

  return (
    <div>
      {/* Welcome Banner */}
      <DashboardWelcome
        user={user}
        role="student"
        stats={welcomeStats}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard
          title="Enrolled Courses"
          value={dashboardData.courses?.length || 0}
          icon={<FiCalendar className="h-6 w-6" />}
          color="blue"
          onClick={() => navigate('/student/courses')}
        />

        <DashboardCard
          title="Upcoming Quizzes"
          value={dashboardData.upcomingQuizzes?.length || 0}
          icon={<FiClipboard className="h-6 w-6" />}
          color="green"
          onClick={() => navigate('/student/quizzes')}
        />

        <DashboardCard
          title="Active Forms"
          value={dashboardData.activeForms?.length || 0}
          icon={<FiFileText className="h-6 w-6" />}
          color="purple"
          onClick={() => navigate('/student/preference-forms')}
        />

        <DashboardCard
          title="Notifications"
          value={dashboardData.unreadNotificationsCount || 0}
          icon={<FiBarChart2 className="h-6 w-6" />}
          color="red"
          onClick={() => navigate('/student/notifications')}
        />
      </div>

      {/* Upcoming Quizzes */}
      <DashboardSection
        title="Upcoming Quizzes"
        actionText="View All Quizzes"
        actionLink="/student/quizzes"
        actionIcon={<FiArrowRight />}
      >
        {dashboardData.upcomingQuizzes && dashboardData.upcomingQuizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.upcomingQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.course?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quiz.startDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quiz.endDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/student/quizzes/${quiz._id}/take`} className="text-purple-600 hover:text-purple-900 font-medium">
                        Take Quiz
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming quizzes</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up with your quizzes!</p>
          </div>
        )}
      </DashboardSection>

      {/* Active Preference Forms */}
      <DashboardSection
        title="Active Preference Forms"
        actionText="View All Forms"
        actionLink="/student/preference-forms"
        actionIcon={<FiArrowRight />}
      >
        {dashboardData.activeForms && dashboardData.activeForms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.activeForms.map((form) => (
                  <tr key={form._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.endDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/student/preference-forms/${form._id}`} className="text-purple-600 hover:text-purple-900 font-medium">
                        Complete Form
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active forms</h3>
            <p className="mt-1 text-sm text-gray-500">There are no preference forms that need your attention right now.</p>
          </div>
        )}
      </DashboardSection>

      {/* Course Statistics */}
      <DashboardSection title="Course Statistics">
        {dashboardData.courseStats && dashboardData.courseStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.courseStats.map((stat) => (
              <div key={stat.course._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-medium text-gray-900 mb-4 text-lg">{stat.course.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Completed Quizzes</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.completedQuizzes} / {stat.totalQuizzes}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Average Score</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Link to={`/student/courses/${stat.course._id}`} className="text-sm text-purple-600 hover:text-purple-900 font-medium inline-flex items-center">
                    View Course Details <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No course statistics available</h3>
            <p className="mt-1 text-sm text-gray-500">Statistics will appear once you've completed some quizzes.</p>
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

export default StudentDashboard;
