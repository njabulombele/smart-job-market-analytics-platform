'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, TrendingUp, MapPin, DollarSign, ArrowUpRight, Sparkles } from 'lucide-react';

const STATS = [
  { label: 'Total Jobs',      value: '124,830', delta: '+2.4%', icon: Briefcase,  bg: '#EBF2FF', color: '#2557A7' },
  { label: 'Active Listings', value: '18,204',  delta: '+8.1%', icon: TrendingUp, bg: '#E6F5EC', color: '#0D7D44' },
  { label: 'Cities Covered',  value: '284',     delta: '+5',    icon: MapPin,     bg: '#F0EDFB', color: '#5B35A5' },
  { label: 'Average Salary',  value: 'R2.4M',   delta: '+R72K',  icon: DollarSign, bg: '#FFF3D6', color: '#7C4F00' },
];

const COLORS = ['#2557A7','#5B35A5','#0D9488','#0D7D44','#7C4F00','#CC1016','#0891B2','#9333EA'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <p style={{ color: 'var(--gray-400)', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: 13 }}>
        {Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

function activityData() {
  return Array.from({ length: 28 }, (_, i) => ({
    day: i % 7 === 0 ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i / 7 | 0] : '',
    value: Math.round(420 + Math.sin(i / 3.5) * 100 + Math.random() * 80),
  }));
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [skills,  setSkills]  = useState<{ skill: string; jobCount: number }[]>([]);
  const [cities,  setCities]  = useState<{ city: string; jobCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.topSkills(8), analyticsApi.topLocations(6)])
      .then(([s, l]) => { setSkills(s.data ?? []); setCities(l.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = user?.email?.split('@')[0] ?? 'there';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>
          Good day, {name} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginTop: 2 }}>
          Here&apos;s what&apos;s happening in the job market today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STATS.map(({ label, value, delta, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.2, marginTop: 2 }}>
                {value}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                <ArrowUpRight size={11} style={{ color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{delta} this month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top skills */}
        <div className="card" style={{ gridColumn: window?.innerWidth < 900 ? '1 / -1' : undefined }}>
          <div className="section-header">
            <h2 className="section-title">Top Skills in Demand</h2>
            <span className="badge badge-blue">by job count</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {skills.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={skills} layout="vertical"
                          margin={{ top: 0, right: 8, bottom: 0, left: 74 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--gray-300)' }}
                         axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="skill"
                         tick={{ fontSize: 12, fill: 'var(--gray-700)', fontWeight: 500 }}
                         axisLine={false} tickLine={false} width={74} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="jobCount" radius={[0, 4, 4, 0]} maxBarSize={14}>
                    {skills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><Sparkles size={22} style={{ color: 'var(--gray-300)' }} /></div>
                <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>No skill data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top cities */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">Top Hiring Cities</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {cities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cities.map((c, i) => {
                  const max = cities[0]?.jobCount || 1;
                  const pct = Math.round((c.jobCount / max) * 100);
                  const col = COLORS[i % COLORS.length];
                  return (
                    <div key={c.city}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{c.city}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>
                          {c.jobCount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: col }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><MapPin size={22} style={{ color: 'var(--gray-300)' }} /></div>
                <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>No location data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity chart */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Market Activity — 30 days</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1W', '1M', '3M'].map(t => (
              <button key={t} style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 700, borderRadius: 4,
                background: t === '1M' ? 'var(--blue)' : 'transparent',
                color: t === '1M' ? '#fff' : 'var(--gray-400)',
                border: t === '1M' ? 'none' : '1px solid var(--gray-200)',
                cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '8px 20px 16px' }}>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={activityData()} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2557A7" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2557A7" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--gray-300)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--gray-300)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="value" stroke="#2557A7" strokeWidth={2}
                    fill="url(#aG)" dot={false}
                    activeDot={{ r: 4, fill: '#2557A7', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
