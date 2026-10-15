'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, MapPin, TrendingUp, BarChart3, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const TRENDING = [
  'Software Engineer', 'Data Analyst', 'Product Manager',
  'DevOps Engineer', 'Cloud Architect', 'Machine Learning',
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [trendOpen, setTrendOpen] = useState(false);
  const [employerOpen, setEmployerOpen] = useState(false);

  const search = () => {
    if (isAuthenticated) {
      const q = what.trim();
      router.push(q ? `/jobs?q=${encodeURIComponent(q)}&city=${encodeURIComponent(where)}` : '/jobs');
    } else {
      router.push('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font)' }}>

      {/* ── Top navigation bar ── */}
      <nav className="site-nav">
        {/* Brand */}
        <Link href="/" className="site-nav-brand">
          Smart Job Market
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <Link href="/" className="site-nav-link active">Home</Link>
          <Link href="/jobs" className="site-nav-link">Find salaries</Link>
          <Link href="/analytics" className="site-nav-link">Company reviews</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="site-nav-link">Sign in</Link>
              <span style={{ color: 'var(--gray-200)' }}>|</span>
              <span className="site-nav-link" style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                ZA &nbsp; En
              </span>
              <span style={{ color: 'var(--gray-200)' }}>|</span>
              <Link href="/register" className="site-nav-link">Employers / Post Job</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero: search section ── */}
      <section style={{ padding: '32px 24px 24px', maxWidth: 740, margin: '0 auto' }}>

        {/* Search bar — exactly as Indeed */}
        <div className="search-bar">
          {/* What field */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={17}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)', pointerEvents: 'none',
              }}
            />
            <input
              className="search-input"
              placeholder="Job title, keywords, or company"
              value={what}
              onChange={e => setWhat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>

          {/* Divider */}
          <div className="search-divider" />

          {/* Where field */}
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin
              size={17}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)', pointerEvents: 'none',
              }}
            />
            <input
              className="search-input"
              placeholder='City, state, zip code, or "remote"'
              value={where}
              onChange={e => setWhere(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>

          <button className="search-btn" onClick={search}>
            Find jobs
          </button>
        </div>
      </section>

      {/* ── Brand + CTA ── */}
      <section style={{ padding: '16px 24px 40px', textAlign: 'center' }}>
        <div style={{
          fontSize: 52, fontWeight: 900, color: 'var(--blue)',
          letterSpacing: -2, lineHeight: 1, marginBottom: 12,
        }}>
          Smart Job Market
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6 }}>
          Your next job starts here
        </p>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 24 }}>
          Create an account or sign in to see your personalised job recommendations.
        </p>
        <Link href={isAuthenticated ? '/dashboard' : '/register'}
          className="btn btn-primary btn-lg"
          style={{ borderRadius: 6, display: 'inline-flex' }}>
          Get Started &nbsp;→
        </Link>
      </section>

      {/* ── Trending ── */}
      <section style={{
        borderTop: '1px solid var(--border)', padding: '16px 24px',
        maxWidth: 740, margin: '0 auto',
      }}>
        <button
          onClick={() => setTrendOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600, color: 'var(--gray-700)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          What&apos;s trending on Smart Job Market
          <ChevronDown size={15} style={{ transform: trendOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
        </button>

        {trendOpen && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRENDING.map(t => (
              <Link key={t} href={`/jobs?q=${encodeURIComponent(t)}`}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: 'var(--blue-light)', color: 'var(--blue)',
                  fontSize: 13, fontWeight: 600,
                  border: '1px solid var(--blue-border)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-border)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Employer Resources ── */}
      <section style={{
        borderTop: '1px solid var(--border)', padding: '16px 24px',
        maxWidth: 740, margin: '0 auto',
      }}>
        <button
          onClick={() => setEmployerOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 700, color: 'var(--gray-700)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          Employer Resources
          <ChevronDown size={15} style={{ transform: employerOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
        </button>

        {employerOpen && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {['Post a Job', 'Hiring Solutions', 'Salary Benchmarks', 'Analytics Dashboard'].map(r => (
              <Link key={r} href="/analytics"
                style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
              >
                {r}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        marginTop: 40,
        background: 'var(--gray-25)',
        borderTop: '1px solid var(--border)',
        padding: '24px',
        display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap',
      }}>
        {[
          { icon: BarChart3, label: '124K+ Jobs', sub: 'tracked daily' },
          { icon: MapPin,    label: '284 Cities', sub: 'worldwide'    },
          { icon: TrendingUp, label: '98% Accuracy', sub: 'data verified' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <Icon size={22} style={{ color: 'var(--blue)', margin: '0 auto 6px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{sub}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '16px 24px',
        textAlign: 'center', fontSize: 12, color: 'var(--gray-400)',
      }}>
        © {new Date().getFullYear()} Smart Job Market AI. All rights reserved. &nbsp;·&nbsp;
        <Link href="/login" style={{ color: 'var(--gray-400)' }}>Privacy</Link> &nbsp;·&nbsp;
        <Link href="/login" style={{ color: 'var(--gray-400)' }}>Terms</Link>
      </footer>
    </div>
  );
}
