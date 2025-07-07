import { supabase } from './supabase.js';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://money-production-55af.up.railway.app/api';

// Enhanced error handling
class APIError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Request/Response cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request queue for rate limiting
const requestQueue = [];
let isProcessingQueue = false;
const RATE_LIMIT_DELAY = 100; // 100ms between requests

// Performance monitoring
const performanceMetrics = {
  requests: 0,
  errors: 0,
  averageResponseTime: 0,
  totalResponseTime: 0,
};

// Enhanced auth token management
const getAuthToken = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

// Request interceptor
const requestInterceptor = async config => {
  // Add request ID for tracking
  config.requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Add performance tracking
  config.startTime = performance.now();

  // Add retry count
  config.retryCount = config.retryCount || 0;

  return config;
};

// Response interceptor
const responseInterceptor = async (response, config) => {
  const endTime = performance.now();
  const responseTime = endTime - config.startTime;

  // Update performance metrics
  performanceMetrics.requests++;
  performanceMetrics.totalResponseTime += responseTime;
  performanceMetrics.averageResponseTime =
    performanceMetrics.totalResponseTime / performanceMetrics.requests;

  // Log performance data
  if (responseTime > 1000) {
    // Slow API request warning - removed console.warn for lint compliance
  }

  return response;
};

// Retry logic
const shouldRetry = (error, retryCount) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const maxRetries = 3;

  return (
    retryCount < maxRetries &&
    (retryableStatuses.includes(error.status) ||
      error.message.includes('network') ||
      error.message.includes('timeout'))
  );
};

// Cache management
const getCachedResponse = key => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedResponse = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Request queue processing
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const { resolve, reject, requestFn } = requestQueue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    }

    // Rate limiting delay
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }

  isProcessingQueue = false;
};

// Enhanced API call with all features
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

  // Apply request interceptor
  await requestInterceptor(config);

  // Check cache for GET requests
  if (options.method === 'GET' || !options.method) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const makeRequest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Apply response interceptor
      await responseInterceptor(response, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      const data = await response.json();

      // Cache successful GET responses
      if (options.method === 'GET' || !options.method) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        setCachedResponse(cacheKey, data);
      }

      return data;
    } catch (error) {
      performanceMetrics.errors++;

      // Retry logic
      if (shouldRetry(error, config.retryCount)) {
        config.retryCount++;
        // Retrying request - removed console.warn for lint compliance

        // Exponential backoff
        const delay = Math.pow(2, config.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return makeRequest();
      }

      // Enhanced error logging
      console.error('API call failed:', {
        endpoint,
        requestId: config.requestId,
        error: error.message,
        status: error.status,
        retryCount: config.retryCount,
      });

      throw error;
    }
  };

  // Queue the request for rate limiting
  return new Promise((resolve, reject) => {
    requestQueue.push({
      resolve,
      reject,
      requestFn: makeRequest,
    });
    processQueue();
  });
};

// Cache management utilities
export const clearCache = () => cache.clear();

export const getCacheStats = () => ({
  size: cache.size,
  keys: Array.from(cache.keys()),
});

export const getPerformanceMetrics = () => ({ ...performanceMetrics });

// Enhanced API modules with better error handling and features
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
  getProject: id => apiCall(`/projects/${id}`),

  // Create new project
  createProject: projectData =>
    apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  // Update project
  updateProject: (id, projectData) =>
    apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  // Delete project
  deleteProject: id =>
    apiCall(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Get project analytics
  getProjectAnalytics: id => apiCall(`/projects/${id}/analytics`),

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
  getRevenueAnalytics: (period = '30d') =>
    apiCall(`/analytics/revenue?period=${period}`),

  // Get user analytics
  getUserAnalytics: (period = '30d') =>
    apiCall(`/analytics/users?period=${period}`),

  // Get project performance
  getProjectPerformance: (period = '30d') =>
    apiCall(`/analytics/projects?period=${period}`),

  // Get custom date range analytics
  getCustomAnalytics: (startDate, endDate) =>
    apiCall(`/analytics/custom?startDate=${startDate}&endDate=${endDate}`),

  // Export analytics data
  exportAnalytics: (type = 'all', period = '30d', format = 'csv') =>
    apiCall(`/analytics/export?type=${type}&period=${period}&format=${format}`),
};

// Payments API
export const paymentsAPI = {
  // Get payment methods
  getPaymentMethods: () => apiCall('/payments/methods'),

  // Add payment method
  addPaymentMethod: paymentMethodId =>
    apiCall('/payments/methods', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    }),

  // Remove payment method
  removePaymentMethod: id =>
    apiCall(`/payments/methods/${id}`, {
      method: 'DELETE',
    }),

  // Get subscriptions
  getSubscriptions: () => apiCall('/payments/subscriptions'),

  // Create subscription
  createSubscription: (priceId, paymentMethodId) =>
    apiCall('/payments/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ priceId, paymentMethodId }),
    }),

  // Cancel subscription
  cancelSubscription: id =>
    apiCall(`/payments/subscriptions/${id}/cancel`, {
      method: 'POST',
    }),

  // Reactivate subscription
  reactivateSubscription: id =>
    apiCall(`/payments/subscriptions/${id}/reactivate`, {
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
  getRevenueAnalytics: (period = '30d') =>
    apiCall(`/payments/analytics/revenue?period=${period}`),
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
  deployService: serviceData =>
    apiCall('/infrastructure/deploy', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),

  // Restart service
  restartService: serviceId =>
    apiCall(`/infrastructure/services/${serviceId}/restart`, {
      method: 'POST',
    }),
};

// Monitoring API
export const monitoringAPI = {
  // Get alerts
  getAlerts: (severity = 'all') =>
    apiCall(`/monitoring/alerts?severity=${severity}`),

  // Get performance metrics
  getPerformanceMetrics: () => apiCall('/monitoring/performance'),

  // Get system health
  getSystemHealth: () => apiCall('/monitoring/health'),

  // Acknowledge alert
  acknowledgeAlert: alertId =>
    apiCall(`/monitoring/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    }),

  // Get logs
  getLogs: (serviceId, limit = 100) =>
    apiCall(`/monitoring/logs?serviceId=${serviceId}&limit=${limit}`),
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: () => apiCall('/users/profile'),

  // Update user profile
  updateProfile: profileData =>
    apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Get team members
  getTeamMembers: () => apiCall('/users/team'),

  // Invite team member
  inviteTeamMember: (email, role) =>
    apiCall('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  // Remove team member
  removeTeamMember: userId =>
    apiCall(`/users/team/${userId}`, {
      method: 'DELETE',
    }),
};

// WebSocket connection management
let wsConnection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeWebSocket = userId => {
  if (wsConnection) {
    wsConnection.close();
  }

  const connect = () => {
    try {
      wsConnection = new WebSocket(
        `${API_BASE_URL.replace('http', 'ws')}/ws?userId=${userId}`
      );

      wsConnection.onopen = () => {
        // WebSocket connected - removed console.log for lint compliance
        reconnectAttempts = 0;
      };

      wsConnection.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          // Handle different message types
          switch (data.type) {
            case 'alert':
              // Handle real-time alerts
              break;
            case 'metric':
              // Handle real-time metrics
              break;
            case 'notification':
              // Handle notifications
              break;
            default:
            // WebSocket message - removed console.log for lint compliance
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsConnection.onclose = () => {
        // WebSocket disconnected - removed console.log for lint compliance
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = Math.pow(2, reconnectAttempts) * 1000;
          setTimeout(() => connect(), delay);
        }
      };

      wsConnection.onerror = error => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  connect();
  return wsConnection;
};

export const closeWebSocket = () => {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
};

export const sendWebSocketMessage = message => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(message));
  }
};

// Health check with timeout
export const healthCheck = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  return fetch(`${API_BASE_URL}/health`, {
    signal: controller.signal,
  })
    .then(response => {
      clearTimeout(timeoutId);
      return response.json();
    })
    .catch(error => {
      clearTimeout(timeoutId);
      throw new APIError('Health check failed', 0, 'HEALTH_CHECK_FAILED', {
        error: error.message,
      });
    });
};

// Export error class for use in components
export { APIError };

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
