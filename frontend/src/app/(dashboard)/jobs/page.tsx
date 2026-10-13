'use client';

import { useEffect, useState, useCallback } from 'react';
import { jobsApi } from '@/lib/api';
import { Search, MapPin, Building2, DollarSign, Wifi, Clock, Filter, X, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { cn, formatSalary, timeAgo } from '@/lib/utils';

interface Job {
  id: number; title: string; companyName: string;
  city: string; country: string; salaryMin: number; salaryMax: number;
  jobType: string; remoteType: string; experienceLevel: string;
  skills: string[]; postedAt: string;
}

const REMOTE_OPTIONS   = ['REMOTE', 'HYBRID', 'ON_SITE'];
const EXP_OPTIONS      = ['JUNIOR', 'MID', 'SENIOR', 'LEAD'];
const TYPE_OPTIONS     = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

const REMOTE_COLORS: Record<string, string> = {
  REMOTE:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  HYBRID:  'bg-amber-50 text-amber-700 border-amber-200',
  ON_SITE: 'bg-slate-50 text-slate-600 border-slate-200',
};

const EXP_COLORS: Record<string, string> = {
  JUNIOR: 'bg-sky-50 text-sky-700',
  MID:    'bg-violet-50 text-violet-700',
  SENIOR: 'bg-indigo-50 text-indigo-700',
  LEAD:   'bg-rose-50 text-rose-700',
};

export default function JobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery]     = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skill: '', city: '', remoteType: '', experienceLevel: '', jobType: '',
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = query
        ? await jobsApi.search(query, page)
        : await jobsApi.list({ ...filters, page, size: 20 });
      setJobs(res.data.content ?? res.data ?? []);
      setTotal(res.data.totalElements ?? res.data?.length ?? 0);
    } catch { /* empty state */ }
    finally { setLoading(false); }
  }, [query, filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const clearFilters = () => setFilters({ skill: '', city: '', remoteType: '', experienceLevel: '', jobType: '' });

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="page-header">
          <h1>Job Search</h1>
          <p>{total.toLocaleString()} positions available</p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            onKeyDown={e => e.key === 'Enter' && fetchJobs()}
            placeholder="Search jobs, skills, companies…"
            className="input pl-10"
          />
        </div>
        <button onClick={fetchJobs} className="btn-primary px-5">Search</button>
        <button onClick={() => setShowFilters(v => !v)}
          className={cn(
            'btn-secondary flex items-center gap-2 px-4 relative',
            showFilters && 'ring-2 ring-blue-500 ring-offset-1'
          )}>
          <Filter size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full
                             flex items-center justify-center absolute -top-1.5 -right-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card !py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-700">Filter Jobs</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <input
              placeholder="Skill (e.g. Java)"
              value={filters.skill}
              onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}
              className="input text-xs py-2"
            />
            <input
              placeholder="City"
              value={filters.city}
              onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              className="input text-xs py-2"
            />
            {[
              { key: 'remoteType',      opts: REMOTE_OPTIONS, label: 'Remote' },
              { key: 'experienceLevel', opts: EXP_OPTIONS,    label: 'Level' },
              { key: 'jobType',         opts: TYPE_OPTIONS,   label: 'Type' },
            ].map(({ key, opts, label }) => (
              <select key={key}
                value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="input text-xs py-2 bg-white">
                <option value="">{label}</option>
                {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <Briefcase size={40} className="mb-3 opacity-30" />
          <p className="font-medium text-slate-600">No jobs found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}
              className="block bg-white rounded-2xl border border-slate-100 px-5 py-4
                         hover:border-blue-200 hover:shadow-md hover:shadow-blue-50
                         transition-all duration-150 group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Company avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200
                                  flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-sm">
                    {(job.companyName ?? 'J').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                      {job.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} /> {job.companyName}
                        </span>
                      )}
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {job.city}
                        </span>
                      )}
                      {formatSalary(job.salaryMin, job.salaryMax) && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <DollarSign size={12} /> {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {job.skills?.slice(0, 5).map(s => (
                        <span key={s} className="skill-pill">{s}</span>
                      ))}
                      {(job.skills?.length ?? 0) > 5 && (
                        <span className="text-xs text-slate-400 self-center">
                          +{job.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {job.remoteType && (
                    <span className={cn('badge border', REMOTE_COLORS[job.remoteType] ?? 'bg-slate-50 text-slate-600')}>
                      <Wifi size={10} /> {job.remoteType.replace('_', ' ')}
                    </span>
                  )}
                  {job.experienceLevel && (
                    <span className={cn('badge', EXP_COLORS[job.experienceLevel] ?? 'bg-slate-50 text-slate-600')}>
                      {job.experienceLevel}
                    </span>
                  )}
                  {job.postedAt && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(job.postedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 px-4 disabled:opacity-40">
            ← Previous
          </button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page + 1} of {Math.ceil(total / 20)}
          </span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 px-4 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
