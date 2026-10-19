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

const REMOTE_OPTS = ['REMOTE','HYBRID','ON_SITE'];
const EXP_OPTS    = ['JUNIOR','MID','SENIOR','LEAD'];
const TYPE_OPTS   = ['FULL_TIME','PART_TIME','CONTRACT','FREELANCE'];

const AVATAR_COLORS = ['#1A7A3C','#5B35A5','#0D9488','#0D7D44','#7C4F00','#CC1016'];

export default function JobsPage() {
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [query,   setQuery]   = useState('');
  const [city,    setCity]    = useState('');
  const [showF,   setShowF]   = useState(false);
  const [filters, setFilters] = useState({ skill:'', city:'', remoteType:'', experienceLevel:'', jobType:'' });
  const activeF = Object.values(filters).filter(Boolean).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = query
        ? await jobsApi.search(query, page)
        : await jobsApi.list({ ...filters, city: city || filters.city, page, size: 20 });
      setJobs(r.data.content ?? r.data ?? []);
      setTotal(r.data.totalElements ?? r.data?.length ?? 0);
    } catch { } finally { setLoading(false); }
  }, [query, city, filters, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Indeed-style search bar at top of jobs page ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '16px 0 20px', marginBottom: 20,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12 }}>
          Find jobs
        </h1>
        <div className="search-bar" style={{ maxWidth: 760 }}>
          {/* What */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              className="search-input"
              placeholder="Job title, keywords, or company"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(0); }}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <div className="search-divider" />
          {/* Where */}
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin size={16} style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              className="search-input"
              placeholder='City, state, or "remote"'
              value={city}
              onChange={e => { setCity(e.target.value); setPage(0); }}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <button className="search-btn" onClick={load}>
            Find jobs
          </button>
        </div>
      </div>

      {/* Results header + filter toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
          <strong style={{ color: 'var(--gray-900)' }}>{total.toLocaleString()}</strong> jobs found
        </p>
        <button
          onClick={() => setShowF(v => !v)}
          className={cn('btn btn-sm', showF ? 'btn-outline' : 'btn-ghost')}
          style={{ borderRadius: 20, position: 'relative' }}
        >
          <Filter size={13} /> Filters
          {activeF > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: 'green', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeF}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showF && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>Filter results</p>
            {activeF > 0 && (
              <button onClick={() => setFilters({ skill:'',city:'',remoteType:'',experienceLevel:'',jobType:'' })}
                style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, background: 'none',
                         border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {[{ key:'skill', ph:'Skill, e.g. Java' }, { key:'city', ph:'City' }].map(({ key, ph }) => (
              <input key={key} placeholder={ph}
                value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="field" style={{ height: 38, fontSize: 13 }} />
            ))}
            {[
              { key:'remoteType',      opts:REMOTE_OPTS, lbl:'Work type'        },
              { key:'experienceLevel', opts:EXP_OPTS,    lbl:'Experience level' },
              { key:'jobType',         opts:TYPE_OPTS,   lbl:'Employment type'  },
            ].map(({ key, opts, lbl }) => (
              <select key={key} value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="field" style={{ height: 38, fontSize: 13, cursor: 'pointer' }}>
                <option value="">{lbl}</option>
                {opts.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Briefcase size={24} style={{ color: 'var(--gray-300)' }} /></div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-700)' }}>No jobs found</p>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
              Try different keywords or location
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map((job, idx) => {
            const col = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const remoteLabel = job.remoteType?.replace(/_/g, ' ');
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="job-card">
                <div style={{ display: 'flex', gap: 14 }}>
                  {/* Company logo */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 6,
                    background: col, color: '#fff',
                    fontSize: 18, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {(job.companyName ?? 'J').charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 className="job-card-title">{job.title}</h3>

                    {/* Company + location */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                                  gap: '2px 12px', marginTop: 3 }}>
                      {job.companyName && (
                        <span className="job-card-company">{job.companyName}</span>
                      )}
                      {job.city && (
                        <span className="job-card-meta" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={12} />
                          {job.city}{job.country ? `, ${job.country}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Salary */}
                    {formatSalary(job.salaryMin, job.salaryMax) && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginTop: 3 }}>
                        {formatSalary(job.salaryMin, job.salaryMax)} p/a
                      </p>
                    )}

                    {/* Meta row: remote type, exp level, posted */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {job.remoteType && (
                        <span className={job.remoteType === 'REMOTE' ? 'badge badge-green' :
                                          job.remoteType === 'HYBRID' ? 'badge badge-amber' :
                                          'badge badge-gray'}>
                          {remoteLabel}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className={job.experienceLevel === 'JUNIOR' ? 'badge badge-blue' :
                                          job.experienceLevel === 'LEAD'   ? 'badge badge-purple' :
                                          'badge badge-gray'}>
                          {job.experienceLevel}
                        </span>
                      )}
                      {job.jobType && (
                        <span className="badge badge-gray">{job.jobType.replace(/_/g,' ')}</span>
                      )}
                      {job.postedAt && (
                        <span style={{ fontSize: 12, color: 'var(--gray-400)',
                                       display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                          <Clock size={11} />
                          {timeAgo(job.postedAt)}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {(job.skills?.length ?? 0) > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                        {job.skills.slice(0, 5).map(s => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                        {job.skills.length > 5 && (
                          <span style={{ fontSize: 12, color: 'var(--gray-400)', alignSelf: 'center' }}>
                            +{job.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
                      gap: 12, marginTop: 24 }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="btn btn-ghost btn-sm" style={{ borderRadius: 20 }}>
            ← Previous
          </button>
          <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
            Page {page + 1} of {Math.ceil(total / 20)}
          </span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}
            className="btn btn-ghost btn-sm" style={{ borderRadius: 20 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
