'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp, DollarSign, MapPin, BarChart3 } from 'lucide-react';

const SKILLS = ['Python','Java','AWS','Kubernetes','React','Go','TypeScript','Rust'];
const BAR_COLORS = ['#6366f1','#3b82f6','#06b6d4','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#0ea5e9','#a855f7','#14b8a6','#f97316'];
const CITY_COLORS = ['from-blue-500 to-indigo-500','from-violet-500 to-purple-500','from-emerald-500 to-teal-500','from-amber-400 to-orange-400','from-rose-400 to-pink-400','from-cyan-400 to-blue-500','from-indigo-400 to-violet-500','from-teal-400 to-emerald-500'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-indigo-700/30">
      <p className="text-indigo-300 mb-0.5">{label}</p>
      <p className="font-bold text-white">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [topSkills,     setTopSkills]    = useState<any[]>([]);
  const [topLocations,  setTopLocations] = useState<any[]>([]);
  const [salaryStats,   setSalaryStats]  = useState<any>(null);
  const [salaryLoading, setSalaryLoading]= useState(false);
  const [trends,        setTrends]       = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill]= useState('Python');
  const [salarySkill,   setSalarySkill]  = useState('');
  const [salaryCity,    setSalaryCity]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.topSkills(12), analyticsApi.topLocations(8)])
      .then(([s, l]) => { setTopSkills(s.data ?? []); setTopLocations(l.data ?? []); })
      .finally(() => setLoading(false));
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
    } catch { setSalaryStats(null); }
    finally { setSalaryLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-5 max-w-6xl">

      {/* ── Hero ── */}
      <div className="hero-cyan rounded-2xl px-6 py-5 border border-cyan-200 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight
                       bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
          Market Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Real-time insights from thousands of job postings</p>
      </div>

      {/* ── Skills chart ── */}
      <div className="card card-accent-indigo">
        <div className="section-banner hero-blue rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3 flex items-center justify-between">
          <h2 className="section-title !mb-0 !text-indigo-700">
            <BarChart3 size={15} className="text-indigo-500" /> Top Skills by Job Count
          </h2>
          <span className="text-xs font-bold text-indigo-500 bg-indigo-100 rounded-full px-2.5 py-0.5">
            {topSkills.length} skills
          </span>
        </div>
        {topSkills.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 90 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                     axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="jobCount" radius={[0, 8, 8, 0]}>
                {topSkills.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-10 text-center">No skill data available yet.</p>
        )}
      </div>

      {/* ── Demand trend ── */}
      <div className="card card-accent-violet">
        <div className="section-banner hero-violet rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title !mb-0 !text-violet-700">
              <TrendingUp size={15} className="text-violet-500" /> Demand Trend — 12 Months
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map(s => (
                <button key={s} onClick={() => setSelectedSkill(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedSkill === s
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm'
                      : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="jobCount" stroke="#8b5cf6" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-10 text-center">No trend data for {selectedSkill}.</p>
        )}
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Cities */}
        <div className="card card-accent-emerald">
          <div className="section-banner hero-emerald rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
            <h2 className="section-title !mb-0 !text-emerald-700">
              <MapPin size={14} className="text-emerald-500" /> Top Hiring Cities
            </h2>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-4">
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
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        {loc.jobCount?.toLocaleString()} jobs
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${CITY_COLORS[i]} rounded-full transition-all duration-700`}
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">No location data yet.</p>
          )}
        </div>

        {/* Salary lookup */}
        <div className="card card-accent-amber">
          <div className="section-banner hero-amber rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
            <h2 className="section-title !mb-0 !text-amber-700">
              <DollarSign size={14} className="text-amber-500" /> Salary Statistics
            </h2>
          </div>
          <div className="space-y-3">
            <input value={salarySkill} onChange={e => setSalarySkill(e.target.value)}
              placeholder="Skill (e.g. Java, Python)" className="input" />
            <input value={salaryCity} onChange={e => setSalaryCity(e.target.value)}
              placeholder="City (e.g. New York, London)" className="input" />
            <button onClick={fetchSalary} disabled={salaryLoading}
              className="btn-success w-full py-2.5">
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
                { label: 'Min',     value: `$${Number(salaryStats.min).toLocaleString()}`,     bg: 'from-blue-50 to-indigo-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
                { label: 'Max',     value: `$${Number(salaryStats.max).toLocaleString()}`,     bg: 'from-violet-50 to-purple-50', text: 'text-violet-700', border: 'border-violet-200' },
                { label: 'Average', value: `$${Number(salaryStats.average).toLocaleString()}`, bg: 'from-emerald-50 to-teal-50',  text: 'text-emerald-700',border: 'border-emerald-200'},
                { label: 'Median',  value: `$${Number(salaryStats.median).toLocaleString()}`,  bg: 'from-amber-50 to-orange-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
              ].map(({ label, value, bg, text, border }) => (
                <div key={label}
                  className={`bg-gradient-to-br ${bg} border ${border} rounded-xl p-3.5 text-center`}>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
                  <p className={`text-xl font-extrabold mt-1 ${text}`}>{value}</p>
                </div>
              ))}
              <div className="col-span-2 text-xs text-slate-400 text-center pt-1 font-medium">
                Based on {salaryStats.sampleSize?.toLocaleString()} data points
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
