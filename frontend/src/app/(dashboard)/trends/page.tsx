'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp } from 'lucide-react';

const SKILLS = ['Python','Java','TypeScript','Go','Rust','AWS','Kubernetes','React'];
const COLORS  = ['#2557A7','#15803D','#B45309','#7C3AED','#DC2626','#0D9488','#9333EA','#6D28D9'];

export default function TrendsPage() {
  const [data,     setData]     = useState<Record<string,any[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string[]>(['Python','Java','TypeScript']);

  useEffect(() => {
    Promise.all(SKILLS.map(skill =>
      analyticsApi.trends(skill, 12).then(r => ({ skill, data: r.data ?? [] })).catch(() => ({ skill, data: [] }))
    )).then(results => {
      const map: Record<string,any[]> = {};
      results.forEach(({ skill, data }) => { map[skill] = data; });
      setData(map);
    }).finally(() => setLoading(false));
  }, []);

  const merged = Object.keys(data).length > 0
    ? (data[SKILLS[0]] ?? []).map((item: any, i: number) => {
        const row: Record<string,any> = { period: item.period };
        SKILLS.forEach(s => { row[s] = data[s]?.[i]?.jobCount ?? 0; });
        return row;
      })
    : [];

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">

      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ background: '#0D9488' }}>
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="page-hero-title">Market Trends</h1>
            <p className="page-hero-sub">12-month demand curves for top technology skills</p>
          </div>
        </div>
      </div>

      {/* Skill picker */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Select skills to compare</h2>
          <span className="text-xs text-gray-400">{selected.length} selected</span>
        </div>
        <div style={{ padding:'12px 20px', display:'flex', flexWrap:'wrap', gap:8 }}>
          {SKILLS.map((skill, i) => {
            const on = selected.includes(skill);
            return (
              <button key={skill}
                onClick={() => setSelected(p => p.includes(skill) ? p.filter(s => s !== skill) : [...p, skill])}
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'6px 14px', borderRadius:16, fontSize:13, fontWeight:600,
                  cursor:'pointer', transition:'all .12s',
                  background: on ? COLORS[i] : '#F3F4F6',
                  color: on ? '#fff' : '#374151',
                  border: on ? `2px solid ${COLORS[i]}` : '2px solid #E5E7EB',
                }}>
                <span style={{
                  width:8, height:8, borderRadius:'50%',
                  background: on ? 'rgba(255,255,255,0.8)' : COLORS[i], flexShrink:0
                }} />
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Demand Over Time</h2>
        </div>
        <div style={{ padding:'8px 20px 20px' }}>
          {merged.length > 0 ? (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={merged} margin={{ top:8, right:20, bottom:0, left:-8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:6, fontSize:12 }}
                  labelStyle={{ color:'#9CA3AF', fontWeight:600, marginBottom:4 }}
                />
                <Legend wrapperStyle={{ fontSize:12, paddingTop:12 }} />
                {SKILLS.filter(s => selected.includes(s)).map(skill => (
                  <Line key={skill} type="monotone" dataKey={skill}
                        stroke={COLORS[SKILLS.indexOf(skill)]}
                        strokeWidth={2.5} dot={false}
                        activeDot={{ r:4, stroke:'#fff', strokeWidth:2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-12 text-center">No trend data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
