// This file uses Apache 2.0 license

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  History, 
  Users, 
  ShieldAlert, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', emoji: '🏠' },
    { name: 'Calendar', icon: CalendarIcon, path: '/calendar', emoji: '📅' },
    { name: 'History', icon: History, path: '/history', emoji: '📜' },
    { name: 'Social', icon: Users, path: '/social', emoji: '👥' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', icon: ShieldAlert, path: '/admin', emoji: '🛡️' });
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col fixed inset-y-0 z-50 shadow-xl border-r border-indigo-800">
        <div className="p-8">
          <Link to="/dashboard" className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter italic">HabitMate</h1>
            <p className="text-[10px] text-indigo-200 mt-1 uppercase tracking-widest font-bold">Track • Progress • Achieve</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  isActive 
                    ? "bg-white/20 border-l-4 border-white translate-x-1 shadow-sm" 
                    : "text-indigo-100 hover:bg-indigo-600"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-indigo-800 p-4 rounded-2xl flex items-center gap-3 mb-4 border border-indigo-600/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-black text-sm uppercase">
              {user?.username?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{user?.role}</p>
              <p className="text-sm font-bold truncate">{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-indigo-100 hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col pt-0">
        {/* Header mimic from theme */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 text-sm sticky top-0 z-40 shadow-sm">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔥</span>
              <span className="font-bold text-lg text-orange-500">{user?.streak} Days Streak</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl text-yellow-500">⭐</span>
              <span className="font-bold text-lg">{user?.total_points} Points</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID: #{user?.id ? `HM-${user.id.toString().padStart(4, '0')}` : 'GUEST'}</span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
