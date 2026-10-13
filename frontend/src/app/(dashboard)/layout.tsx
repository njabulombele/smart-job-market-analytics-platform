'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  BarChart3, Briefcase, Home, LogOut, MessageSquare,
  TrendingUp, FileText, Users, ChevronLeft, ChevronRight,
  Bell, Search, Settings, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',  icon: Home,          label: 'Dashboard',    color: 'from-blue-400 to-indigo-500' },
  { href: '/jobs',       icon: Briefcase,     label: 'Jobs',         color: 'from-violet-400 to-purple-500' },
  { href: '/analytics',  icon: BarChart3,     label: 'Analytics',    color: 'from-cyan-400 to-blue-500' },
  { href: '/trends',     icon: TrendingUp,    label: 'Trends',       color: 'from-emerald-400 to-teal-500' },
  { href: '/resume',     icon: FileText,      label: 'Resume Match', color: 'from-amber-400 to-orange-500' },
  { href: '/ai-coach',   icon: Sparkles,      label: 'AI Coach',     color: 'from-pink-400 to-rose-500' },
];

const adminItems = [
  { href: '/admin',          icon: Users,    label: 'Admin',    color: 'from-rose-400 to-red-500' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', color: 'from-slate-400 to-slate-500' },
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

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JM';

  return (
    <div className="flex h-screen bg-[#f0f4ff] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={cn(
        'sidebar-gradient flex flex-col transition-all duration-300 ease-in-out relative z-20 flex-shrink-0',
        collapsed ? 'w-[68px]' : 'w-60'
      )}>

        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-white/10',
          'bg-gradient-to-r from-blue-600/20 to-indigo-600/20'
        )}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                          flex items-center justify-center flex-shrink-0
                          shadow-lg shadow-indigo-600/40">
            <BarChart3 size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-extrabold text-sm leading-none tracking-tight truncate">
                JobMarket AI
              </p>
              <p className="text-indigo-300 text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-3 mb-2">
              Navigation
            </p>
          )}

          {navItems.map(({ href, icon: Icon, label, color }) => {
            const active = pathname === href ||
                           (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-150 group',
                  active
                    ? 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                )}>
                {active ? (
                  <div className={cn(
                    'w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                    color
                  )}>
                    <Icon size={13} className="text-white" />
                  </div>
                ) : (
                  <Icon size={17} className="flex-shrink-0" />
                )}
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <div className="border-t border-white/10 my-3" />
              {!collapsed && (
                <p className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest px-3 mb-2">
                  Admin
                </p>
              )}
              {adminItems.map(({ href, icon: Icon, label, color }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} title={collapsed ? label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                      'transition-all duration-150',
                      active
                        ? 'bg-gradient-to-r from-rose-500/90 to-pink-500/90 text-white shadow-lg shadow-rose-600/30'
                        : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    )}>
                    {active ? (
                      <div className={cn('w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', color)}>
                        <Icon size={13} className="text-white" />
                      </div>
                    ) : (
                      <Icon size={17} className="flex-shrink-0" />
                    )}
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Sign-out */}
        <div className="px-2 py-3 border-t border-white/10">
          <button onClick={() => { logout(); router.push('/login'); }}
            title={collapsed ? 'Sign out' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-slate-400 hover:bg-rose-500/20 hover:text-rose-300
                       transition-all duration-150">
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3.5 top-16 w-7 h-7 rounded-full
                     bg-gradient-to-br from-blue-600 to-indigo-600
                     border-2 border-[#f0f4ff]
                     flex items-center justify-center text-white
                     hover:scale-110 transition-all duration-150 shadow-md shadow-indigo-600/40">
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white/80 backdrop-blur-md
                           border-b border-indigo-100
                           flex items-center justify-between px-6 flex-shrink-0 z-10
                           shadow-sm shadow-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input placeholder="Search jobs, skills…"
                className="pl-9 pr-4 py-1.5 text-sm bg-indigo-50/60 border border-indigo-200
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56
                           placeholder:text-indigo-300 text-slate-700 transition" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-xl
                               bg-gradient-to-br from-indigo-50 to-blue-50
                               border border-indigo-200
                               flex items-center justify-center text-indigo-500
                               hover:from-indigo-100 hover:to-blue-100 transition">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full
                               ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600
                              flex items-center justify-center text-white text-xs font-extrabold
                              shadow-md shadow-indigo-500/30">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-indigo-400 mt-0.5 font-medium capitalize">
                  {user?.role?.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
