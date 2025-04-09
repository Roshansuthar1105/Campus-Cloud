import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiEye, FiTrash2, FiBarChart2, FiFileText } from 'react-icons/fi';
import api from '../../services/api';
import courseAPI from '../../services/courseApi';

const PreferenceFormList = () => {
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
        
        // Fetch courses first
        const coursesResponse = await courseAPI.getCourses();
        setCourses(coursesResponse.data.data);
        
        // Then fetch preference forms (this is a placeholder - you'll need to implement the actual API)
        // const formsResponse = await api.get('/preference-forms');
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
            isPublished: true,
            responses: 12
          },
          {
            _id: '2',
            title: 'Teaching Effectiveness Survey',
            description: 'Survey to evaluate teaching methods',
            course: {
              _id: coursesResponse.data.data[1]?._id,
              name: coursesResponse.data.data[1]?.name,
              code: coursesResponse.data.data[1]?.code
            },
            startDate: new Date(2023, 9, 15),
            endDate: new Date(2023, 10, 30),
            isPublished: true,
            responses: 8
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
            isPublished: false,
            responses: 0
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

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this preference form? This action cannot be undone.')) {
      return;
    }
    
    try {
      // await api.delete(`/preference-forms/${id}`);
      
      // Update the forms list
      setForms(forms.filter(form => form._id !== id));
    } catch (err) {
      console.error('Error deleting preference form:', err);
      setError('Failed to delete preference form. Please try again later.');
    }
  };

  const getFormStatus = (form) => {
    const now = new Date();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (!form.isPublished) {
      return 'draft';
    } else if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'ended';
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preference Forms</h1>
          <p className="text-gray-600">Manage feedback and preference forms</p>
        </div>
        <Link
          to="/management/preference-forms/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          Create Form
        </Link>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
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
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No preference forms found. Create your first form!</p>
            <Link
              to="/management/preference-forms/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Create Form
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map((form) => {
                  const status = getFormStatus(form);
                  let statusColor = 'gray';
                  if (status === 'active') statusColor = 'green';
                  if (status === 'upcoming') statusColor = 'yellow';
                  if (status === 'ended') statusColor = 'red';
                  if (status === 'draft') statusColor = 'gray';
                  
                  return (
                    <tr key={form._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{form.title}</div>
                        <div className="text-sm text-gray-500">{form.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{form.course?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{form.course?.code || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {form.startDate.toLocaleDateString()} - {form.endDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {form.responses} responses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            to={`/management/preference-forms/${form._id}`}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Form"
                          >
                            <FiEye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/management/preference-forms/${form._id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit Form"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/management/preference-forms/${form._id}/reports`}
                            className="text-green-600 hover:text-green-900"
                            title="View Reports"
                          >
                            <FiBarChart2 className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteForm(form._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Form"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceFormList;
