import React, { useEffect, useState } from 'react';

const mockResources = [
  { id: 1, name: 'Postgres DB', type: 'Database', status: 'Healthy' },
  { id: 2, name: 'API Gateway', type: 'API', status: 'Healthy' },
  { id: 3, name: 'Object Storage', type: 'Storage', status: 'Degraded' },
];

const Infrastructure = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    // Mock fetch
    setTimeout(() => {
      setResources(mockResources);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Infrastructure</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Name</th>
              <th className='p-2 text-left'>Type</th>
              <th className='p-2 text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id} className='border-t'>
                <td className='p-2'>{r.name}</td>
                <td className='p-2'>{r.type}</td>
                <td className={`p-2 ${r.status === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Infrastructure;
