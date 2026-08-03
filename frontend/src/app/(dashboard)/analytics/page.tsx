'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsApi } from '@/lib/api';

const SKILLS = ['Python', 'Java', 'AWS', 'Kubernetes', 'React', 'Go'];

export default function AnalyticsPage() {
  const [topSkills, setTopSkills]     = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [salaryStats, setSalaryStats] = useState<any>(null);
  const [trends, setTrends]           = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('Python');
  const [salarySkill, setSalarySkill]     = useState('');
  const [salaryCity, setSalaryCity]       = useState('');

  useEffect(() => {
    analyticsApi.topSkills(15).then(r => setTopSkills(r.data));
    analyticsApi.topLocations(8).then(r => setTopLocations(r.data));
  }, []);

  useEffect(() => {
    analyticsApi.trends(selectedSkill, 12).then(r => setTrends(r.data));
  }, [selectedSkill]);

  const fetchSalary = async () => {
    const r = await analyticsApi.salaryStats(salarySkill || undefined, salaryCity || undefined);
    setSalaryStats(r.data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Analytics</h1>
        <p className="text-gray-500">Real-time insights from thousands of job postings</p>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Skills by Job Count</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topSkills} layout="vertical"
                    margin={{ top: 0, right: 30, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="skill" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(v) => [`${v} jobs`]} />
            <Bar dataKey="jobCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Demand Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Demand Trend (12 months)</h2>
          <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {SKILLS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="jobCount" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top locations */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Hiring Cities</h2>
          <div className="space-y-3">
            {topLocations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{loc.city}</span>
                    <span className="text-gray-500">{loc.jobCount} jobs</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5"
                         style={{ width: `${(loc.jobCount / (topLocations[0]?.jobCount || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary lookup */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Salary Statistics</h2>
          <div className="flex flex-col gap-3">
            <input value={salarySkill} onChange={e => setSalarySkill(e.target.value)}
              placeholder="Skill (e.g. Java)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input value={salaryCity} onChange={e => setSalaryCity(e.target.value)}
              placeholder="City (e.g. New York)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={fetchSalary}
              className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition">
              Get Salary Data
            </button>
          </div>

          {salaryStats && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Min', value: `$${Number(salaryStats.min).toLocaleString()}` },
                { label: 'Max', value: `$${Number(salaryStats.max).toLocaleString()}` },
                { label: 'Average', value: `$${Number(salaryStats.average).toLocaleString()}` },
                { label: 'Median', value: `$${Number(salaryStats.median).toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
              <div className="col-span-2 text-xs text-gray-400 text-center">
                Based on {salaryStats.sampleSize} data points
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
