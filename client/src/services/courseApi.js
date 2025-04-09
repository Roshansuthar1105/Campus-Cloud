import api from './api';

// Course API calls
const courseAPI = {
  // Get all courses
  getCourses: async () => {
    return await api.get('/courses');
  },

  // Get single course
  getCourse: async (id) => {
    return await api.get(`/courses/${id}`);
  },

  // Create course
  createCourse: async (courseData) => {
    return await api.post('/courses', courseData);
  },

  // Update course
  updateCourse: async (id, courseData) => {
    return await api.put(`/courses/${id}`, courseData);
  },

  // Delete course
  deleteCourse: async (id) => {
    return await api.delete(`/courses/${id}`);
  },

  // Add students to course
  addStudentsToCourse: async (id, studentIds) => {
    return await api.post(`/courses/${id}/students`, { studentIds });
  },

  // Remove student from course
  removeStudentFromCourse: async (courseId, studentId) => {
    return await api.delete(`/courses/${courseId}/students/${studentId}`);
  },

  // Get courses for current student
  getStudentCourses: async () => {
    return await api.get('/courses/student');
  },

  // Get courses for current faculty
  getFacultyCourses: async () => {
    return await api.get('/courses/faculty');
  }
};

export default courseAPI;
