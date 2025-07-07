import React, { useState } from 'react';

const Deployment = () => {
  const [status, setStatus] = useState('Deployed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRedeploy = async () => {
      setLoading(true);
    setError('');
    try {
      // Mock redeploy
      await new Promise(res => setTimeout(res, 1200));
      setStatus('Deployed (just now)');
    } catch {
      setError('Failed to redeploy');
    }
    setLoading(false);
  };

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Deployment</h1>
      <div className='mb-4'>
        <span className='font-semibold'>Status:</span> {status}
      </div>
      {error && <div className='text-red-600 mb-2'>{error}</div>}
      <button
        onClick={handleRedeploy}
        disabled={loading}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        {loading ? 'Redeploying...' : 'Redeploy'}
      </button>
    </div>
  );
};

export default Deployment;
