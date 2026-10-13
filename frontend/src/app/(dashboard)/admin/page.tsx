'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Activity, PlayCircle, ShieldCheck, UserCog, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser { id: number; email: string; fullName: string; role: string; isActive: boolean; createdAt: string; }
interface Stats       { totalJobs: number; activeJobs: number; totalUsers: number; }
interface Pipeline    { status: string; lastRun: string; nextRun: string; jobsCollected: number; }

type Tab = 'stats' | 'users' | 'pipeline';

export default function AdminPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>('stats');

  useEffect(() => {
    // Fixed: baseURL already contains /api/v1 so paths start from there
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/stats'),
      api.get('/admin/pipeline/status'),
    ]).then(([u, s, p]) => {
      setUsers(u.data.content ?? u.data ?? []);
      setStats(s.data);
      setPipeline(p.data);
    }).catch(() => { /* graceful empty state */ })
    .finally(() => setLoading(false));
  }, []);

  const triggerPipeline = async () => {
    await api.post('/admin/pipeline/trigger');
  };

  const updateRole = async (id: number, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const TABS: { key: Tab; icon: typeof Activity; label: string }[] = [
    { key: 'stats',    icon: Activity,   label: 'Stats' },
    { key: 'users',    icon: Users,      label: 'Users' },
    { key: 'pipeline', icon: Cpu,        label: 'Pipeline' },
  ];

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600
                        flex items-center justify-center shadow-md shadow-rose-500/25">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage users, monitor platform health, and run pipelines</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-150',
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      {tab === 'stats' && (
        <div className="space-y-4">
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Jobs',   value: stats.totalJobs,  icon: Activity,  grad: 'from-blue-500 to-blue-600' },
                { label: 'Active Jobs',  value: stats.activeJobs, icon: Activity,  grad: 'from-emerald-500 to-emerald-600' },
                { label: 'Total Users',  value: stats.totalUsers, icon: UserCog,   grad: 'from-violet-500 to-violet-600' },
              ].map(({ label, value, icon: Icon, grad }) => (
                <div key={label} className="stat-card">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad}
                                  flex items-center justify-center shadow-md`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{Number(value ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center text-slate-400 py-12">
              No stats available. Backend may not be connected.
            </div>
          )}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="card !p-0 overflow-hidden">
          {users.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500
                                        flex items-center justify-center text-white text-xs font-bold">
                          {user.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.fullName || '—'}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select value={user.role} onChange={e => updateRole(user.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                        <option value="USER">USER</option>
                        <option value="ANALYST">ANALYST</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={cn(
                        'badge',
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      )}>
                        {user.isActive ? '● Active' : '○ Disabled'}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-slate-400 py-12">No users found.</div>
          )}
        </div>
      )}

      {/* ── Pipeline ── */}
      {tab === 'pipeline' && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Data Pipeline Status</h2>
            <button onClick={triggerPipeline}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white
                         rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm shadow-emerald-600/20">
              <PlayCircle size={15} /> Trigger Now
            </button>
          </div>

          {pipeline ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Status',         value: pipeline.status },
                { label: 'Jobs Collected', value: pipeline.jobsCollected?.toLocaleString() },
                { label: 'Last Run',       value: pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleString() : '—' },
                { label: 'Next Run',       value: pipeline.nextRun ? new Date(pipeline.nextRun).toLocaleString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-800">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">Pipeline status unavailable.</div>
          )}
        </div>
      )}
    </div>
  );
}
