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