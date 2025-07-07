import React, { useEffect, useState } from 'react';

const mockPerformanceData = [
  {
    id: 1,
    metric: 'Page Load Time',
    value: '1.2s',
    status: 'Good',
    trend: '+0.1s',
  },
  {
    id: 2,
    metric: 'API Response Time',
    value: '120ms',
    status: 'Good',
    trend: '-10ms',
  },
  {
    id: 3,
    metric: 'Database Query Time',
    value: '45ms',
    status: 'Excellent',
    trend: '-5ms',
  },
  {
    id: 4,
    metric: 'Memory Usage',
    value: '67%',
    status: 'Warning',
    trend: '+5%',
  },
];

const Performance = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setMetrics(mockPerformanceData);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = status => {
    switch (status) {
      case 'Excellent':
        return 'text-green-600';
      case 'Good':
        return 'text-blue-600';
      case 'Warning':
        return 'text-yellow-600';
      case 'Critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Performance</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Metric</th>
              <th className='p-2 text-left'>Current Value</th>
              <th className='p-2 text-left'>Status</th>
              <th className='p-2 text-left'>Trend</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.id} className='border-t'>
                <td className='p-2'>{m.metric}</td>
                <td className='p-2 font-medium'>{m.value}</td>
                <td className={`p-2 ${getStatusColor(m.status)}`}>
                  {m.status}
                </td>
                <td className='p-2 text-sm text-gray-600'>{m.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Performance;
