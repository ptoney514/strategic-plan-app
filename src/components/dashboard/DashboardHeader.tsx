'use client'
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Home } from 'lucide-react';
import { UserAvatarMenu } from '../common/UserAvatarMenu';

// Map routes to page titles
const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/districts': 'Districts',
  '/dashboard/plans': 'Strategic Plans',
  '/dashboard/objectives': 'Objectives & Goals',
  '/dashboard/metrics': 'Metrics',
  '/dashboard/dashboards': 'Dashboards',
  '/dashboard/reports': 'Reports',
  '/dashboard/invite': 'Invite Teammates',
  '/dashboard/help': 'Help & Support',
  '/dashboard/account': 'Account Settings',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = routeTitles[pathname ?? ''] || 'Home';

  return (
    <header className="flex items-center justify-between h-[72px] px-8 border-b border-slate-200/60 dark:border-slate-700/60 bg-[#F8FAFC]/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-brand-teal flex items-center justify-center">
          <Home size={16} />
        </div>
        <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
        <h1 className="text-sm font-medium text-slate-800 dark:text-slate-200">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-teal transition-colors"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm w-64 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all outline-hidden text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs group-hover:shadow-md"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User avatar */}
        <UserAvatarMenu />
      </div>
    </header>
  );
}
