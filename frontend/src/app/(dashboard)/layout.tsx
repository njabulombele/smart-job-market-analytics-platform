'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  BarChart3, Briefcase, Home, LogOut,
  TrendingUp, FileText, Users, ChevronLeft, ChevronRight,
  Bell, Search, Settings, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', icon: Home,       label: 'Overview'     },
  { href: '/jobs',      icon: Briefcase,  label: 'Jobs'         },
  { href: '/analytics', icon: BarChart3,  label: 'Analytics'    },
  { href: '/trends',    icon: TrendingUp, label: 'Trends'       },
  { href: '/resume',    icon: FileText,   label: 'Resume Match' },
  { href: '/ai-coach',  icon: Sparkles,   label: 'AI Coach'     },
];

const ADMIN_NAV = [
  { href: '/admin',          icon: Users,    label: 'Admin'    },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const initials     = (user?.email ?? 'JM').slice(0, 2).toUpperCase();
  const displayName  = user?.email?.split('@')[0] ?? '';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--gray-25)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="sidebar"
        style={{
          width: collapsed ? 60 : 220,
          transition: 'width .2s ease',
          flexShrink: 0,
          position: 'relative',
          zIndex: 20,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center',
          gap: 10, padding: '0 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'var(--blue)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BarChart3 size={17} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: 14, fontWeight: 800, color: 'var(--blue)',
              letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              Smart Job Market
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '.08em', color: 'var(--gray-300)',
                        padding: '4px 6px 8px', }}>
              Platform
            </p>
          )}
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} title={collapsed ? label : undefined}
                className={cn('nav-link', active && 'active')}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1, truncate: 'true' }}>{label}</span>}
                {active && !collapsed && <span className="nav-dot" />}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <div style={{ height: 1, background: 'var(--gray-100)', margin: '8px 4px' }} />
              {!collapsed && (
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                             letterSpacing: '.08em', color: 'var(--gray-300)', padding: '4px 6px 8px' }}>
                  Admin
                </p>
              )}
              {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} title={collapsed ? label : undefined}
                    className={cn('nav-link', active && 'active')}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6,
              background: 'var(--gray-25)', marginBottom: 4,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--blue)', color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-900)',
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'capitalize' }}>
                  {user?.role?.toLowerCase()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); router.push('/login'); }}
            title={collapsed ? 'Sign out' : undefined}
            className="nav-link"
            style={{
              width: '100%', color: 'var(--gray-400)',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--red-bg)'; el.style.color = 'var(--red)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ''; el.style.color = 'var(--gray-400)'; }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            position: 'absolute', right: -12, top: 44,
            width: 24, height: 24, borderRadius: '50%',
            background: '#fff', border: '1px solid var(--border)',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30, color: 'var(--blue)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header className="topbar">
          {/* Search */}
          <div style={{ position: 'relative', display: 'none' }} className="sm:block"
               id="topbar-search">
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--gray-300)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Search jobs, skills…"
              style={{
                height: 34, paddingLeft: 32, paddingRight: 12,
                fontSize: 13, border: '1px solid var(--gray-200)',
                borderRadius: 20, background: 'var(--gray-25)',
                color: 'var(--gray-700)', outline: 'none', width: 220,
                fontFamily: 'var(--font)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.background = '#fff'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-25)'; }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Live pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20,
              background: '#E6F5EC', border: '1px solid var(--green-border)',
              fontSize: 12, fontWeight: 700, color: 'var(--green)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              Live
            </div>

            {/* Bell */}
            <button style={{
              width: 36, height: 36, borderRadius: '50%', position: 'relative',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--gray-50)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
              <Bell size={18} />
              <span className="notif-dot" />
            </button>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--blue)', color: '#fff',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {initials}
              </div>
              <div style={{ display: 'none' }} className="md:block">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.2 }}>
                  {displayName}
                </p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'capitalize' }}>
                  {user?.role?.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px 28px', maxWidth: 1120, margin: '0 auto' }}
               className="animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
