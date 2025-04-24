import api from './api';

// Report API calls
const reportAPI = {
  // Get faculty reports
  getFacultyReports: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.reportType) queryParams.append('reportType', params.reportType);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/reports/faculty${queryString}`);
  },
  
  // Get management reports
  getManagementReports: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.reportType) queryParams.append('reportType', params.reportType);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/reports/management${queryString}`);
  },
  
  // Export faculty report
  exportFacultyReport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.reportType) queryParams.append('reportType', params.reportType);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.format) queryParams.append('format', params.format);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/reports/faculty/export${queryString}`, {
      responseType: 'blob'
    });
  },
  
  // Export management report
  exportManagementReport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.reportType) queryParams.append('reportType', params.reportType);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.format) queryParams.append('format', params.format);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/reports/management/export${queryString}`, {
      responseType: 'blob'
    });
  }
};

export default reportAPI;
