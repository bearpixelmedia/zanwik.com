import React, { useEffect, useState } from 'react';
import { db } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    db.users
      .getById(user.id)
      .then(data => {
        setName(data?.full_name || '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await db.users.update(user.id, { full_name: name });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Settings</h1>
      {error && <div className='text-red-600 mb-4'>{error}</div>}
      {success && <div className='text-green-600 mb-4'>{success}</div>}
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium mb-1'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={user.email}
            disabled
            className='w-full border p-2 rounded bg-gray-100'
          />
        </div>
        <div>
          <label htmlFor='name' className='block text-sm font-medium mb-1'>
            Display Name
          </label>
          <input
            id='name'
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            className='w-full border p-2 rounded'
          />
        </div>
        <button
          type='submit'
          disabled={saving}
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
