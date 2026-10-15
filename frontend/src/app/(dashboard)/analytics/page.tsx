'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { TrendingUp, DollarSign, MapPin, BarChart3 } from 'lucide-react';

const SKILLS = ['Python','Java','AWS','Kubernetes','React','Go','TypeScript','Rust'];
const COLORS  = ['#2557A7','#7C3AED','#0D9488','#15803D','#B45309','#DC2626','#0891B2','#9333EA','#D97706','#6D28D9','#059669','#B91C1C'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <p className="text-gray-400 text-[11px]">{label}</p>
      <p className="font-semibold text-gray-900 text-sm">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [topSkills,  setTopSkills]    = useState<any[]>([]);
  const [topLocs,    setTopLocs]      = useState<any[]>([]);
  const [salary,     setSalary]       = useState<any>(null);
  const [salLoading, setSalLoading]   = useState(false);
  const [trends,     setTrends]       = useState<any[]>([]);
  const [selSkill,   setSelSkill]     = useState('Python');
  const [salSkill,   setSalSkill]     = useState('');
  const [salCity,    setSalCity]      = useState('');
  const [loading,    setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.topSkills(12), analyticsApi.topLocations(8)])
      .then(([s, l]) => { setTopSkills(s.data ?? []); setTopLocs(l.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    analyticsApi.trends(selSkill, 12).then(r => setTrends(r.data ?? [])).catch(() => setTrends([]));
  }, [selSkill]);

  const fetchSalary = async () => {
    setSalLoading(true);
    try {
      const r = await analyticsApi.salaryStats(salSkill || undefined, salCity || undefined);
      setSalary(r.data);
    } catch { setSalary(null); } finally { setSalLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">

      {/* Hero */}
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ background: '#2557A7' }}>
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="page-hero-title">Market Analytics</h1>
            <p className="page-hero-sub">Real-time insights from thousands of job postings</p>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Top Skills by Job Count</h2>
          <span className="badge badge-blue">{topSkills.length} skills tracked</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topSkills} layout="vertical" margin={{ top:0, right:16, bottom:0, left:90 }}>
                <XAxis type="number" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" tick={{ fontSize:12, fill:'#374151', fontWeight:500 }}
                       axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="jobCount" radius={[0,4,4,0]} maxBarSize={18}>
                  {topSkills.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm py-10 text-center">No data available yet.</p>}
        </div>
      </div>

      {/* Demand Trend */}
      <div className="card">
        <div className="section-header flex-wrap gap-2">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500" />
            Demand Trend — 12 Months
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map(s => (
              <button key={s} onClick={() => setSelSkill(s)}
                className="btn btn-sm"
                style={{
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: 12,
                  background: selSkill === s ? '#2557A7' : '#F3F4F6',
                  color: selSkill === s ? '#fff' : '#374151',
                  border: 'none',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '8px 20px 16px' }}>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top:4, right:16, bottom:0, left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="jobCount" stroke="#2557A7" strokeWidth={2.5}
                      dot={false} activeDot={{ r:4, fill:'#2557A7', stroke:'#fff', strokeWidth:2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm py-10 text-center">No trend data for {selSkill}.</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Cities */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" /> Top Hiring Cities
            </h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {topLocs.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {topLocs.map((loc, i) => {
                  const max = topLocs[0]?.jobCount || 1;
                  const pct = Math.round((loc.jobCount / max) * 100);
                  const col = COLORS[i % COLORS.length];
                  return (
                    <div key={loc.city}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:700, width:16, textAlign:'right' }}>{i+1}</span>
                          <span style={{ fontSize:13, fontWeight:500, color:'#374151' }}>{loc.city}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:col }}>{loc.jobCount?.toLocaleString()} jobs</span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width:`${pct}%`, background:col }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400 text-sm py-8 text-center">No data yet.</p>}
          </div>
        </div>

        {/* Salary */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" /> Salary Statistics (ZAR)
            </h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <input value={salSkill} onChange={e => setSalSkill(e.target.value)}
                placeholder="Skill (e.g. Java, Python)" className="field" />
              <input value={salCity} onChange={e => setSalCity(e.target.value)}
                placeholder="City (e.g. Johannesburg, Cape Town)" className="field" />
              <button onClick={fetchSalary} disabled={salLoading} className="btn btn-primary btn-sm">
                {salLoading
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Fetching…</>
                  : 'Get Salary Data'}
              </button>
            </div>
            {salary && (
              <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { lbl:'Minimum', val:`R${Number(salary.min).toLocaleString()}`,     color:'#1D4ED8' },
                  { lbl:'Maximum', val:`R${Number(salary.max).toLocaleString()}`,     color:'#6D28D9' },
                  { lbl:'Average', val:`R${Number(salary.average).toLocaleString()}`, color:'#0D9488' },
                  { lbl:'Median',  val:`R${Number(salary.median).toLocaleString()}`,  color:'#B45309' },
                ].map(({ lbl, val, color }) => (
                  <div key={lbl} style={{
                    padding:'12px', borderRadius:6, textAlign:'center',
                    background:'#F9FAFB', border:'1px solid #E5E7EB',
                  }}>
                    <p style={{ fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{lbl}</p>
                    <p style={{ fontSize:20, fontWeight:700, color, marginTop:2 }}>{val}</p>
                  </div>
                ))}
                <p style={{ gridColumn:'1/-1', fontSize:11, color:'#9CA3AF', textAlign:'center' }}>
                  Based on {salary.sampleSize?.toLocaleString()} data points
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
