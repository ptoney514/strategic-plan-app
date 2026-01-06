import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  Building2,
  FileText,
  Palette,
  BarChart2,
  Eye,
  User,
  Bell,
  Settings,
  ChevronsLeft,
  LogOut,
  Grid,
  Users
} from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';
import { useAuth } from '../contexts/AuthContext';

/**
 * ClientAdminEditorialLayout - Editorial-style admin layout with dark sidebar
 * Inspired by OKR/strategic planning tools with warm paper aesthetic
 */
export function ClientAdminEditorialLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: district, isLoading } = useDistrict(slug!);
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const basePath = `/${slug}/admin`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227] mx-auto"></div>
          <p className="mt-4 text-[#8a8a8a]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[#4a4a4a]">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-[#b85c38] hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get district initials for logo
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex font-['Source_Sans_3',_-apple-system,_sans-serif]">
      {/* Dark Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-[220px]'} bg-[#1a1a1a] flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-all duration-200`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a227] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#1a1a1a] font-bold text-sm font-['Playfair_Display',_Georgia,_serif]">
                {getInitials(district.name)}
              </span>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate leading-tight">
                  {district.name}
                </div>
                <div className="text-xs text-[#9a9a9a]">Strategic Planning</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            to={basePath}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === basePath
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <Home className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Home</span>}
          </Link>

          <Link
            to={`${basePath}/objectives`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActiveRoute(`${basePath}/objectives`)
                ? 'bg-[#333333] text-white'
                : 'text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            <Target className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>Objectives</span>}
          </Link>

          {/* View Public Site */}
          <a
            href={`/${slug}`}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white"
          >
            <Eye className="h-[18px] w-[18px] opacity-70" />
            {!isSidebarCollapsed && <span>View Public Site</span>}
          </a>
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

            {/* User Profile */}
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-[#f5f3ef] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8d5e8] to-[#d4b8d4] flex items-center justify-center text-xs font-semibold text-[#6b4c6b]">
                  {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {user?.email?.split('@')[0] || 'Admin'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#e8e6e1] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#e8e6e1]">
                    <p className="text-xs text-[#8a8a8a]">Signed in as</p>
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            &copy; {new Date().getFullYear()} {district.name}
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
