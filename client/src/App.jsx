import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { RoleRoute } from './components/RoleRoute';

// Layouts
import StudentLayout from './components/layouts/StudentLayout';
import FacultyLayout from './components/layouts/FacultyLayout';
import ManagementLayout from './components/layouts/ManagementLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentCourseList from './pages/student/CourseList';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentQuizList from './pages/student/QuizList';
import QuizTake from './pages/student/QuizTake';
import QuizResults from './pages/student/QuizResults';
import StudentPreferenceFormList from './pages/student/PreferenceFormList';
import StudentPreferenceForm from './pages/student/PreferenceForm';
import StudentPreferenceFormView from './pages/student/PreferenceFormView';
import StudentReports from './pages/student/Reports';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyNotifications from './pages/faculty/FacultyNotifications';
import FacultyCourseList from './pages/faculty/CourseList';
import FacultyCourseDetail from './pages/faculty/CourseDetail';
import FacultyQuizList from './pages/faculty/QuizList';
import QuizCreate from './pages/faculty/QuizCreate';
import QuizEdit from './pages/faculty/QuizEdit';
import FQuizDetail from './pages/faculty/QuizDetail';
import QuizSubmissions from './pages/faculty/QuizSubmissions';
import QuizGrading from './pages/faculty/QuizGrading';
import { SubmissionView } from './pages/faculty/SubmissionView';
import FacultyPreferenceFormList from './pages/faculty/PreferenceFormList';
import FacultyPreferenceFormCreate from './pages/faculty/PreferenceFormCreate';
import FacultyPreferenceFormDetail from './pages/faculty/PreferenceFormDetail';
import FacultyPreferenceFormReports from './pages/faculty/PreferenceFormReports';
import FacultyReports from './pages/faculty/Reports';

// Management Pages
import ManagementDashboard from './pages/management/ManagementDashboard';
import ManagementProfile from './pages/management/ManagementProfile';
import ManagementNotifications from './pages/management/ManagementNotifications';
import CourseList from './pages/management/CourseList';
import CourseForm from './pages/management/CourseForm';
import CourseDetail from './pages/management/CourseDetail';
import UserList from './pages/management/UserList';
import UserForm from './pages/management/UserForm';
import QuizList from './pages/management/QuizList';
import QuizDetail from './pages/management/QuizDetail';
import QuizReports from './pages/management/QuizReports';
import PreferenceFormList from './pages/management/PreferenceFormList';
import PreferenceFormCreate from './pages/management/PreferenceFormCreate';
import PreferenceFormDetail from './pages/management/PreferenceFormDetail';
import PreferenceFormReports from './pages/management/PreferenceFormReports';
import Reports from './pages/management/Reports';
import Announcements from './pages/management/Announcements';
import Settings from './pages/management/Settings';

import './index.css';
// pages import
import UniversalNavbar from './components/UniversalNavbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
// Redirect based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/home" replace />;

  switch (user.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'faculty':
      return <Navigate to="/faculty/dashboard" replace />;
    case 'management':
      return <Navigate to="/management/dashboard" replace />;
    default:
      return <Navigate to="/home" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <UniversalNavbar/>
        <div className="min-h-screen flex flex-col mt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Student routes */}
            <Route element={<RoleRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="courses" element={<StudentCourseList />} />
                <Route path="courses/:id" element={<StudentCourseDetail />} />
                <Route path="quizzes" element={<StudentQuizList />} />
                <Route path="quizzes/:id/take" element={<QuizTake />} />
                <Route path="submissions/:id" element={<QuizResults />} />
                <Route path="submissions/:id/continue" element={<QuizTake />} />
                <Route path="preferences" element={<StudentPreferenceFormList />} />
                <Route path="preferences/:id" element={<StudentPreferenceForm />} />
                <Route path="preferences/:id/continue" element={<StudentPreferenceForm />} />
                <Route path="preferences/:id/view" element={<StudentPreferenceFormView />} />
                <Route path="reports" element={<StudentReports />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Faculty routes */}
            <Route element={<RoleRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty" element={<FacultyLayout />}>
                <Route path="dashboard" element={<FacultyDashboard />} />
                <Route path="profile" element={<FacultyProfile />} />
                <Route path="notifications" element={<FacultyNotifications />} />
                <Route path="courses" element={<FacultyCourseList />} />
                <Route path="courses/:id" element={<FacultyCourseDetail />} />
                <Route path="quizzes" element={<FacultyQuizList />} />
                <Route path="quizzes/create" element={<QuizCreate />} />
                <Route path="quizzes/:id" element={<FQuizDetail />} />
                <Route path="quizzes/:id/edit" element={<QuizEdit />} />
                <Route path="quizzes/:id/submissions" element={<QuizSubmissions />} />
                <Route path="submissions/:id/grade" element={<QuizGrading />} />
                <Route path="submissions/:id/view" element={<SubmissionView />} />
                <Route path="preferences" element={<FacultyPreferenceFormList />} />
                <Route path="preferences/create" element={<FacultyPreferenceFormCreate />} />
                <Route path="preferences/:id/edit" element={<FacultyPreferenceFormCreate />} />
                <Route path="preferences/:id" element={<FacultyPreferenceFormDetail />} />
                <Route path="preferences/:id/reports" element={<FacultyPreferenceFormReports />} />
                <Route path="reports" element={<FacultyReports />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Management routes */}
            <Route element={<RoleRoute allowedRoles={['management']} />}>
              <Route path="/management" element={<ManagementLayout />}>
                <Route path="dashboard" element={<ManagementDashboard />} />
                <Route path="profile" element={<ManagementProfile />} />
                <Route path="notifications" element={<ManagementNotifications />} />
                <Route path="courses" element={<CourseList />} />
                <Route path="courses/create" element={<CourseForm />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="courses/:id/edit" element={<CourseForm />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/create" element={<UserForm />} />
                <Route path="users/:id/edit" element={<UserForm />} />
                <Route path="quizzes" element={<QuizList />} />
                <Route path="quizzes/create" element={<QuizCreate />} />
                <Route path="quizzes/:id/edit" element={<QuizEdit />} />
                <Route path="quizzes/:id" element={<QuizDetail />} />
                <Route path="quizzes/:id/reports" element={<QuizReports />} />
                <Route path="preferences" element={<PreferenceFormList />} />
                <Route path="preferences/create" element={<PreferenceFormCreate />} />
                <Route path="preferences/:id/edit" element={<PreferenceFormCreate />} />
                <Route path="preferences/:id" element={<PreferenceFormDetail />} />
                <Route path="preferences/:id/reports" element={<PreferenceFormReports />} />
                <Route path="reports" element={<Reports />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="settings" element={<Settings />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
