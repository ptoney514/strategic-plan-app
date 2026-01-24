import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Home } from 'lucide-react';
import { UserAvatarMenu } from '../common/UserAvatarMenu';
import { useAuth } from '../../contexts/AuthContext';

// Map routes to page titles
const routeTitles: Record<string, string> = {
  '/': 'Home',
  '/plans': 'Strategic Plans',
  '/objectives': 'Objectives & Goals',
  '/metrics': 'Metrics',
  '/dashboards': 'Dashboards',
  '/reports': 'Reports',
  '/invite': 'Invite Teammates',
  '/help': 'Help & Support',
};

export function DashboardHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = routeTitles[location.pathname] || 'Home';

  // Get user role from metadata
  const userRole = user?.user_metadata?.role === 'system_admin' ? 'System Admin' : 'District Admin';

  return (
    <header className="flex items-center justify-between h-[72px] px-8 border-b border-slate-200/60 bg-[#F8FAFC]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-500">
        <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-sm text-brand-teal flex items-center justify-center">
          <Home size={16} />
        </div>
        <span className="text-slate-300 text-sm">/</span>
        <h1 className="text-sm font-medium text-slate-800">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal transition-colors"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm w-64 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all outline-none text-slate-600 placeholder-slate-400 shadow-sm group-hover:shadow-md"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User info and avatar */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block leading-tight">
            <div className="text-sm font-semibold text-slate-700 tracking-tight">
              {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-slate-500 font-medium">{userRole}</div>
          </div>
          <UserAvatarMenu showName={false} />
        </div>
      </div>
    </header>
  );
}
