'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp } from 'lucide-react';

const TRACKED = ['Python','Java','TypeScript','Go','Rust','AWS','Kubernetes','React'];
const COLORS  = ['#6366f1','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16'];

export default function TrendsPage() {
  const [data,     setData]     = useState<Record<string, any[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string[]>(['Python','Java','TypeScript']);

  useEffect(() => {
    Promise.all(
      TRACKED.map(skill =>
        analyticsApi.trends(skill, 12)
          .then(r => ({ skill, data: r.data ?? [] }))
          .catch(() => ({ skill, data: [] }))
      )
    ).then(results => {
      const map: Record<string, any[]> = {};
      results.forEach(({ skill, data }) => { map[skill] = data; });
      setData(map);
    }).finally(() => setLoading(false));
  }, []);

  const merged = Object.keys(data).length > 0
    ? (data[TRACKED[0]] ?? []).map((item: any, i: number) => {
        const row: Record<string, any> = { period: item.period };
        TRACKED.forEach(skill => { row[skill] = data[skill]?.[i]?.jobCount ?? 0; });
        return row;
      })
    : [];

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Hero ── */}
      <div className="hero-emerald rounded-2xl px-6 py-5 border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500
                          flex items-center justify-center shadow-md shadow-emerald-500/30">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight
                           bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
              Market Trends
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">12-month demand curves for top technology skills</p>
          </div>
        </div>
      </div>

      {/* ── Skill toggles ── */}
      <div className="card card-accent-emerald">
        <div className="section-banner hero-emerald rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
          <p className="text-sm font-bold text-emerald-700">Select skills to compare</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRACKED.map((skill, i) => {
            const active = selected.includes(skill);
            return (
              <button key={skill}
                onClick={() => setSelected(prev =>
                  prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                )}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold border-2 transition-all duration-150"
                style={{
                  background:   active ? `${COLORS[i]}18` : 'white',
                  borderColor:  active ? COLORS[i] : '#e0e7ff',
                  color:        active ? COLORS[i] : '#6366f1',
                  boxShadow:    active ? `0 2px 8px -2px ${COLORS[i]}60` : 'none',
                }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: COLORS[i], opacity: active ? 1 : 0.4 }} />
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="card card-accent-indigo">
        <div className="section-banner hero-blue rounded-t-2xl -mx-6 -mt-6 mb-5 px-6 py-3">
          <h2 className="section-title !mb-0 !text-indigo-700">Demand Over Time</h2>
        </div>
        {merged.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={merged} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a', border: '1px solid #312e81',
                  borderRadius: 12, fontSize: 12, color: '#e0e7ff',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#818cf8', marginBottom: 4, fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              {TRACKED.filter(s => selected.includes(s)).map(skill => (
                <Line key={skill} type="monotone" dataKey={skill}
                      stroke={COLORS[TRACKED.indexOf(skill)]}
                      strokeWidth={2.5} dot={false}
                      activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-12 text-center">No trend data yet. Add jobs first.</p>
        )}
      </div>
    </div>
  );
}
