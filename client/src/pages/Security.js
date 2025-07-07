import React, { useEffect, useState } from 'react';

const mockSecurityEvents = [
  { id: 1, type: 'Login', timestamp: '2024-01-20 10:30', ip: '192.168.1.1', location: 'San Francisco, CA', status: 'Success' },
  { id: 2, type: 'Failed Login', timestamp: '2024-01-20 09:15', ip: '203.0.113.1', location: 'Unknown', status: 'Failed' },
  { id: 3, type: 'Password Change', timestamp: '2024-01-19 16:45', ip: '192.168.1.1', location: 'San Francisco, CA', status: 'Success' },
];

const Security = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setEvents(mockSecurityEvents);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Security</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Type</th>
              <th className='p-2 text-left'>Timestamp</th>
              <th className='p-2 text-left'>IP Address</th>
              <th className='p-2 text-left'>Location</th>
              <th className='p-2 text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id} className='border-t'>
                <td className='p-2'>{e.type}</td>
                <td className='p-2'>{e.timestamp}</td>
                <td className='p-2'>{e.ip}</td>
                <td className='p-2'>{e.location}</td>
                <td className={`p-2 ${e.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Security; 