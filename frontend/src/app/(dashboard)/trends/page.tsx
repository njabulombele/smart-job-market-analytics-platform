'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp } from 'lucide-react';

const TRACKED = ['Python', 'Java', 'TypeScript', 'Go', 'Rust', 'AWS', 'Kubernetes', 'React'];
const COLORS  = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16'];

export default function TrendsPage() {
  const [data,     setData]     = useState<Record<string, any[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string[]>(['Python', 'Java', 'TypeScript']);

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

  // Merge all skills into one array keyed by period
  const merged = Object.keys(data).length > 0
    ? (data[TRACKED[0]] ?? []).map((item: any, i: number) => {
        const row: Record<string, any> = { period: item.period };
        TRACKED.forEach(skill => { row[skill] = data[skill]?.[i]?.jobCount ?? 0; });
        return row;
      })
    : [];

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center shadow-md shadow-blue-500/25">
          <TrendingUp size={18} className="text-white" />
        </div>
        <div className="page-header">
          <h1>Market Trends</h1>
          <p>12-month demand curves for top technology skills</p>
        </div>
      </div>

      {/* Skill toggles */}
      <div className="card">
        <p className="text-sm font-medium text-slate-600 mb-3">Select skills to compare</p>
        <div className="flex flex-wrap gap-2">
          {TRACKED.map((skill, i) => (
            <button key={skill}
              onClick={() => setSelected(prev =>
                prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
              style={{
                background:   selected.includes(skill) ? `${COLORS[i]}15` : '',
                borderColor:  selected.includes(skill) ? COLORS[i] : '#e2e8f0',
                color:        selected.includes(skill) ? COLORS[i] : '#64748b',
              }}>
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="section-title">Demand Over Time</h2>
        {merged.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={merged} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, fontSize: 12, color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {TRACKED.filter(s => selected.includes(s)).map((skill, i) => (
                <Line key={skill} type="monotone" dataKey={skill}
                      stroke={COLORS[TRACKED.indexOf(skill)]}
                      strokeWidth={2} dot={false}
                      activeDot={{ r: 4, stroke: 'white', strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm py-12 text-center">No trend data available yet. Add some jobs first.</p>
        )}
      </div>
    </div>
  );
}
