'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Activity, PlayCircle, ShieldCheck, UserCog, Cpu, Zap } from 'lucide-react';

interface AdminUser { id:number; email:string; fullName:string; role:string; isActive:boolean; createdAt:string; }
interface Stats      { totalJobs:number; activeJobs:number; totalUsers:number; }
interface Pipeline   { status:string; lastRun:string; nextRun:string; jobsCollected:number; }
type Tab = 'stats'|'users'|'pipeline';

const ROLE_BADGE: Record<string,string> = {
  ADMIN:'badge badge-red', ANALYST:'badge badge-purple', USER:'badge badge-blue',
};

const TABS: { key:Tab; icon:any; label:string }[] = [
  { key:'stats',    icon:Activity, label:'Statistics'  },
  { key:'users',    icon:Users,    label:'Users'        },
  { key:'pipeline', icon:Cpu,      label:'Pipeline'     },
];

export default function AdminPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [stats,    setStats]    = useState<Stats|null>(null);
  const [pipeline, setPipeline] = useState<Pipeline|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<Tab>('stats');

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get('/admin/stats'), api.get('/admin/pipeline/status')])
      .then(([u,s,p]) => {
        setUsers(u.data.content ?? u.data ?? []);
        setStats(s.data);
        setPipeline(p.data);
      })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateRole = async (id:number, role:string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    setUsers(p => p.map(u => u.id===id ? { ...u, role } : u));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">

      {/* Hero */}
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div style={{ width:40, height:40, borderRadius:8, background:'#DC2626',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <h1 className="page-hero-title">Admin Panel</h1>
            <p className="page-hero-sub">Manage users, monitor platform health, and run data pipelines</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid #E5E7EB', paddingBottom:0 }}>
        {TABS.map(({ key, icon:Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'10px 16px', fontSize:14, fontWeight:600,
              color: tab===key ? '#2557A7' : '#6B7280',
              background:'transparent', border:'none',
              borderBottom: tab===key ? '2px solid #2557A7' : '2px solid transparent',
              cursor:'pointer', transition:'color .12s',
            }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats ? [
            { label:'Total Jobs',  value:stats.totalJobs,  icon:Activity, bg:'#EFF6FF', color:'#1D4ED8' },
            { label:'Active Jobs', value:stats.activeJobs, icon:Activity, bg:'#F0FDF4', color:'#15803D' },
            { label:'Total Users', value:stats.totalUsers, icon:UserCog,  bg:'#F5F3FF', color:'#6D28D9' },
          ].map(({ label, value, icon:Icon, bg, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background:bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize:12, color:'#6B7280', fontWeight:500 }}>{label}</p>
                <p style={{ fontSize:24, fontWeight:700, color:'#111827', marginTop:2, lineHeight:1 }}>
                  {Number(value ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="card col-span-3" style={{ padding:40, textAlign:'center', color:'#9CA3AF' }}>
              No stats available — backend may not be connected.
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card" style={{ overflow:'hidden' }}>
          {users.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Member since</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{
                          width:36, height:36, borderRadius:'50%', background:'#2557A7',
                          color:'#fff', fontSize:13, fontWeight:700,
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        }}>
                          {u.email.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:600, color:'#111827', lineHeight:1.2 }}>
                            {u.fullName || '—'}
                          </p>
                          <p style={{ fontSize:12, color:'#9CA3AF', marginTop:1 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                        className={ROLE_BADGE[u.role] ?? 'badge badge-gray'}
                        style={{ appearance:'none', cursor:'pointer', border:'none', fontWeight:600, padding:'4px 10px' }}>
                        <option>USER</option>
                        <option>ANALYST</option>
                        <option>ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={u.isActive ? 'badge badge-green' : 'badge badge-red'}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize:13, color:'#9CA3AF' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><p className="text-gray-400 text-sm">No users found.</p></div>
          )}
        </div>
      )}

      {/* Pipeline */}
      {tab === 'pipeline' && (
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">Data Pipeline Status</h2>
            <button onClick={() => api.post('/admin/pipeline/trigger')}
              className="btn btn-success btn-sm">
              <PlayCircle size={14} /><Zap size={13} /> Trigger Now
            </button>
          </div>
          <div style={{ padding:20 }}>
            {pipeline ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}
                   className="sm:grid-cols-4">
                {[
                  { lbl:'Status',         val:pipeline.status,                           color:'#1D4ED8' },
                  { lbl:'Jobs Collected', val:pipeline.jobsCollected?.toLocaleString(),   color:'#15803D' },
                  { lbl:'Last Run',       val:pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleString():'—', color:'#6D28D9' },
                  { lbl:'Next Run',       val:pipeline.nextRun ? new Date(pipeline.nextRun).toLocaleString():'—', color:'#B45309' },
                ].map(({ lbl, val, color }) => (
                  <div key={lbl} style={{ padding:14, borderRadius:6, background:'#F9FAFB', border:'1px solid #E5E7EB' }}>
                    <p style={{ fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>
                      {lbl}
                    </p>
                    <p style={{ fontSize:14, fontWeight:700, color }}>{val ?? '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Pipeline status unavailable.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
