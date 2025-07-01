import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp for caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 429 errors (rate limited)
    if (error.response?.status === 429) {
      console.error('Rate limited:', error.response.data);
    }
    
    // Handle 500 errors (server error)
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    refreshToken: '/auth/refresh-token',
  },
  
  // Surveys
  surveys: {
    list: '/surveys',
    create: '/surveys',
    get: (id) => `/surveys/${id}`,
    update: (id) => `/surveys/${id}`,
    delete: (id) => `/surveys/${id}`,
    publish: (id) => `/surveys/${id}/publish`,
    duplicate: (id) => `/surveys/${id}/duplicate`,
    templates: '/surveys/templates',
    public: (id) => `/surveys/${id}/public`,
  },
  
  // Responses
  responses: {
    list: '/responses',
    create: '/responses',
    get: (id) => `/responses/${id}`,
    update: (id) => `/responses/${id}`,
    delete: (id) => `/responses/${id}`,
    bySurvey: (surveyId) => `/surveys/${surveyId}/responses`,
    export: (surveyId) => `/surveys/${surveyId}/responses/export`,
    analytics: (surveyId) => `/surveys/${surveyId}/responses/analytics`,
  },
  
  // Analytics
  analytics: {
    overview: '/analytics/overview',
    surveys: '/analytics/surveys',
    responses: '/analytics/responses',
    export: '/analytics/export',
    realtime: '/analytics/realtime',
  },
  
  // Reports
  reports: {
    generate: '/reports/generate',
    schedule: '/reports/schedule',
    download: '/reports/download',
    templates: '/reports/templates',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    team: '/users/team',
    invite: '/users/invite',
    remove: (id) => `/users/${id}`,
    updateRole: (id) => `/users/${id}/role`,
  },
  
  // Subscriptions
  subscriptions: {
    plans: '/subscriptions/plans',
    create: '/subscriptions/create',
    cancel: '/subscriptions/cancel',
    update: '/subscriptions/update',
    webhook: '/subscriptions/webhook',
  },
};

// API methods
export const apiMethods = {
  // Survey methods
  getSurveys: (params = {}) => api.get(endpoints.surveys.list, { params }),
  createSurvey: (data) => api.post(endpoints.surveys.create, data),
  getSurvey: (id) => api.get(endpoints.surveys.get(id)),
  updateSurvey: (id, data) => api.put(endpoints.surveys.update(id), data),
  deleteSurvey: (id) => api.delete(endpoints.surveys.delete(id)),
  publishSurvey: (id) => api.post(endpoints.surveys.publish(id)),
  duplicateSurvey: (id) => api.post(endpoints.surveys.duplicate(id)),
  getTemplates: (category) => api.get(endpoints.surveys.templates, { params: { category } }),
  getPublicSurvey: (id) => api.get(endpoints.surveys.public(id)),
  
  // Response methods
  getResponses: (params = {}) => api.get(endpoints.responses.list, { params }),
  submitResponse: (data) => api.post(endpoints.responses.create, data),
  getResponse: (id) => api.get(endpoints.responses.get(id)),
  updateResponse: (id, data) => api.put(endpoints.responses.update(id), data),
  deleteResponse: (id) => api.delete(endpoints.responses.delete(id)),
  getSurveyResponses: (surveyId, params = {}) => api.get(endpoints.responses.bySurvey(surveyId), { params }),
  exportResponses: (surveyId, format = 'csv') => api.get(endpoints.responses.export(surveyId), { 
    params: { format },
    responseType: 'blob'
  }),
  getResponseAnalytics: (surveyId) => api.get(endpoints.responses.analytics(surveyId)),
  
  // Analytics methods
  getAnalyticsOverview: (params = {}) => api.get(endpoints.analytics.overview, { params }),
  getSurveyAnalytics: (params = {}) => api.get(endpoints.analytics.surveys, { params }),
  getResponseAnalytics: (params = {}) => api.get(endpoints.analytics.responses, { params }),
  exportAnalytics: (params = {}) => api.get(endpoints.analytics.export, { 
    params,
    responseType: 'blob'
  }),
  getRealtimeAnalytics: (surveyId) => api.get(endpoints.analytics.realtime, { params: { surveyId } }),
  
  // Report methods
  generateReport: (data) => api.post(endpoints.reports.generate, data),
  scheduleReport: (data) => api.post(endpoints.reports.schedule, data),
  downloadReport: (id) => api.get(endpoints.reports.download, { 
    params: { id },
    responseType: 'blob'
  }),
  getReportTemplates: () => api.get(endpoints.reports.templates),
  
  // User methods
  updateProfile: (data) => api.put(endpoints.users.profile, data),
  getTeam: () => api.get(endpoints.users.team),
  inviteTeamMember: (data) => api.post(endpoints.users.invite, data),
  removeTeamMember: (id) => api.delete(endpoints.users.remove(id)),
  updateTeamRole: (id, role) => api.put(endpoints.users.updateRole(id), { role }),
  
  // Subscription methods
  getPlans: () => api.get(endpoints.subscriptions.plans),
  createSubscription: (data) => api.post(endpoints.subscriptions.create, data),
  cancelSubscription: () => api.post(endpoints.subscriptions.cancel),
  updateSubscription: (data) => api.put(endpoints.subscriptions.update, data),
};

// File upload helper
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Export default api instance
export default api; 