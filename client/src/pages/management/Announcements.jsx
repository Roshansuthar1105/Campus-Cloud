import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSend, FiUsers, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import api from '../../services/api';
import courseAPI from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    course: '',
    role: '',
    sendEmail: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await courseAPI.getCourses();
        setCourses(coursesResponse.data.data);
        
        // Fetch announcements (mock data for now)
        // const announcementsResponse = await api.get('/announcements');
        // setAnnouncements(announcementsResponse.data.data);
        
        // Mock data
        setAnnouncements([
          {
            _id: '1',
            title: 'System Maintenance Notice',
            content: 'The system will be down for maintenance on Saturday, November 25th from 2:00 AM to 5:00 AM EST.',
            createdBy: {
              _id: '101',
              name: 'Admin User'
            },
            targetAudience: 'all',
            createdAt: new Date(2023, 10, 20),
            sentToEmail: true
          },
          {
            _id: '2',
            title: 'New Feature: Quiz Analytics',
            content: 'We\'ve added a new feature that allows faculty to view detailed analytics for quiz performance. Check it out in the Reports section!',
            createdBy: {
              _id: '101',
              name: 'Admin User'
            },
            targetAudience: 'role',
            role: 'faculty',
            createdAt: new Date(2023, 10, 15),
            sentToEmail: false
          },
          {
            _id: '3',
            title: 'Final Exam Schedule Posted',
            content: 'The final exam schedule for the Fall 2023 semester has been posted. Please check your course pages for specific dates and times.',
            createdBy: {
              _id: '102',
              name: 'Department Head'
            },
            targetAudience: 'course',
            course: {
              _id: coursesResponse.data.data[0]?._id,
              name: coursesResponse.data.data[0]?.name
            },
            createdAt: new Date(2023, 10, 10),
            sentToEmail: true
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would send this to the API
      // await api.post('/announcements', formData);
      
      // For now, just add it to the local state
      const newAnnouncement = {
        _id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        createdBy: {
          _id: user._id,
          name: user.name
        },
        targetAudience: formData.targetAudience,
        createdAt: new Date(),
        sentToEmail: formData.sendEmail
      };
      
      if (formData.targetAudience === 'course' && formData.course) {
        const selectedCourse = courses.find(c => c._id === formData.course);
        newAnnouncement.course = {
          _id: selectedCourse._id,
          name: selectedCourse.name
        };
      }
      
      if (formData.targetAudience === 'role' && formData.role) {
        newAnnouncement.role = formData.role;
      }
      
      setAnnouncements([newAnnouncement, ...announcements]);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        targetAudience: 'all',
        course: '',
        role: '',
        sendEmail: false
      });
      
      setShowForm(false);
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Failed to create announcement. Please try again.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      // In a real app, you would call the API
      // await api.delete(`/announcements/${id}`);
      
      // For now, just update the local state
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement. Please try again.');
    }
  };

  const getTargetAudienceLabel = (announcement) => {
    if (announcement.targetAudience === 'all') {
      return 'All Users';
    } else if (announcement.targetAudience === 'role' && announcement.role) {
      return announcement.role.charAt(0).toUpperCase() + announcement.role.slice(1);
    } else if (announcement.targetAudience === 'course' && announcement.course) {
      return `Course: ${announcement.course.name}`;
    }
    return 'Unknown';
  };

  if (loading && announcements.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Create and manage system-wide announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          New Announcement
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

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Announcement</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                  Target Audience *
                </label>
                <div className="mt-1">
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    required
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Users</option>
                    <option value="role">By Role</option>
                    <option value="course">By Course</option>
                  </select>
                </div>
              </div>

              {formData.targetAudience === 'role' && (
                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a role</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.targetAudience === 'course' && (
                <div className="sm:col-span-3">
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                    Course *
                  </label>
                  <div className="mt-1">
                    <select
                      id="course"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendEmail"
                      name="sendEmail"
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={handleInputChange}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendEmail" className="font-medium text-gray-700">
                      Send as Email
                    </label>
                    <p className="text-gray-500">Also send this announcement as an email to all recipients</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiSend className="mr-2 -ml-1 h-5 w-5" />
                Publish
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Announcements</h2>
        </div>

        {announcements.length === 0 ? (
          <div className="p-6 text-center">
            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new announcement.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Announcement
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <li key={announcement._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>Posted on {announcement.createdAt.toLocaleDateString()}</span>
                      {announcement.sentToEmail && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sent as Email
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>To: {getTargetAudienceLabel(announcement)}</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      <p>{announcement.content}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      type="button"
                      className="mr-2 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Announcements;
