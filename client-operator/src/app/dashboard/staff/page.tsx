'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { UserPlus, Trash2 } from 'lucide-react';

interface Staff {
  id: string;
  role: string;
  isActive: boolean;
  user: { email: string };
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const loadStaff = () => {
    api.get('/v1/staff')
      .then((res) => setStaff(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v1/staff', form);
      setForm({ email: '', password: '', fullName: '' });
      setShowForm(false);
      loadStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/v1/staff/${id}`);
      loadStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove staff');
    }
  };

  if (loading) return <p className="text-gray-500">Loading staff...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="px-4 py-2 border border-gray-200 rounded-lg" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2 border border-gray-200 rounded-lg" required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="px-4 py-2 border border-gray-200 rounded-lg" required />
          </div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">Add</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-sm">{s.user?.email}</td>
                <td className="px-4 py-3 text-sm">{s.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.isActive && (
                    <button onClick={() => handleRemove(s.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <p className="p-8 text-center text-gray-500">No staff members</p>}
      </div>
    </div>
  );
}
