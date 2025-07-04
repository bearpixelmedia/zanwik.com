import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://money-production-55af.up.railway.app/api';

// Helper function to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Projects API
export const projectsAPI = {
  // Get all projects with filtering and pagination
  getProjects: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    return apiCall(`/projects?${queryParams.toString()}`);
  },

  // Get single project
  getProject: (id) => apiCall(`/projects/${id}`),

  // Create new project
  createProject: (projectData) => apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  // Update project
  updateProject: (id, projectData) => apiCall(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  // Delete project
  deleteProject: (id) => apiCall(`/projects/${id}`, {
    method: 'DELETE',
  }),

  // Get project analytics
  getProjectAnalytics: (id) => apiCall(`/projects/${id}/analytics`),

  // Get project categories
  getCategories: () => apiCall('/projects/categories/list'),

  // Get project statistics
  getStats: () => apiCall('/projects/stats/overview'),
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard overview
  getDashboardOverview: () => apiCall('/analytics/dashboard/public'),

  // Get revenue analytics
  getRevenueAnalytics: (period = '30d') => apiCall(`/analytics/revenue?period=${period}`),

  // Get user analytics
  getUserAnalytics: (period = '30d') => apiCall(`/analytics/users?period=${period}`),

  // Get project performance
  getProjectPerformance: (period = '30d') => apiCall(`/analytics/projects?period=${period}`),

  // Get custom date range analytics
  getCustomAnalytics: (startDate, endDate) => 
    apiCall(`/analytics/custom?startDate=${startDate}&endDate=${endDate}`),
};

// Payments API
export const paymentsAPI = {
  // Get payment methods
  getPaymentMethods: () => apiCall('/payments/methods'),

  // Add payment method
  addPaymentMethod: (paymentMethodId) => apiCall('/payments/methods', {
    method: 'POST',
    body: JSON.stringify({ paymentMethodId }),
  }),

  // Remove payment method
  removePaymentMethod: (id) => apiCall(`/payments/methods/${id}`, {
    method: 'DELETE',
  }),

  // Get subscriptions
  getSubscriptions: () => apiCall('/payments/subscriptions'),

  // Create subscription
  createSubscription: (priceId, paymentMethodId) => apiCall('/payments/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ priceId, paymentMethodId }),
  }),

  // Cancel subscription
  cancelSubscription: (id) => apiCall(`/payments/subscriptions/${id}/cancel`, {
    method: 'POST',
  }),

  // Reactivate subscription
  reactivateSubscription: (id) => apiCall(`/payments/subscriptions/${id}/reactivate`, {
    method: 'POST',
  }),

  // Get invoices
  getInvoices: () => apiCall('/payments/invoices'),

  // Create payment intent
  createPaymentIntent: (amount, currency = 'usd', description) => 
    apiCall('/payments/payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, description }),
    }),

  // Get revenue analytics
  getRevenueAnalytics: (period = '30d') => apiCall(`/payments/analytics/revenue?period=${period}`),
};

// Infrastructure API
export const infrastructureAPI = {
  // Get system status
  getSystemStatus: () => apiCall('/infrastructure/status'),

  // Get service metrics
  getServiceMetrics: () => apiCall('/infrastructure/metrics'),

  // Get resource usage
  getResourceUsage: () => apiCall('/infrastructure/resources'),

  // Deploy service
  deployService: (serviceData) => apiCall('/infrastructure/deploy', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),

  // Restart service
  restartService: (serviceId) => apiCall(`/infrastructure/services/${serviceId}/restart`, {
    method: 'POST',
  }),
};

// Monitoring API
export const monitoringAPI = {
  // Get alerts
  getAlerts: (severity = 'all') => apiCall(`/monitoring/alerts?severity=${severity}`),

  // Get performance metrics
  getPerformanceMetrics: () => apiCall('/monitoring/performance'),

  // Get system health
  getSystemHealth: () => apiCall('/monitoring/health'),

  // Acknowledge alert
  acknowledgeAlert: (alertId) => apiCall(`/monitoring/alerts/${alertId}/acknowledge`, {
    method: 'POST',
  }),

  // Get logs
  getLogs: (serviceId, limit = 100) => apiCall(`/monitoring/logs?serviceId=${serviceId}&limit=${limit}`),
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: () => apiCall('/users/profile'),

  // Update user profile
  updateProfile: (profileData) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Get team members
  getTeamMembers: () => apiCall('/users/team'),

  // Invite team member
  inviteTeamMember: (email, role) => apiCall('/users/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),

  // Remove team member
  removeTeamMember: (userId) => apiCall(`/users/team/${userId}`, {
    method: 'DELETE',
  }),
};

// Real-time WebSocket connection
export const initializeWebSocket = (userId) => {
  const socket = new WebSocket(`ws://localhost:3000`);
  
  socket.onopen = () => {
    console.log('WebSocket connected');
    socket.send(JSON.stringify({ type: 'join-user', userId }));
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('WebSocket message:', data);
    
    // Handle different types of real-time updates
    switch (data.type) {
      case 'project-created':
        // Handle project creation
        break;
      case 'project-updated':
        // Handle project update
        break;
      case 'project-deleted':
        // Handle project deletion
        break;
      case 'alert-created':
        // Handle new alert
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return socket;
};

// Health check
export const healthCheck = () => apiCall('/health');

const api = {
  projects: projectsAPI,
  analytics: analyticsAPI,
  payments: paymentsAPI,
  infrastructure: infrastructureAPI,
  monitoring: monitoringAPI,
  users: usersAPI,
  healthCheck,
  initializeWebSocket,
};

export default api; 