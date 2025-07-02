import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response time
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime - startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
      
      // Handle forbidden errors
      if (status === 403) {
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
      }
      
      // Handle validation errors
      if (status === 422) {
        const validationErrors = data.errors || data.message;
        return Promise.reject(new Error(validationErrors));
      }
      
      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      // Handle other errors
      return Promise.reject(new Error(data.message || 'An error occurred'));
    }
    
    // Handle network errors
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    apiKeys: '/auth/api-keys',
    loginHistory: '/auth/login-history',
  },
  
  // Projects
  projects: {
    list: '/projects',
    get: (id) => `/projects/${id}`,
    create: '/projects',
    update: (id) => `/projects/${id}`,
    delete: (id) => `/projects/${id}`,
    deploy: (id) => `/projects/${id}/deploy`,
    restart: (id) => `/projects/${id}/restart`,
    logs: (id) => `/projects/${id}/logs`,
    analytics: (id) => `/projects/${id}/analytics`,
    team: (id) => `/projects/${id}/team`,
    addTeamMember: (id) => `/projects/${id}/team`,
    removeTeamMember: (id, userId) => `/projects/${id}/team/${userId}`,
    stats: '/projects/stats/overview',
    alerts: (id) => `/projects/${id}/alerts`,
  },
  
  // Analytics
  analytics: {
    overview: '/analytics/overview',
    revenue: '/analytics/revenue',
    users: '/analytics/users',
    performance: '/analytics/performance',
    projectAnalytics: (id) => `/analytics/projects/${id}`,
    infrastructure: '/analytics/infrastructure',
    export: '/analytics/export',
    reports: '/analytics/reports',
    realtime: '/analytics/realtime',
    trends: '/analytics/trends',
    compare: '/analytics/compare',
    predictions: '/analytics/predictions',
    alerts: '/analytics/alerts',
    costs: '/analytics/costs',
    roi: '/analytics/roi',
  },
  
  // Infrastructure
  infrastructure: {
    servers: '/infrastructure/servers',
    databases: '/infrastructure/databases',
    ssl: '/infrastructure/ssl',
    backup: '/infrastructure/backup',
    backups: '/infrastructure/backups',
    restore: (id) => `/infrastructure/restore/${id}`,
    storage: '/infrastructure/storage',
    network: '/infrastructure/network',
    security: '/infrastructure/security',
    updateSSL: (id) => `/infrastructure/ssl/${id}`,
    scale: '/infrastructure/scale',
    monitoring: '/infrastructure/monitoring',
    costs: '/infrastructure/costs',
    alerts: '/infrastructure/alerts',
    config: (id) => `/infrastructure/config/${id}`,
    health: '/infrastructure/health',
    logs: '/infrastructure/logs',
    restart: (service) => `/infrastructure/restart/${service}`,
    performance: '/infrastructure/performance',
  },
  
  // Deployment
  deployment: {
    deploy: (id) => `/deployment/deploy/${id}`,
    status: (id) => `/deployment/status/${id}`,
    history: (id) => `/deployment/history/${id}`,
    rollback: (id) => `/deployment/rollback/${id}`,
    cancel: (id) => `/deployment/cancel/${id}`,
    logs: (id) => `/deployment/logs/${id}`,
    config: (id) => `/deployment/config/${id}`,
    updateConfig: (id) => `/deployment/config/${id}`,
    environments: '/deployment/environments',
    createEnvironment: '/deployment/environments',
    stats: '/deployment/stats',
    performance: '/deployment/performance',
    alerts: '/deployment/alerts',
    templates: '/deployment/templates',
    createTemplate: '/deployment/templates',
    health: '/deployment/health',
    costs: '/deployment/costs',
  },
  
  // Monitoring
  monitoring: {
    health: '/monitoring/health',
    dashboard: '/monitoring/dashboard',
    alerts: '/monitoring/alerts',
    acknowledgeAlert: (id) => `/monitoring/alerts/${id}/acknowledge`,
    resolveAlert: (id) => `/monitoring/alerts/${id}/resolve`,
    alertStats: '/monitoring/alerts/stats',
    performance: '/monitoring/performance',
    uptime: '/monitoring/uptime',
    errors: '/monitoring/errors',
    config: '/monitoring/config',
    updateConfig: '/monitoring/config',
    notifications: '/monitoring/notifications',
    addNotification: '/monitoring/notifications',
    testNotification: (id) => `/monitoring/notifications/${id}/test`,
    schedules: '/monitoring/schedules',
    createSchedule: '/monitoring/schedules',
    reports: '/monitoring/reports',
    trends: '/monitoring/trends',
    thresholds: '/monitoring/thresholds',
    updateThreshold: (id) => `/monitoring/thresholds/${id}`,
    status: '/monitoring/status',
    restart: '/monitoring/restart',
  },
  
  // Users
  users: {
    list: '/users',
    get: (id) => `/users/${id}`,
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    stats: '/users/stats/overview',
    activity: (id) => `/users/${id}/activity`,
    permissions: (id) => `/users/${id}/permissions`,
    updatePermissions: (id) => `/users/${id}/permissions`,
    apiKeys: (id) => `/users/${id}/api-keys`,
    revokeApiKey: (id, keyId) => `/users/${id}/api-keys/${keyId}`,
    preferences: (id) => `/users/${id}/preferences`,
    updatePreferences: (id) => `/users/${id}/preferences`,
    team: (projectId) => `/users/team/${projectId}`,
    addTeamMember: (projectId) => `/users/team/${projectId}`,
    removeTeamMember: (projectId, userId) => `/users/team/${projectId}/${userId}`,
    bulk: '/users/bulk',
  },
  
  // Dashboard
  dashboard: {
    overview: '/dashboard/overview',
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Get projects with pagination
  getProjects: async (params = {}) => {
    const response = await api.get(endpoints.projects.list, { params });
    return response.data;
  },
  
  // Get project details
  getProject: async (id) => {
    const response = await api.get(endpoints.projects.get(id));
    return response.data.project;
  },
  
  // Create project
  createProject: async (projectData) => {
    const response = await api.post(endpoints.projects.create, projectData);
    return response.data;
  },
  
  // Update project
  updateProject: async (id, updates) => {
    const response = await api.put(endpoints.projects.update(id), updates);
    return response.data;
  },
  
  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(endpoints.projects.delete(id));
    return response.data;
  },
  
  // Deploy project
  deployProject: async (id, config) => {
    const response = await api.post(endpoints.projects.deploy(id), config);
    return response.data;
  },
  
  // Get project logs
  getProjectLogs: async (id, lines = 100) => {
    const response = await api.get(endpoints.projects.logs(id), {
      params: { lines }
    });
    return response.data.logs;
  },
  
  // Get analytics overview
  getAnalyticsOverview: async () => {
    const response = await api.get(endpoints.analytics.overview);
    return response.data.overview;
  },
  
  // Get revenue analytics
  getRevenueAnalytics: async (period = '30d', groupBy = 'day') => {
    const response = await api.get(endpoints.analytics.revenue, {
      params: { period, groupBy }
    });
    return response.data.revenue;
  },
  
  // Get user analytics
  getUserAnalytics: async (period = '30d', groupBy = 'day') => {
    const response = await api.get(endpoints.analytics.users, {
      params: { period, groupBy }
    });
    return response.data.users;
  },
  
  // Get performance analytics
  getPerformanceAnalytics: async (period = '30d') => {
    const response = await api.get(endpoints.analytics.performance, {
      params: { period }
    });
    return response.data.performance;
  },
  
  // Get infrastructure health
  getInfrastructureHealth: async () => {
    const response = await api.get(endpoints.infrastructure.health);
    return response.data.health;
  },
  
  // Get monitoring dashboard
  getMonitoringDashboard: async () => {
    const response = await api.get(endpoints.monitoring.dashboard);
    return response.data.dashboard;
  },
  
  // Get alerts
  getAlerts: async (page = 1, limit = 10, status, severity) => {
    const response = await api.get(endpoints.monitoring.alerts, {
      params: { page, limit, status, severity }
    });
    return response.data.alerts;
  },
  
  // Get users
  getUsers: async (params = {}) => {
    const response = await api.get(endpoints.users.list, { params });
    return response.data;
  },
  
  // Create user
  createUser: async (userData) => {
    const response = await api.post(endpoints.users.create, userData);
    return response.data;
  },
  
  // Update user
  updateUser: async (id, updates) => {
    const response = await api.put(endpoints.users.update(id), updates);
    return response.data;
  },
  
  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(endpoints.users.delete(id));
    return response.data;
  },
};

export default api; 