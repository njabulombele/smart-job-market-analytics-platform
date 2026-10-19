'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, MapPin, TrendingUp, BarChart3, ChevronDown, Briefcase } from 'lucide-react';
import Link from 'next/link';

const TRENDING = [
  'Software Engineer', 'Java Developer', 'Data Analyst', 'Product Manager',
  'DevOps Engineer', 'Cloud Architect', 'Machine Learning',
];

const GREEN     = '#1A7A3C';
const GREEN_DK  = '#145E2E';
const GREEN_LT  = '#E8F5EE';
const GREEN_BD  = '#A8D8BC';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [what,         setWhat]         = useState('');
  const [where,        setWhere]        = useState('');
  const [whatFocus,    setWhatFocus]    = useState(false);
  const [whereFocus,   setWhereFocus]   = useState(false);
  const [trendOpen,    setTrendOpen]    = useState(false);
  const [employerOpen, setEmployerOpen] = useState(false);

  const search = () => {
    const q = what.trim();
    router.push(
      isAuthenticated
        ? (q ? `/jobs?q=${encodeURIComponent(q)}&city=${encodeURIComponent(where)}` : '/jobs')
        : '/login'
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font)' }}>

      {/* ── Top nav ── */}
      <nav className="site-nav">
        <Link href="/" style={{
          fontSize: 18, fontWeight: 900, color: GREEN,
          letterSpacing: -0.5, textDecoration: 'none',
        }}>
          Smart Job Market
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 'auto' }}>
          <Link href="/jobs"      className="site-nav-link">Find Jobs</Link>
          <Link href="/analytics" className="site-nav-link">Salaries</Link>
          {isAuthenticated
            ? <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ borderRadius: 6 }}>Dashboard</Link>
            : <>
                <Link href="/login"    className="site-nav-link">Sign in</Link>
                <Link href="/register" className="btn btn-primary btn-sm" style={{ borderRadius: 6 }}>Get started</Link>
              </>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: '64px 24px 0',
        maxWidth: 680,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: GREEN_LT, border: `1px solid ${GREEN_BD}`,
          borderRadius: 20, padding: '4px 14px', marginBottom: 20,
          fontSize: 12, fontWeight: 700, color: GREEN,
          letterSpacing: '.04em', textTransform: 'uppercase',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: GREEN, display: 'inline-block',
          }} />
          South Africa&apos;s Job Intelligence Platform
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: 52, fontWeight: 900, color: GREEN,
          lineHeight: 1.1, letterSpacing: -2, marginBottom: 16,
        }}>
          Smart Job Market
        </h1>

        <h2 style={{
          fontSize: 22, fontWeight: 700,
          color: 'var(--gray-900)', marginBottom: 10,
        }}>
          Discover Your Next Opportunity
        </h2>

        <p style={{
          fontSize: 15, color: 'var(--gray-400)',
          lineHeight: 1.65, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px',
        }}>
          Explore career opportunities tailored to your skills and interests.
          Sign in or create an account to find jobs that match your goals.
        </p>

        {/* CTA button */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/register'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: GREEN, color: '#fff',
            fontWeight: 700, fontSize: 16,
            padding: '14px 32px', borderRadius: 8,
            textDecoration: 'none',
            boxShadow: `0 4px 14px rgba(26,122,60,0.35)`,
            transition: 'background .15s, box-shadow .15s',
            marginBottom: 40,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = GREEN_DK;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px rgba(26,122,60,0.45)`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = GREEN;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 14px rgba(26,122,60,0.35)`;
          }}
        >
          <Briefcase size={18} />
          Explore Now &nbsp;→
        </Link>

        {/* ── SEARCH — new design: stacked card with rounded inputs ── */}
        <div style={{
          background: '#fff',
          border: `1px solid ${GREEN_BD}`,
          borderRadius: 16,
          padding: 20,
          boxShadow: `0 8px 32px rgba(26,122,60,0.10)`,
          textAlign: 'left',
          marginBottom: 48,
        }}>
          {/* Label row */}
          <p style={{
            fontSize: 12, fontWeight: 700, color: GREEN,
            textTransform: 'uppercase', letterSpacing: '.06em',
            marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Search size={13} />
            Search jobs
          </p>

          {/* Two inputs stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* What input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: whatFocus ? '#fff' : 'var(--gray-25)',
              border: `1.5px solid ${whatFocus ? GREEN : 'var(--gray-200)'}`,
              borderRadius: 10, padding: '0 14px', height: 48,
              transition: 'border-color .15s, background .15s',
              boxShadow: whatFocus ? `0 0 0 3px rgba(26,122,60,0.12)` : 'none',
            }}>
              <Briefcase size={15} style={{ color: whatFocus ? GREEN : 'var(--gray-300)', flexShrink: 0 }} />
              <input
                value={what}
                onChange={e => setWhat(e.target.value)}
                onFocus={() => setWhatFocus(true)}
                onBlur={() => setWhatFocus(false)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="Job title, skill, or company"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 14, background: 'transparent',
                  color: 'var(--gray-900)', fontFamily: 'var(--font)',
                }}
              />
            </div>

            {/* Where input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: whereFocus ? '#fff' : 'var(--gray-25)',
              border: `1.5px solid ${whereFocus ? GREEN : 'var(--gray-200)'}`,
              borderRadius: 10, padding: '0 14px', height: 48,
              transition: 'border-color .15s, background .15s',
              boxShadow: whereFocus ? `0 0 0 3px rgba(26,122,60,0.12)` : 'none',
            }}>
              <MapPin size={15} style={{ color: whereFocus ? GREEN : 'var(--gray-300)', flexShrink: 0 }} />
              <input
                value={where}
                onChange={e => setWhere(e.target.value)}
                onFocus={() => setWhereFocus(true)}
                onBlur={() => setWhereFocus(false)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="City, province, or country"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 14, background: 'transparent',
                  color: 'var(--gray-900)', fontFamily: 'var(--font)',
                }}
              />
            </div>

            {/* Search button — full width */}
            <button
              onClick={search}
              style={{
                height: 48, borderRadius: 10, border: 'none',
                background: GREEN, color: '#fff',
                fontWeight: 700, fontSize: 15,
                fontFamily: 'var(--font)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = GREEN_DK}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = GREEN}
            >
              <Search size={16} />
              Find Jobs
            </button>
          </div>
        </div>
      </section>

      {/* ── Trending & Employer ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 8px' }}>

        {/* Trending */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 0' }}>
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
                    background: GREEN_LT, color: GREEN,
                    fontSize: 13, fontWeight: 600,
                    border: `1px solid ${GREEN_BD}`,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = GREEN_BD}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = GREEN_LT}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Employer Resources */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 0' }}>
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
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {['Post a Job', 'Hiring Solutions', 'Salary Benchmarks', 'Analytics Dashboard'].map(r => (
                <Link key={r} href="/analytics"
                  style={{ fontSize: 13, color: GREEN, fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
                >
                  {r}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <section style={{
        marginTop: 32,
        background: GREEN_LT,
        borderTop: `1px solid ${GREEN_BD}`,
        borderBottom: `1px solid ${GREEN_BD}`,
        padding: '28px 24px',
        display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap',
      }}>
        {[
          { icon: BarChart3,   label: '124K+ Jobs',  sub: 'tracked daily'  },
          { icon: MapPin,      label: '284 Cities',  sub: 'across SA'      },
          { icon: TrendingUp,  label: '98% Accuracy', sub: 'data verified' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <Icon size={22} style={{ color: GREEN, margin: '0 auto 6px' }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--gray-900)' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{sub}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '16px 24px', textAlign: 'center',
        fontSize: 12, color: 'var(--gray-400)',
        borderTop: '1px solid var(--border)',
      }}>
        © {new Date().getFullYear()} Smart Job Market AI. All rights reserved. &nbsp;·&nbsp;
        <Link href="/login" style={{ color: 'var(--gray-400)' }}>Privacy</Link>
        &nbsp;·&nbsp;
        <Link href="/login" style={{ color: 'var(--gray-400)' }}>Terms</Link>
      </footer>
    </div>
  );
}
