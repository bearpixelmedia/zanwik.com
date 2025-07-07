import { healthCheck } from './api.js';
import { supabase, testConnection } from './supabase.js';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await healthCheck();
    console.log('✅ Backend connection successful:', response);
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
  console.log('🔍 API Connection Debug Info:');
  console.log(
    'API Base URL:',
    process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
  );
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.href);

  // Test the connection
  testBackendConnection().then(result => {
    if (result.success) {
      console.log('✅ API connection is working!');
    } else {
      console.log('❌ API connection failed:', result.error);
      console.log(
        '💡 Make sure to set REACT_APP_API_URL in your environment variables'
      );
    }
  });
};

// Test database connection and basic operations
export const runConnectionTests = async () => {
  console.log('🔍 Testing Supabase database connection...');

  try {
    // Test 1: Basic connection
    console.log('📡 Test 1: Testing basic connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    console.log('✅ Basic connection successful');

    // Test 2: Test projects table
    console.log('📊 Test 2: Testing projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (projectsError) {
      console.warn('⚠️ Projects table test failed:', projectsError.message);
    } else {
      console.log('✅ Projects table accessible');
    }

    // Test 3: Test users table
    console.log('👥 Test 3: Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.warn('⚠️ Users table test failed:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 4: Test analytics table
    console.log('📈 Test 4: Testing analytics table...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_overview')
      .select('count')
      .limit(1);

    if (analyticsError) {
      console.warn('⚠️ Analytics table test failed:', analyticsError.message);
    } else {
      console.log('✅ Analytics table accessible');
    }

    // Test 5: Test alerts table
    console.log('🚨 Test 5: Testing alerts table...');
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('count')
      .limit(1);

    if (alertsError) {
      console.warn('⚠️ Alerts table test failed:', alertsError.message);
    } else {
      console.log('✅ Alerts table accessible');
    }

    // Test 6: Test authentication
    console.log('🔐 Test 6: Testing authentication...');
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      console.warn('⚠️ Authentication test failed:', authError.message);
    } else {
      console.log('✅ Authentication working');
      if (session) {
        console.log('👤 User session found:', session.user.email);
      } else {
        console.log('👤 No active user session');
      }
    }

    console.log('🎉 All connection tests completed!');
    return {
      success: true,
      message: 'Database connection successful',
      details: {
        projects: !projectsError,
        users: !usersError,
        analytics: !analyticsError,
        alerts: !alertsError,
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
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
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
