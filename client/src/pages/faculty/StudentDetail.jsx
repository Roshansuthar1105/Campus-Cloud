import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiUser, FiBook, FiClipboard, FiBarChart2 } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the student data from an API
        // For now, we'll use mock data
        
        // Mock student data
        const mockStudent = {
          _id: id,
          name: 'John Doe',
          email: 'john.doe@example.com',
          studentId: 'S12345',
          enrollmentStatus: 'active',
          program: 'Computer Science',
          year: 3,
          gpa: 3.7,
          joinedDate: '2021-09-01'
        };
        
        // Mock courses data
        const mockCourses = [
          {
            _id: 'c1',
            name: 'Web Development',
            code: 'CS301',
            progress: 85,
            grade: 'A-'
          },
          {
            _id: 'c2',
            name: 'Database Systems',
            code: 'CS302',
            progress: 92,
            grade: 'A'
          },
          {
            _id: 'c3',
            name: 'Computer Networks',
            code: 'CS303',
            progress: 78,
            grade: 'B+'
          }
        ];
        
        // Mock submissions data
        const mockSubmissions = [
          {
            _id: 's1',
            title: 'Midterm Quiz',
            course: 'Web Development',
            submittedAt: '2023-10-15T14:30:00Z',
            score: 92,
            status: 'graded'
          },
          {
            _id: 's2',
            title: 'Database Design Quiz',
            course: 'Database Systems',
            submittedAt: '2023-10-10T09:15:00Z',
            score: 88,
            status: 'graded'
          },
          {
            _id: 's3',
            title: 'Final Project',
            course: 'Web Development',
            submittedAt: '2023-11-20T16:45:00Z',
            score: null,
            status: 'pending'
          }
        ];
        
        setStudent(mockStudent);
        setCourses(mockCourses);
        setSubmissions(mockSubmissions);
        setError(null);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

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
            <div className="mt-2">
              <button
                onClick={() => navigate('/faculty/students')}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Return to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-10">
        <p>Student not found.</p>
        <button
          onClick={() => navigate('/faculty/students')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Students
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/faculty/students')}
          className="mr-4 text-indigo-600 hover:text-indigo-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600">View and manage student information</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 md:mx-0 mx-auto">
              <FiUser className="h-12 w-12 text-indigo-600" />
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
              <div className="flex flex-col md:flex-row md:items-center mt-1 text-gray-600">
                <span>{student.email}</span>
                <span className="hidden md:inline mx-2">•</span>
                <span>Student ID: {student.studentId}</span>
              </div>
              <div className="mt-2">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {student.enrollmentStatus}
                </span>
                <button className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FiMail className="mr-1.5 h-4 w-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-500">Program</p>
            <p className="mt-1 text-sm text-gray-900">{student.program}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Year</p>
            <p className="mt-1 text-sm text-gray-900">{student.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">GPA</p>
            <p className="mt-1 text-sm text-gray-900">{student.gpa}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FiBook className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Enrolled Courses</h3>
            </div>
          </div>
          <div className="p-6">
            {courses.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <li key={course._id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{course.grade || 'N/A'}</p>
                      <div className="mt-1 w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No courses enrolled</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FiClipboard className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
            </div>
          </div>
          <div className="p-6">
            {submissions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission._id} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{submission.title}</p>
                        <p className="text-sm text-gray-500">{submission.course}</p>
                      </div>
                      <div className="text-right">
                        {submission.status === 'graded' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {submission.score}%
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent submissions</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FiBarChart2 className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Detailed performance analytics will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
