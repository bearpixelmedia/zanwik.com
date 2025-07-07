import React, { useEffect, useState } from 'react';
import { db } from '../utils/supabase';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await db.analytics.getOverview();
        setOverview(data);
      } catch (err) {
        setError('Failed to load analytics');
      }
      setLoading(false);
    };
    fetchOverview();
  }, []);

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Analytics Overview</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : overview ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='p-4 border rounded'>
            <div className='text-gray-500 text-sm'>Total Revenue</div>
            <div className='text-2xl font-bold'>
              ${overview.revenue?.toLocaleString() || 0}
            </div>
          </div>
          <div className='p-4 border rounded'>
            <div className='text-gray-500 text-sm'>Total Users</div>
            <div className='text-2xl font-bold'>
              {overview.users?.toLocaleString() || 0}
            </div>
          </div>
          <div className='p-4 border rounded'>
            <div className='text-gray-500 text-sm'>Growth</div>
            <div className='text-2xl font-bold'>{overview.growth || 0}%</div>
          </div>
        </div>
      ) : (
        <div>No analytics data available.</div>
      )}
    </div>
  );
};

export default Analytics;
