'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp, DollarSign } from 'lucide-react';

const SKILLS = ['Python', 'Java', 'AWS', 'Kubernetes', 'React', 'Go', 'TypeScript', 'Rust'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="font-semibold text-blue-300">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [topSkills,    setTopSkills]    = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [salaryStats,  setSalaryStats]  = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [trends,       setTrends]       = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('Python');
  const [salarySkill,   setSalarySkill]   = useState('');
  const [salaryCity,    setSalaryCity]    = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.topSkills(12),
      analyticsApi.topLocations(8),
    ]).then(([s, l]) => {
      setTopSkills(s.data ?? []);
      setTopLocations(l.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    analyticsApi.trends(selectedSkill, 12)
      .then(r => setTrends(r.data ?? []))
      .catch(() => setTrends([]));
  }, [selectedSkill]);

  const fetchSalary = async () => {
    setSalaryLoading(true);
    try {
      const r = await analyticsApi.salaryStats(salarySkill || undefined, salaryCity || undefined);
      setSalaryStats(r.data);
    } catch {
      setSalaryStats(null);
    } finally {
      setSalaryLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="page-header">
        <h1>Market Analytics</h1>
        <p>Real-time insights from thousands of job postings</p>
      </div>

      {/* Skills chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title mb-0">Top Skills by Job Count</h2>
          <span className="text-xs text-slate-400">{topSkills.length} skills tracked</span>
        </div>
        {topSkills.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topSkills} layout="vertical"
                      margin={{ top: 0, right: 20, bottom: 0, left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="jobCount" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-10 text-center">No skill data available yet.</p>
        )}
      </div>

      {/* Demand trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <h2 className="section-title mb-0">Demand Trend — 12 Months</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map(s => (
              <button key={s} onClick={() => setSelectedSkill(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedSkill === s
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="jobCount" stroke="#3b82f6" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-10 text-center">No trend data available for {selectedSkill} yet.</p>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top cities */}
        <div className="card">
          <h2 className="section-title">Top Hiring Cities</h2>
          {topLocations.length > 0 ? (
            <div className="space-y-4">
              {topLocations.map((loc, i) => {
                const max = topLocations[0]?.jobCount || 1;
                const pct = Math.round((loc.jobCount / max) * 100);
                return (
                  <div key={loc.city}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                        <span className="text-sm font-medium text-slate-700">{loc.city}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {loc.jobCount?.toLocaleString()} jobs
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">No location data available yet.</p>
          )}
        </div>

        {/* Salary lookup */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-emerald-600" />
            <h2 className="section-title mb-0">Salary Statistics</h2>
          </div>
          <div className="space-y-3">
            <input value={salarySkill} onChange={e => setSalarySkill(e.target.value)}
              placeholder="Skill (e.g. Java, Python)"
              className="input" />
            <input value={salaryCity} onChange={e => setSalaryCity(e.target.value)}
              placeholder="City (e.g. New York, London)"
              className="input" />
            <button onClick={fetchSalary} disabled={salaryLoading}
              className="btn-primary w-full py-2.5">
              {salaryLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching…
                </span>
              ) : 'Get Salary Data'}
            </button>
          </div>

          {salaryStats && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Min',     value: `$${Number(salaryStats.min).toLocaleString()}`,     color: 'text-blue-600' },
                { label: 'Max',     value: `$${Number(salaryStats.max).toLocaleString()}`,     color: 'text-indigo-600' },
                { label: 'Average', value: `$${Number(salaryStats.average).toLocaleString()}`, color: 'text-emerald-600' },
                { label: 'Median',  value: `$${Number(salaryStats.median).toLocaleString()}`,  color: 'text-violet-600' },
              ].map(({ label, value, color }) => (
                <div key={label}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
              <div className="col-span-2 text-xs text-slate-400 text-center pt-1">
                Based on {salaryStats.sampleSize?.toLocaleString()} data points
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
