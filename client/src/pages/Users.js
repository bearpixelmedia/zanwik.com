import React, { useEffect, useState } from 'react';
import { db } from '../utils/supabase';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await db.users.getAll();
        setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      }
      setLoading(false);
    };
      fetchUsers();
  }, []);

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Users</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border mt-2'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Email</th>
              <th className='p-2 text-left'>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className='border-t'>
                <td className='p-2'>{u.email}</td>
                <td className='p-2'>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
