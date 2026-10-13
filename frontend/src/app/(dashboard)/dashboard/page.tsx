'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, TrendingUp, MapPin, DollarSign, ArrowUpRight, Zap, Sparkles } from 'lucide-react';

const STAT_DATA = [
  { label: 'Total Jobs',      value: '124,830', change: '+2.4%', icon: Briefcase,  from: 'from-blue-500',    to: 'to-indigo-600',   shadow: 'shadow-blue-500/30',    ring: 'ring-blue-100',   text: 'text-blue-600'   },
  { label: 'Active Listings', value: '18,204',  change: '+8.1%', icon: TrendingUp, from: 'from-emerald-500', to: 'to-teal-600',     shadow: 'shadow-emerald-500/30', ring: 'ring-emerald-100',text: 'text-emerald-600'},
  { label: 'Cities Covered',  value: '284',     change: '+5',    icon: MapPin,     from: 'from-violet-500',  to: 'to-purple-600',   shadow: 'shadow-violet-500/30',  ring: 'ring-violet-100', text: 'text-violet-600' },
  { label: 'Avg Salary',      value: '$132K',   change: '+$4K',  icon: DollarSign, from: 'from-amber-400',   to: 'to-orange-500',   shadow: 'shadow-amber-400/30',   ring: 'ring-amber-100',  text: 'text-amber-600'  },
];

const BAR_COLORS = ['#6366f1','#3b82f6','#06b6d4','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444'];
const CITY_COLORS= ['bg-gradient-to-r from-blue-500 to-indigo-500',
                    'bg-gradient-to-r from-violet-500 to-purple-500',
                    'bg-gradient-to-r from-emerald-500 to-teal-500',
                    'bg-gradient-to-r from-amber-400 to-orange-400',
                    'bg-gradient-to-r from-rose-400 to-pink-400',
                    'bg-gradient-to-r from-cyan-400 to-blue-400'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-indigo-800/30">
      <p className="text-indigo-300 mb-0.5 font-medium">{label}</p>
      <p className="text-white font-bold">{Number(payload[0].value).toLocaleString()} jobs</p>
    </div>
  );
};

function generateActivityData() {
  const labels = ['Mon','','','Tue','','','Wed','','','Thu','','','Fri','','','Sat','','','Sun','','','Mon','','','Tue','','','Wed'];
  const base = 450;
  return labels.map((day, i) => ({
    day,
    jobCount: Math.round(base + Math.sin(i / 3) * 130 + Math.random() * 90),
  }));
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [topSkills,    setTopSkills]    = useState<Array<{ skill: string; jobCount: number }>>([]);
  const [topLocations, setTopLocations] = useState<Array<{ city: string; jobCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.topSkills(8), analyticsApi.topLocations(6)])
      .then(([s, l]) => { setTopSkills(s.data ?? []); setTopLocations(l.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.email?.split('@')[0] ?? 'there';

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="spinner" /></div>
  );

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Hero banner ── */}
      <div className="hero-blue rounded-2xl px-6 py-5 flex items-center justify-between
                      border border-indigo-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight
                         bg-gradient-to-r from-indigo-700 to-blue-500 bg-clip-text text-transparent">
            Good day, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening in the job market today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2
                        bg-gradient-to-r from-emerald-500 to-teal-500
                        text-white rounded-xl px-4 py-2 shadow-md shadow-emerald-500/25">
          <Zap size={14} />
          <span className="text-xs font-bold">Live data</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_DATA.map(({ label, value, change, icon: Icon, from, to, shadow, ring, text }) => (
          <div key={label} className={`stat-card ring-1 ${ring}`}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${from} ${to}
                            flex items-center justify-center flex-shrink-0
                            shadow-lg ${shadow}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
              <div className={`flex items-center gap-0.5 mt-0.5 text-xs font-bold ${text}`}>
                <ArrowUpRight size={12} /><span>{change} this month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Skills bar chart */}
        <div className="card card-accent-indigo xl:col-span-3">
          <div className="section-banner hero-blue rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3 flex items-center justify-between">
            <h2 className="section-title !mb-0 !text-indigo-700">Top Skills in Demand</h2>
            <span className="text-xs text-indigo-500 font-semibold bg-indigo-100 rounded-full px-2.5 py-0.5">
              by job count
            </span>
          </div>
          {topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 70 }}>
                <defs>
                  {topSkills.map((_, i) => (
                    <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={BAR_COLORS[(i + 1) % BAR_COLORS.length]} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                       axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="jobCount" radius={[0, 8, 8, 0]}>
                  {topSkills.map((_, i) => (
                    <Cell key={i} fill={`url(#bg${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="empty-icon"><Sparkles size={24} className="text-indigo-400" /></div>
              <p className="text-slate-400 text-sm">No skill data yet.</p>
            </div>
          )}
        </div>

        {/* Top cities */}
        <div className="card card-accent-emerald xl:col-span-2">
          <div className="section-banner hero-emerald rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
            <h2 className="section-title !mb-0 !text-emerald-700">Top Hiring Cities</h2>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-3.5">
              {topLocations.map((loc, i) => {
                const max = topLocations[0]?.jobCount || 1;
                const pct = Math.round((loc.jobCount / max) * 100);
                return (
                  <div key={loc.city}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-300 w-4">{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-700">{loc.city}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        {loc.jobCount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${CITY_COLORS[i]} rounded-full transition-all duration-700`}
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="empty-icon"><MapPin size={24} className="text-emerald-400" /></div>
              <p className="text-slate-400 text-sm">No location data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Area chart ── */}
      <div className="card card-accent-violet">
        <div className="section-banner hero-violet rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3 flex items-center justify-between">
          <h2 className="section-title !mb-0 !text-violet-700">Market Activity (30 days)</h2>
          <div className="flex gap-1">
            {['1W','1M','3M'].map(t => (
              <button key={t}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition
                  ${t === '1M'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm'
                    : 'text-violet-500 hover:bg-violet-100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={generateActivityData()} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="jobCount" stroke="#8b5cf6" strokeWidth={2.5}
                  fill="url(#areaViolet)" dot={false}
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
