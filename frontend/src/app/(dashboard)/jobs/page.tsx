'use client';

import { useEffect, useState, useCallback } from 'react';
import { jobsApi } from '@/lib/api';
import { Search, MapPin, Building2, DollarSign, Wifi, Clock } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  companyName: string;
  city: string;
  country: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  remoteType: string;
  experienceLevel: string;
  skills: string[];
  postedAt: string;
}

const REMOTE_OPTIONS  = ['', 'REMOTE', 'HYBRID', 'ON_SITE'];
const EXP_OPTIONS     = ['', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
const TYPE_OPTIONS    = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

export default function JobsPage() {
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [query, setQuery]       = useState('');
  const [filters, setFilters]   = useState({
    skill: '', city: '', remoteType: '', experienceLevel: '', jobType: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = query
        ? { q: query, page }
        : { ...filters, page, size: 20 };

      const endpoint = query ? jobsApi.search(query, page) : jobsApi.list(params);
      const { data } = await endpoint;
      setJobs(data.content ?? data);
      setTotal(data.totalElements ?? data.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max!)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
        <p className="text-gray-500">{total.toLocaleString()} positions available</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search jobs, skills, companies..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={fetchJobs}
          className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition">
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Skill', key: 'skill', type: 'text' },
          { label: 'City', key: 'city', type: 'text' },
        ].map(({ label, key }) => (
          <input key={key}
            placeholder={label}
            value={filters[key as keyof typeof filters]}
            onChange={(e) => setFilters(f => ({ ...f, [key]: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}
        {[
          { label: 'Remote', key: 'remoteType', options: REMOTE_OPTIONS },
          { label: 'Level', key: 'experienceLevel', options: EXP_OPTIONS },
          { label: 'Type', key: 'jobType', options: TYPE_OPTIONS },
        ].map(({ label, key, options }) => (
          <select key={key}
            value={filters[key as keyof typeof filters]}
            onChange={(e) => setFilters(f => ({ ...f, [key]: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">{label}</option>
            {options.filter(Boolean).map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
          </select>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}
              className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-transparent hover:border-blue-200">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    {job.companyName && (
                      <span className="flex items-center gap-1">
                        <Building2 size={13} /> {job.companyName}
                      </span>
                    )}
                    {job.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {job.city}
                      </span>
                    )}
                    {job.remoteType && (
                      <span className="flex items-center gap-1">
                        <Wifi size={13} /> {job.remoteType.replace('_', ' ')}
                      </span>
                    )}
                    {formatSalary(job.salaryMin, job.salaryMax) && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign size={13} /> {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills?.slice(0, 5).map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                    {(job.skills?.length ?? 0) > 5 && (
                      <span className="text-xs text-gray-400">+{job.skills.length - 5} more</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {job.experienceLevel && (
                    <span className="text-xs bg-purple-50 text-purple-700 rounded-full px-2 py-0.5">
                      {job.experienceLevel}
                    </span>
                  )}
                  {job.postedAt && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                      <Clock size={11} />
                      {new Date(job.postedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p>No jobs found. Try different search terms.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-3">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page + 1} of {Math.ceil(total / 20)}
          </span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
