'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, TrendingUp, MapPin, DollarSign, ArrowUpRight, Zap } from 'lucide-react';

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
];

const STAT_ICONS = [Briefcase, TrendingUp, MapPin, DollarSign];

const STAT_DATA = [
  { label: 'Total Jobs',      value: '124,830', change: '+2.4%',  positive: true  },
  { label: 'Active Listings', value: '18,204',  change: '+8.1%',  positive: true  },
  { label: 'Cities Covered',  value: '284',     change: '+5',     positive: true  },
  { label: 'Avg Salary',      value: '$132K',   change: '+$4K',   positive: true  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-medium mb-0.5">{label}</p>
      <p className="text-blue-300">{payload[0].value.toLocaleString()} jobs</p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [topSkills, setTopSkills]     = useState<Array<{ skill: string; jobCount: number }>>([]);
  const [topLocations, setTopLocations] = useState<Array<{ city: string; jobCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.topSkills(8),
      analyticsApi.topLocations(6),
    ]).then(([s, l]) => {
      setTopSkills(s.data ?? []);
      setTopLocations(l.data ?? []);
    }).catch(() => {
      // Show empty state gracefully
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.email?.split('@')[0] ?? 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="page-header">
          <h1>Good day, {firstName} 👋</h1>
          <p>Here&apos;s what&apos;s happening in the job market today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200
                        rounded-xl px-4 py-2">
          <Zap size={14} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">Live data</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_DATA.map(({ label, value, change, positive }, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div key={label} className="stat-card">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENT_COLORS[i]}
                              flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon size={19} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
                <div className={`flex items-center gap-0.5 mt-0.5 text-xs font-medium
                                ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  <ArrowUpRight size={12} />
                  <span>{change} this month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Skills bar chart — wider */}
        <div className="card xl:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">Top Skills in Demand</h2>
            <span className="text-xs text-slate-400">by job count</span>
          </div>
          {topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={topSkills} layout="vertical"
                        margin={{ top: 0, right: 20, bottom: 0, left: 70 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jobCount" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No skill data yet. Add some jobs to see trends." />
          )}
        </div>

        {/* Top cities */}
        <div className="card xl:col-span-2">
          <h2 className="section-title">Top Hiring Cities</h2>
          {topLocations.length > 0 ? (
            <div className="space-y-3.5">
              {topLocations.map((loc, i) => {
                const max = topLocations[0]?.jobCount || 1;
                const pct = Math.round((loc.jobCount / max) * 100);
                const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
                return (
                  <div key={loc.city}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <span className="font-medium text-slate-700">{loc.city}</span>
                      </div>
                      <span className="text-xs text-slate-500">{loc.jobCount?.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]} rounded-full transition-all duration-500`}
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart message="No location data yet." />
          )}
        </div>
      </div>

      {/* Area chart — market activity placeholder */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title mb-0">Market Activity (30 days)</h2>
          <div className="flex gap-1">
            {['1W', '1M', '3M'].map(t => (
              <button key={t}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition
                  ${t === '1M' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={generateActivityData()} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="jobCount" stroke="#3b82f6" strokeWidth={2}
                  fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm text-center px-4">
      {message}
    </div>
  );
}

function generateActivityData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = 450;
  return Array.from({ length: 28 }, (_, i) => ({
    day: i % 7 === 0 ? days[Math.floor(i / 4) % 7] : '',
    jobCount: Math.round(base + Math.sin(i / 3) * 120 + Math.random() * 80),
  }));
}
