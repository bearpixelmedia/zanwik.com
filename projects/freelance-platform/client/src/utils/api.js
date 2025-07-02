import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  submitProposal: (id, data) => api.post(`/projects/${id}/proposals`, data),
  getMyProjects: (params) => api.get('/projects/user/my-projects', { params }),
  getCategories: () => api.get('/projects/categories/list'),
};

export const contractsAPI = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  updateStatus: (id, status) => api.put(`/contracts/${id}/status`, { status }),
  addTimeTracking: (id, data) => api.post(`/contracts/${id}/time-tracking`, data),
  approveTimeTracking: (id, entryId) => api.put(`/contracts/${id}/time-tracking/${entryId}/approve`),
  addMessage: (id, data) => api.post(`/contracts/${id}/messages`, data),
  uploadFile: (id, data) => api.post(`/contracts/${id}/files`, data),
  submitReview: (id, data) => api.post(`/contracts/${id}/review`, data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  uploadAvatar: (data) => api.post('/auth/avatar', data),
  getUser: (id) => api.get(`/auth/user/${id}`),
};

export const freelancersAPI = {
  getAll: (params) => api.get('/freelancers', { params }),
  getById: (id) => api.get(`/freelancers/${id}`),
  getTopFreelancers: () => api.get('/freelancers/top'),
};

export default api; 