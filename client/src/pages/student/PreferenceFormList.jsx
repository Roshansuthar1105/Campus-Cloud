import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiEye, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import courseAPI from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';

const PreferenceFormList = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student courses
        const coursesResponse = await courseAPI.getStudentCourses();
        setCourses(coursesResponse.data.data);
        
        // Then fetch preference forms (this is a placeholder - you'll need to implement the actual API)
        // const formsResponse = await api.get('/preference-forms/student');
        // setForms(formsResponse.data.data);
        
        // For now, we'll use mock data
        setForms([
          {
            _id: '1',
            title: 'Course Feedback Form',
            description: 'End of semester course feedback',
            course: {
              _id: coursesResponse.data.data[0]?._id,
              name: coursesResponse.data.data[0]?.name,
              code: coursesResponse.data.data[0]?.code
            },
            startDate: new Date(2023, 10, 1),
            endDate: new Date(2023, 11, 15),
            status: 'completed',
            submittedAt: new Date(2023, 10, 5)
          },
          {
            _id: '2',
            title: 'Teaching Effectiveness Survey',
            description: 'Survey to evaluate teaching methods',
            course: {
              _id: coursesResponse.data.data[0]?._id,
              name: coursesResponse.data.data[0]?.name,
              code: coursesResponse.data.data[0]?.code
            },
            startDate: new Date(2023, 9, 15),
            endDate: new Date(2023, 10, 30),
            status: 'pending',
            submittedAt: null
          },
          {
            _id: '3',
            title: 'Course Material Evaluation',
            description: 'Evaluate the quality and relevance of course materials',
            course: {
              _id: coursesResponse.data.data[0]?._id,
              name: coursesResponse.data.data[0]?.name,
              code: coursesResponse.data.data[0]?.code
            },
            startDate: new Date(2023, 11, 1),
            endDate: new Date(2024, 0, 15),
            status: 'not-started',
            submittedAt: null
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load preference forms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFormStatus = (form) => {
    if (form.status === 'completed') {
      return 'completed';
    }
    
    const now = new Date();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return form.status === 'pending' ? 'pending' : 'available';
    } else {
      return 'expired';
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !filterCourse || form.course?._id === filterCourse;
    const formStatus = getFormStatus(form);
    const matchesStatus = !filterStatus || formStatus === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading && forms.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preference Forms</h1>
        <p className="text-gray-600">View and complete feedback forms for your courses</p>
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search forms..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="course" className="sr-only">
                Filter by Course
              </label>
              <select
                id="course"
                name="course"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="status" className="sr-only">
                Filter by Status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="p-6 text-center">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No preference forms</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no preference forms available for you at this time.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredForms.map((form) => {
              const status = getFormStatus(form);
              let statusColor = 'gray';
              let statusIcon = <FiClock className="h-5 w-5" />;
              let actionText = '';
              
              if (status === 'available') {
                statusColor = 'blue';
                statusIcon = <FiFileText className="h-5 w-5" />;
                actionText = 'Complete Form';
              } else if (status === 'pending') {
                statusColor = 'yellow';
                statusIcon = <FiClock className="h-5 w-5" />;
                actionText = 'Continue Form';
              } else if (status === 'completed') {
                statusColor = 'green';
                statusIcon = <FiCheckCircle className="h-5 w-5" />;
                actionText = 'View Submission';
              } else if (status === 'upcoming') {
                statusColor = 'gray';
                statusIcon = <FiCalendar className="h-5 w-5" />;
                actionText = '';
              } else if (status === 'expired') {
                statusColor = 'red';
                statusIcon = <FiClock className="h-5 w-5" />;
                actionText = '';
              }
              
              return (
                <li key={form._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-${statusColor}-100 flex items-center justify-center text-${statusColor}-600`}>
                        {statusIcon}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{form.title}</div>
                        <div className="text-sm text-gray-500">{form.course?.name} ({form.course?.code})</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(form.startDate).toLocaleDateString()} - {new Date(form.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {actionText && (
                        <Link
                          to={`/student/preference-forms/${form._id}${status === 'pending' ? '/continue' : status === 'completed' ? '/view' : ''}`}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-${statusColor === 'gray' ? 'gray' : 'blue'}-600 hover:bg-${statusColor === 'gray' ? 'gray' : 'blue'}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          <FiEye className="mr-2 -ml-0.5 h-4 w-4" />
                          {actionText}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PreferenceFormList;
