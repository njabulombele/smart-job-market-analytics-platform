'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Activity, PlayCircle, RefreshCw } from 'lucide-react';

interface User {
  id: number; email: string; fullName: string;
  role: string; isActive: boolean; createdAt: string;
}
interface Stats { totalJobs: number; activeJobs: number; totalUsers: number; }
interface PipelineStatus { status: string; lastRun: string; nextRun: string; jobsCollected: number; }

export default function AdminPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<'stats' | 'users' | 'pipeline'>('stats');

  useEffect(() => {
    Promise.all([
      api.get('/v1/admin/users'),
      api.get('/v1/admin/stats'),
      api.get('/v1/admin/pipeline/status'),
    ]).then(([u, s, p]) => {
      setUsers(u.data.content ?? []);
      setStats(s.data);
      setPipeline(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const triggerPipeline = async () => {
    await api.post('/v1/admin/pipeline/trigger');
    alert('Pipeline triggered successfully');
  };

  const updateRole = async (id: number, role: string) => {
    await api.put(`/v1/admin/users/${id}/role`, { role });
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['stats', 'users', 'pipeline'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Jobs', value: stats.totalJobs, icon: Activity, color: 'bg-blue-500' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: Activity, color: 'bg-green-500' },
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`${color} rounded-xl p-3`}><Icon className="text-white" size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{Number(value).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <select value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1">
                      <option>USER</option>
                      <option>ANALYST</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium
                      ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pipeline */}
      {tab === 'pipeline' && pipeline && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Pipeline Status</h2>
              <button onClick={triggerPipeline}
                className="flex items-center gap-2 bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700 transition">
                <PlayCircle size={16} /> Trigger Now
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Status', value: pipeline.status },
                { label: 'Jobs Collected', value: pipeline.jobsCollected?.toLocaleString() },
                { label: 'Last Run', value: new Date(pipeline.lastRun).toLocaleString() },
                { label: 'Next Run', value: new Date(pipeline.nextRun).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
