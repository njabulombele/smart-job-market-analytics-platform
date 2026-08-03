'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  BarChart3, Briefcase, Home, LogOut, MessageSquare, Settings,
  TrendingUp, FileText, Users
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',    icon: Home,         label: 'Dashboard' },
  { href: '/jobs',         icon: Briefcase,    label: 'Jobs' },
  { href: '/analytics',   icon: BarChart3,    label: 'Analytics' },
  { href: '/trends',      icon: TrendingUp,   label: 'Trends' },
  { href: '/resume',      icon: FileText,     label: 'Resume Match' },
  { href: '/ai-coach',    icon: MessageSquare, label: 'AI Coach' },
  { href: '/reports',     icon: BarChart3,    label: 'Reports' },
];

const adminItems = [
  { href: '/admin',       icon: Users,        label: 'Admin' },
  { href: '/admin/settings', icon: Settings,  label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">JobMarket AI</h1>
          <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition text-sm font-medium">
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div className="border-t my-2" />
              {adminItems.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition text-sm font-medium">
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition text-sm font-medium w-full">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
