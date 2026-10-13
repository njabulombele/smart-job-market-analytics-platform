'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Activity, PlayCircle, ShieldCheck, UserCog, Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser { id: number; email: string; fullName: string; role: string; isActive: boolean; createdAt: string; }
interface Stats      { totalJobs: number; activeJobs: number; totalUsers: number; }
interface Pipeline   { status: string; lastRun: string; nextRun: string; jobsCollected: number; }
type Tab = 'stats' | 'users' | 'pipeline';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:   'bg-rose-100 text-rose-700 border-rose-200',
  ANALYST: 'bg-violet-100 text-violet-700 border-violet-200',
  USER:    'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AdminPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>('stats');

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/stats'),
      api.get('/admin/pipeline/status'),
    ]).then(([u, s, p]) => {
      setUsers(u.data.content ?? u.data ?? []);
      setStats(s.data);
      setPipeline(p.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const triggerPipeline = async () => { await api.post('/admin/pipeline/trigger'); };
  const updateRole = async (id: number, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const TABS = [
    { key: 'stats'    as Tab, icon: Activity, label: 'Stats',    active: 'from-blue-500 to-indigo-500'    },
    { key: 'users'    as Tab, icon: Users,    label: 'Users',    active: 'from-violet-500 to-purple-500'  },
    { key: 'pipeline' as Tab, icon: Cpu,      label: 'Pipeline', active: 'from-emerald-500 to-teal-500'   },
  ];

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Hero ── */}
      <div className="hero-rose rounded-2xl px-6 py-5 border border-rose-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600
                          flex items-center justify-center shadow-md shadow-rose-500/30">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight
                           bg-gradient-to-r from-rose-600 to-red-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage users, monitor platform health, run pipelines</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {TABS.map(({ key, icon: Icon, label, active }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150',
              tab === key
                ? `bg-gradient-to-r ${active} text-white shadow-md`
                : 'bg-white text-slate-500 border border-indigo-100 hover:border-indigo-300 hover:text-indigo-600'
            )}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats ? [
            { label: 'Total Jobs',  value: stats.totalJobs,  icon: Activity, from: 'from-blue-500',    to: 'to-indigo-600',  shadow: 'shadow-blue-500/30',    ring: 'ring-blue-100'   },
            { label: 'Active Jobs', value: stats.activeJobs, icon: Activity, from: 'from-emerald-500', to: 'to-teal-600',    shadow: 'shadow-emerald-500/30', ring: 'ring-emerald-100'},
            { label: 'Total Users', value: stats.totalUsers, icon: UserCog,  from: 'from-violet-500',  to: 'to-purple-600',  shadow: 'shadow-violet-500/30',  ring: 'ring-violet-100' },
          ].map(({ label, value, icon: Icon, from, to, shadow, ring }) => (
            <div key={label} className={`stat-card ring-1 ${ring}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${from} ${to}
                              flex items-center justify-center shadow-lg ${shadow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{Number(value ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )) : (
            <div className="col-span-3 card text-center text-slate-400 py-12">
              No stats available. Backend may not be connected.
            </div>
          )}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="card card-accent-violet !p-0 overflow-hidden">
          {users.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Status</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500
                                        flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                          {user.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName || '—'}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select value={user.role}
                        onChange={e => updateRole(user.id, e.target.value)}
                        className={cn(
                          'text-xs border rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400',
                          ROLE_COLORS[user.role] ?? 'bg-slate-50 text-slate-600 border-slate-200'
                        )}>
                        <option>USER</option><option>ANALYST</option><option>ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={cn(
                        'badge border font-bold',
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      )}>
                        {user.isActive ? '● Active' : '○ Disabled'}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-slate-400 py-12 font-medium">No users found.</div>
          )}
        </div>
      )}

      {/* ── Pipeline ── */}
      {tab === 'pipeline' && (
        <div className="card card-accent-emerald space-y-5">
          <div className="section-banner hero-emerald rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3
                          flex items-center justify-between">
            <h2 className="section-title !mb-0 !text-emerald-700">Data Pipeline Status</h2>
            <button onClick={triggerPipeline}
              className="btn-success flex items-center gap-2 py-2 px-4 text-xs">
              <PlayCircle size={14} /><Zap size={13} /> Trigger Now
            </button>
          </div>

          {pipeline ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Status',         value: pipeline.status,                                      bg: 'from-blue-50 to-indigo-50',    border: 'border-blue-200',    text: 'text-blue-700'   },
                { label: 'Jobs Collected', value: pipeline.jobsCollected?.toLocaleString(),              bg: 'from-emerald-50 to-teal-50',   border: 'border-emerald-200', text: 'text-emerald-700'},
                { label: 'Last Run',       value: pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleString() : '—', bg: 'from-violet-50 to-purple-50',border: 'border-violet-200', text: 'text-violet-700' },
                { label: 'Next Run',       value: pipeline.nextRun ? new Date(pipeline.nextRun).toLocaleString() : '—', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200',  text: 'text-amber-700'  },
              ].map(({ label, value, bg, border, text }) => (
                <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-xl p-4`}>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-sm font-extrabold ${text}`}>{value ?? '—'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8 font-medium">Pipeline status unavailable.</div>
          )}
        </div>
      )}
    </div>
  );
}
