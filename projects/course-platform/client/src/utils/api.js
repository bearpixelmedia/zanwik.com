import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
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
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
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
    profile: '/auth/profile',
    password: '/auth/password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    logout: '/auth/logout',
    deleteAccount: '/auth/account',
  },
  
  // Courses
  courses: {
    list: '/courses',
    create: '/courses',
    get: (id) => `/courses/${id}`,
    update: (id) => `/courses/${id}`,
    delete: (id) => `/courses/${id}`,
    publish: (id) => `/courses/${id}/publish`,
    unpublish: (id) => `/courses/${id}/unpublish`,
    search: '/courses/search',
    featured: '/courses/featured',
    byCategory: (category) => `/courses/category/${category}`,
    byInstructor: (instructorId) => `/courses/instructor/${instructorId}`,
  },
  
  // Lessons
  lessons: {
    list: (courseId) => `/courses/${courseId}/lessons`,
    create: (courseId) => `/courses/${courseId}/lessons`,
    get: (id) => `/lessons/${id}`,
    update: (id) => `/lessons/${id}`,
    delete: (id) => `/lessons/${id}`,
    reorder: (courseId) => `/courses/${courseId}/lessons/reorder`,
    uploadVideo: (id) => `/lessons/${id}/video`,
    uploadFile: (id) => `/lessons/${id}/file`,
  },
  
  // Enrollments
  enrollments: {
    list: '/enrollments',
    create: (courseId) => `/courses/${courseId}/enroll`,
    get: (id) => `/enrollments/${id}`,
    update: (id) => `/enrollments/${id}`,
    cancel: (id) => `/enrollments/${id}/cancel`,
    progress: (id) => `/enrollments/${id}/progress`,
    certificate: (id) => `/enrollments/${id}/certificate`,
  },
  
  // Payments
  payments: {
    createIntent: '/payments/create-intent',
    confirm: '/payments/confirm',
    history: '/payments/history',
    refund: (id) => `/payments/${id}/refund`,
  },
  
  // Users
  users: {
    list: '/users',
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    stats: (id) => `/users/${id}/stats`,
  },
  
  // Analytics
  analytics: {
    overview: '/analytics/overview',
    courses: '/analytics/courses',
    enrollments: '/analytics/enrollments',
    revenue: '/analytics/revenue',
    students: '/analytics/students',
  },
  
  // Upload
  upload: {
    image: '/upload/image',
    video: '/upload/video',
    file: '/upload/file',
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Course operations
  getCourses: async (params = {}) => {
    const response = await api.get(endpoints.courses.list, { params });
    return response.data;
  },
  
  getCourse: async (id) => {
    const response = await api.get(endpoints.courses.get(id));
    return response.data;
  },
  
  createCourse: async (courseData) => {
    const response = await api.post(endpoints.courses.create, courseData);
    return response.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await api.put(endpoints.courses.update(id), courseData);
    return response.data;
  },
  
  deleteCourse: async (id) => {
    const response = await api.delete(endpoints.courses.delete(id));
    return response.data;
  },
  
  // Lesson operations
  getLessons: async (courseId) => {
    const response = await api.get(endpoints.lessons.list(courseId));
    return response.data;
  },
  
  getLesson: async (id) => {
    const response = await api.get(endpoints.lessons.get(id));
    return response.data;
  },
  
  createLesson: async (courseId, lessonData) => {
    const response = await api.post(endpoints.lessons.create(courseId), lessonData);
    return response.data;
  },
  
  updateLesson: async (id, lessonData) => {
    const response = await api.put(endpoints.lessons.update(id), lessonData);
    return response.data;
  },
  
  deleteLesson: async (id) => {
    const response = await api.delete(endpoints.lessons.delete(id));
    return response.data;
  },
  
  // Enrollment operations
  getEnrollments: async (params = {}) => {
    const response = await api.get(endpoints.enrollments.list, { params });
    return response.data;
  },
  
  enrollInCourse: async (courseId) => {
    const response = await api.post(endpoints.enrollments.create(courseId));
    return response.data;
  },
  
  updateProgress: async (enrollmentId, progressData) => {
    const response = await api.put(endpoints.enrollments.progress(enrollmentId), progressData);
    return response.data;
  },
  
  // Payment operations
  createPaymentIntent: async (paymentData) => {
    const response = await api.post(endpoints.payments.createIntent, paymentData);
    return response.data;
  },
  
  confirmPayment: async (paymentData) => {
    const response = await api.post(endpoints.payments.confirm, paymentData);
    return response.data;
  },
  
  getPaymentHistory: async () => {
    const response = await api.get(endpoints.payments.history);
    return response.data;
  },
  
  // Upload operations
  uploadImage: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(endpoints.upload.image, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },
  
  uploadVideo: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await api.post(endpoints.upload.video, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },
  
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(endpoints.upload.file, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },
  
  // Analytics operations
  getAnalytics: async (type = 'overview', params = {}) => {
    const response = await api.get(endpoints.analytics[type], { params });
    return response.data;
  },
};

export default api; 