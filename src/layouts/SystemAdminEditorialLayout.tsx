import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Settings,
  Bell,
  Grid,
  ChevronsLeft,
  MessageSquare,
} from 'lucide-react';
import { UserMenu } from '../components/common/UserMenu';

/**
 * SystemAdminEditorialLayout - Editorial-style admin layout for system administrators
 * Features dark sidebar with warm paper aesthetic for system-level administration
 */
export function SystemAdminEditorialLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex font-['Source_Sans_3',_-apple-system,_sans-serif]">
      {/* Dark Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-[220px]'} bg-[#1a1a1a] flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-all duration-200`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a227] rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate leading-tight">
                  System Admin
                </div>
                <div className="text-xs text-[#9a9a9a]">Strategic Plan Builder</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActiveRoute('/')
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <Building2 className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Districts</span>}
          </Link>

          <Link
            to="/users"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActiveRoute('/users')
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <Users className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Users</span>}
          </Link>

          <Link
            to="/contacts"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActiveRoute('/contacts')
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <MessageSquare className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Contacts</span>}
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActiveRoute('/settings')
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <Settings className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white transition-all w-full"
          >
            <ChevronsLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isSidebarCollapsed ? 'ml-16' : 'ml-[220px]'} transition-all duration-200`}>
        {/* Top Header */}
        <header className="h-16 bg-[#faf9f7] border-b border-[#e8e6e1] flex items-center justify-end px-8 sticky top-0 z-40">
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 rounded-lg hover:bg-[#f5f3ef] text-[#4a4a4a] flex items-center justify-center transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="w-9 h-9 rounded-lg hover:bg-[#f5f3ef] text-[#4a4a4a] flex items-center justify-center transition-colors">
              <Grid className="h-5 w-5" />
            </button>
            <button className="w-9 h-9 rounded-lg hover:bg-[#f5f3ef] text-[#4a4a4a] flex items-center justify-center transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            {/* User Profile - Consistent across all auth pages */}
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#e8e6e1] px-10 py-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">Help Center</a>
            <a href="#" className="text-xs text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">Privacy</a>
            <a href="#" className="text-xs text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">Terms</a>
          </div>
          <div className="text-xs text-[#8a8a8a]">
            &copy; {new Date().getFullYear()} Strategic Plan Builder
          </div>
        </footer>
      </div>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#b85c38] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </div>
  );
}
