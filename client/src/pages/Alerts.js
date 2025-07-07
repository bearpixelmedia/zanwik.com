import React, { useEffect, useState } from 'react';

const mockAlerts = [
  { id: 1, title: 'High CPU Usage', severity: 'Warning', service: 'Web Server', time: '2 minutes ago', status: 'Active' },
  { id: 2, title: 'Database Connection Slow', severity: 'Error', service: 'Database', time: '5 minutes ago', status: 'Resolved' },
  { id: 3, title: 'Memory Usage High', severity: 'Warning', service: 'API Gateway', time: '10 minutes ago', status: 'Active' },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 800);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-600';
      case 'Error': return 'text-orange-600';
      case 'Warning': return 'text-yellow-600';
      case 'Info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-red-600';
      case 'Resolved': return 'text-green-600';
      case 'Acknowledged': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Alerts</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Title</th>
              <th className='p-2 text-left'>Severity</th>
              <th className='p-2 text-left'>Service</th>
              <th className='p-2 text-left'>Time</th>
              <th className='p-2 text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} className='border-t'>
                <td className='p-2'>{alert.title}</td>
                <td className={`p-2 ${getSeverityColor(alert.severity)}`}>{alert.severity}</td>
                <td className='p-2'>{alert.service}</td>
                <td className='p-2'>{alert.time}</td>
                <td className={`p-2 ${getStatusColor(alert.status)}`}>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Alerts; 