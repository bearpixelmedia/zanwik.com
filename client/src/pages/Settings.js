import React, { useEffect, useState } from 'react';
import { db } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    db.profiles.getById(user.id)
      .then(data => {
        setProfile(data);
        setName(data?.name || '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await db.profiles.update(user.id, { name });
      setSuccess('Saved!');
    } catch {
      setError('Failed to save');
    }
      setSaving(false);
  };

  if (loading) return <div className='p-4'>Loading...</div>;
  if (error) return <div className='p-4 text-red-600'>{error}</div>;

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Settings</h1>
      <form onSubmit={handleSave} className='space-y-4'>
      <div>
          <label className='block text-sm mb-1'>Email</label>
          <input value={user.email} disabled className='w-full border p-2 rounded bg-gray-100' />
        </div>
              <div>
          <label className='block text-sm mb-1'>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className='w-full border p-2 rounded' />
        </div>
        <button type='submit' disabled={saving} className='bg-blue-600 text-white px-4 py-2 rounded'>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {success && <div className='text-green-600'>{success}</div>}
        {error && <div className='text-red-600'>{error}</div>}
      </form>
    </div>
  );
};

export default Settings;
