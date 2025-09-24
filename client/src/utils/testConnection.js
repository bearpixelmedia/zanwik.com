import { healthCheck } from './api';
import { supabase, testConnection } from './supabase';

export const testBackendConnection = async () => {
  try {
    // Testing backend connection...
    const response = await healthCheck();
    // Backend connection successful
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

export const testAllEndpoints = async () => {
  const endpoints = [
    { name: 'Health Check', test: healthCheck },
    // Add more endpoint tests as needed
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const result = await endpoint.test();
      results.push({ name: endpoint.name, status: '✅ Success', data: result });
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: '❌ Failed',
        error: error.message,
      });
    }
  }

  return results;
};

export const debugApiConnection = () => {
  // API Connection Debug Info - removed console.log for lint compliance
  // API Base URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
  // Environment: process.env.NODE_ENV
  // Current URL: window.location.href

  // Test the connection
  testBackendConnection().then(result => {
    if (result.success) {
      // API connection is working!
    } else {
      console.error('❌ API connection failed:', result.error);
      // Make sure to set REACT_APP_API_URL in your environment variables
    }
  });
};

// Test database connection and basic operations
export const runConnectionTests = async () => {
  // Testing Supabase database connection...

  try {
    // Test 1: Basic connection
    // Test 1: Testing basic connection...
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    // Basic connection successful

    // Test 2: Test projects table
    // Test 2: Testing projects table...
    const { error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (projectsError) {
      console.warn('⚠️ Projects table test failed:', projectsError.message);
    } else {
      // Projects table accessible
    }

    // Test 3: Test users table
    // Test 3: Testing users table...
    const { error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.warn('⚠️ Users table test failed:', usersError.message);
    } else {
      // Users table accessible
    }

    // Test 4: Test analytics table
    // Test 4: Testing analytics table...
    const { error: analyticsError } = await supabase
      .from('analytics')
      .select('count')
      .limit(1);

    if (analyticsError) {
      console.warn('⚠️ Analytics table test failed:', analyticsError.message);
    } else {
      // Analytics table accessible
    }

    // Test 5: Test alerts table
    // Test 5: Testing alerts table...
    const { error: alertsError } = await supabase
      .from('alerts')
      .select('count')
      .limit(1);

    if (alertsError) {
      console.warn('⚠️ Alerts table test failed:', alertsError.message);
    } else {
      // Alerts table accessible
    }

    // Test 6: Test security events
    // Test 6: Testing security events...
    const { error: securityError } = await supabase
      .from('security_events')
      .select('count')
      .limit(1);

    if (securityError) {
      console.warn('⚠️ Security events test failed:', securityError.message);
    } else {
      // Security events accessible
    }

    // Test 7: Test authentication
    // Test 7: Testing authentication...
    const { data: _data, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.warn('⚠️ Authentication test failed:', authError.message);
    } else {
      // Authentication working
      if (_data) {
        // User session found: _data.user.email
      } else {
        // No active user session
      }
    }

    // All connection tests completed!
    return {
      success: true,
      message: 'Database connection successful',
      details: {
        projects: !projectsError,
        users: !usersError,
        analytics: !analyticsError,
        alerts: !alertsError,
        security: !securityError,
        auth: !authError,
      },
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Quick connection check
export const quickConnectionCheck = async () => {
  try {
    const { error } = await supabase.from('projects').select('count').limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    // Database connection successful
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

// Export for use in components
export default {
  runConnectionTests,
  quickConnectionCheck,
};
