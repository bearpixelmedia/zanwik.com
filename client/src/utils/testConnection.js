import { healthCheck } from './api';

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
      results.push({ name: endpoint.name, status: '❌ Failed', error: error.message });
    }
  }

  return results;
};

export const debugApiConnection = () => {
  console.log('🔍 API Connection Debug Info:');
  console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.href);
  
  // Test the connection
  testBackendConnection().then(result => {
    if (result.success) {
      console.log('✅ API connection is working!');
    } else {
      console.log('❌ API connection failed:', result.error);
      console.log('💡 Make sure to set REACT_APP_API_URL in your environment variables');
    }
  });
}; 