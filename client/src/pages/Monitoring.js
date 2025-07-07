import React, { useEffect, useState } from 'react';

const mockMetrics = [
  { id: 1, service: 'API Gateway', uptime: '99.9%', latency: '120ms', errors: 1 },
  { id: 2, service: 'Postgres DB', uptime: '99.8%', latency: '90ms', errors: 0 },
  { id: 3, service: 'Object Storage', uptime: '98.5%', latency: '200ms', errors: 3 },
];

const Monitoring = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Monitoring</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Service</th>
              <th className='p-2 text-left'>Uptime</th>
              <th className='p-2 text-left'>Latency</th>
              <th className='p-2 text-left'>Errors</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.id} className='border-t'>
                <td className='p-2'>{m.service}</td>
                <td className='p-2'>{m.uptime}</td>
                <td className='p-2'>{m.latency}</td>
                <td className={`p-2 ${m.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>{m.errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Monitoring;
