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

const REMOTE_OPTIONS = ['REMOTE', 'HYBRID', 'ON_SITE'];
const EXP_OPTIONS    = ['JUNIOR', 'MID', 'SENIOR', 'LEAD'];
const TYPE_OPTIONS   = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

const REMOTE_STYLE: Record<string, string> = {
  REMOTE:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  HYBRID:  'bg-amber-100  text-amber-700  border border-amber-200',
  ON_SITE: 'bg-slate-100  text-slate-600  border border-slate-200',
};

const EXP_STYLE: Record<string, string> = {
  JUNIOR: 'bg-sky-100    text-sky-700',
  MID:    'bg-violet-100 text-violet-700',
  SENIOR: 'bg-indigo-100 text-indigo-700',
  LEAD:   'bg-rose-100   text-rose-700',
};

/* distinct gradient per company-initial bucket */
const AVATAR_GRAD = [
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-blue-500',
];

export default function JobsPage() {
  const [jobs,   setJobs]   = useState<Job[]>([]);
  const [total,  setTotal]  = useState(0);
  const [page,   setPage]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [query,  setQuery]  = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skill: '', city: '', remoteType: '', experienceLevel: '', jobType: '',
  });

  const activeCount = Object.values(filters).filter(Boolean).length;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = query
        ? await jobsApi.search(query, page)
        : await jobsApi.list({ ...filters, page, size: 20 });
      setJobs(res.data.content ?? res.data ?? []);
      setTotal(res.data.totalElements ?? res.data?.length ?? 0);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }, [query, filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Hero ── */}
      <div className="hero-violet rounded-2xl px-6 py-5 border border-violet-200 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight
                       bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
          Job Search
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          <span className="font-bold text-violet-600">{total.toLocaleString()}</span> positions available
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            onKeyDown={e => e.key === 'Enter' && fetchJobs()}
            placeholder="Search jobs, skills, companies…"
            className="input pl-10"
          />
        </div>
        <button onClick={fetchJobs}
          className="btn-primary px-6 flex items-center gap-2">
          <Search size={14} /> Search
        </button>
        <button onClick={() => setShowFilters(v => !v)}
          className={cn(
            'btn-secondary flex items-center gap-2 px-4 relative',
            showFilters && 'ring-2 ring-indigo-400 ring-offset-1 bg-indigo-50'
          )}>
          <Filter size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white
                             text-[10px] font-bold rounded-full flex items-center justify-center
                             absolute -top-2 -right-2 shadow-sm">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="card card-accent-violet !py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-violet-700 flex items-center gap-1.5">
              <Filter size={13} /> Filter Jobs
            </p>
            {activeCount > 0 && (
              <button onClick={() => setFilters({ skill:'',city:'',remoteType:'',experienceLevel:'',jobType:'' })}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-bold">
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { ph: 'Skill (e.g. Java)', key: 'skill' },
              { ph: 'City',              key: 'city'  },
            ].map(({ ph, key }) => (
              <input key={key} placeholder={ph}
                value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="input text-xs py-2" />
            ))}
            {[
              { key: 'remoteType',      opts: REMOTE_OPTIONS, label: 'Remote' },
              { key: 'experienceLevel', opts: EXP_OPTIONS,    label: 'Level'  },
              { key: 'jobType',         opts: TYPE_OPTIONS,   label: 'Type'   },
            ].map(({ key, opts, label }) => (
              <select key={key}
                value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="input text-xs py-2 bg-white">
                <option value="">{label}</option>
                {opts.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* ── Job list ── */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <div className="empty-icon"><Briefcase size={26} className="text-violet-400" /></div>
          <p className="font-bold text-slate-600">No jobs found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, idx) => {
            const grad = AVATAR_GRAD[idx % AVATAR_GRAD.length];
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="block bg-white rounded-2xl border border-indigo-50
                           px-5 py-4 shadow-sm
                           hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100
                           hover:-translate-y-0.5 transition-all duration-150 group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad}
                                    flex items-center justify-center flex-shrink-0
                                    text-white font-extrabold text-sm shadow-md`}>
                      {(job.companyName ?? 'J').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                        {job.companyName && (
                          <span className="flex items-center gap-1 font-medium">
                            <Building2 size={12} className="text-indigo-400" /> {job.companyName}
                          </span>
                        )}
                        {job.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-violet-400" /> {job.city}
                          </span>
                        )}
                        {formatSalary(job.salaryMin, job.salaryMax) && (
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <DollarSign size={12} /> {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.skills?.slice(0, 5).map(s => (
                          <span key={s} className="skill-pill">{s}</span>
                        ))}
                        {(job.skills?.length ?? 0) > 5 && (
                          <span className="text-xs text-slate-400 self-center font-medium">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {job.remoteType && (
                      <span className={cn('badge', REMOTE_STYLE[job.remoteType] ?? 'bg-slate-100 text-slate-500')}>
                        <Wifi size={10} /> {job.remoteType.replace('_',' ')}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className={cn('badge', EXP_STYLE[job.experienceLevel] ?? 'bg-slate-100 text-slate-500')}>
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
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="btn-secondary py-2 px-5 disabled:opacity-40">← Previous</button>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
            {page + 1} / {Math.ceil(total / 20)}
          </span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}
            className="btn-secondary py-2 px-5 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
