import React, { useEffect, useState } from 'react';
import { db } from '../utils/supabase';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'planning' });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await db.projects.getAll();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    try {
      await db.projects.create(form);
      setForm({ name: '', status: 'planning' });
      setShowForm(false);
      // Refresh list
      const data = await db.projects.getAll();
      setProjects(data);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Projects</h1>
        <button onClick={() => setShowForm(v => !v)} className='bg-primary text-white px-4 py-2 rounded'>
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className='mb-4 flex gap-2'>
          <input
            className='border px-2 py-1 rounded flex-1'
            placeholder='Project name'
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <select
            className='border px-2 py-1 rounded'
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            <option value='planning'>Planning</option>
            <option value='active'>Active</option>
            <option value='completed'>Completed</option>
          </select>
          <button type='submit' className='bg-green-600 text-white px-3 py-1 rounded'>Create</button>
        </form>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='text-red-600'>{error}</div>
      ) : (
        <table className='w-full border mt-2'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 text-left'>Name</th>
              <th className='p-2 text-left'>Status</th>
              <th className='p-2 text-left'>Created</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className='border-t'>
                <td className='p-2'>{p.name}</td>
                <td className='p-2'>{p.status}</td>
                <td className='p-2'>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Projects;
