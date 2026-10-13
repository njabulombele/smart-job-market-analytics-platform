'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  BarChart3, Briefcase, Home, LogOut, MessageSquare,
  TrendingUp, FileText, Users, ChevronLeft, ChevronRight,
  Bell, Search, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',  icon: Home,         label: 'Dashboard',    section: 'main' },
  { href: '/jobs',       icon: Briefcase,    label: 'Jobs',         section: 'main' },
  { href: '/analytics',  icon: BarChart3,    label: 'Analytics',    section: 'main' },
  { href: '/trends',     icon: TrendingUp,   label: 'Trends',       section: 'main' },
  { href: '/resume',     icon: FileText,     label: 'Resume Match', section: 'main' },
  { href: '/ai-coach',   icon: MessageSquare, label: 'AI Coach',    section: 'main' },
];

const adminItems = [
  { href: '/admin',          icon: Users,    label: 'Users' },
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

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JM';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={cn(
        'flex flex-col bg-[#0f172a] transition-all duration-300 ease-in-out relative z-20 flex-shrink-0',
        collapsed ? 'w-[68px]' : 'w-60'
      )}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center
                          flex-shrink-0 shadow-lg shadow-blue-600/30">
            <BarChart3 size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none truncate">JobMarket AI</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
          )}
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                )}>
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <div className="border-t border-white/5 my-3" />
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
                  Admin
                </p>
              )}
              {adminItems.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    )}>
                    <Icon size={17} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User & sign-out */}
        <div className="px-2 py-3 border-t border-white/5 space-y-0.5">
          <button
            onClick={() => { logout(); router.push('/login'); }}
            title={collapsed ? 'Sign out' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 transition-all duration-150">
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-slate-700 border border-slate-600
                     flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:text-white
                     hover:border-blue-600 transition-all duration-150 shadow-md">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between
                           px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search jobs, skills…"
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200
                               flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600
                              flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-700 leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
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
