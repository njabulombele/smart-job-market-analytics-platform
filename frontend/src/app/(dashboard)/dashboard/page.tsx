'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { Briefcase, TrendingUp, MapPin, DollarSign } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [topSkills, setTopSkills] = useState<Array<{ skill: string; jobCount: number }>>([]);
  const [topLocations, setTopLocations] = useState<Array<{ city: string; jobCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.topSkills(10),
      analyticsApi.topLocations(8),
    ]).then(([skillsRes, locsRes]) => {
      setTopSkills(skillsRes.data);
      setTopLocations(locsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Jobs', value: '124,830', icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Active Listings', value: '18,204', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Cities Covered', value: '284', icon: MapPin, color: 'bg-purple-500' },
    { label: 'Avg Salary', value: '$132K', icon: DollarSign, color: 'bg-amber-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Real-time job market intelligence</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${color} rounded-xl p-3`}>
              <Icon className="text-white" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top skills bar chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Skills in Demand</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topSkills} layout="vertical"
                      margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 12 }} width={60} />
              <Tooltip formatter={(v) => [`${v} jobs`, 'Count']} />
              <Bar dataKey="jobCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top locations pie chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Jobs by City</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={topLocations} dataKey="jobCount" nameKey="city"
                   cx="50%" cy="50%" outerRadius={90} label={({ city }) => city}>
                {topLocations.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
