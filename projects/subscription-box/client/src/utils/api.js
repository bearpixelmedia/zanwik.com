import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 500 errors (server error)
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API functions for different endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
};

export const subscriptionAPI = {
  // Business owner endpoints
  getSubscriptions: () => api.get('/subscriptions'),
  createSubscription: (subscriptionData) => api.post('/subscriptions', subscriptionData),
  getSubscription: (id) => api.get(`/subscriptions/${id}`),
  updateSubscription: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
  deleteSubscription: (id) => api.delete(`/subscriptions/${id}`),
  
  // Customer endpoints
  getMySubscriptions: () => api.get('/subscriptions/my-subscriptions'),
  subscribe: (id, subscriptionData) => api.post(`/subscriptions/${id}/subscribe`, subscriptionData),
  pauseSubscription: (id, reason) => api.put(`/subscriptions/${id}/pause`, { reason }),
  resumeSubscription: (id) => api.put(`/subscriptions/${id}/resume`),
  cancelSubscription: (id) => api.put(`/subscriptions/${id}/cancel`),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  createProduct: (productData) => api.post('/products', productData),
  getProduct: (id) => api.get(`/products/${id}`),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stockData) => api.put(`/products/${id}/stock`, stockData),
  getLowStockProducts: () => api.get('/products/low-stock'),
  getCategories: () => api.get('/products/categories'),
  addVariant: (id, variantData) => api.post(`/products/${id}/variants`, variantData),
};

export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getSubscribers: (params) => api.get('/analytics/subscribers', { params }),
  getProducts: () => api.get('/analytics/products'),
  getOrders: (params) => api.get('/analytics/orders', { params }),
  getChurn: (params) => api.get('/analytics/churn', { params }),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return `Bad request: ${message}`;
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access forbidden. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return `Validation error: ${message}`;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

// Utility function to format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Utility function to format dates
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Utility function to format date and time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export default api; 