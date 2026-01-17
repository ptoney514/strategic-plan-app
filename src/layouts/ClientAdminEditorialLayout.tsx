import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSubdomain } from '../contexts/SubdomainContext';
import {
  Bell,
  LogOut,
  Grid,
  Settings,
  Eye,
  ChevronsLeft,
  Menu,
  X,
} from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';
import { useSchools } from '../hooks/useSchools';
import { useAuth } from '../contexts/AuthContext';
import { buildSubdomainUrlWithPath } from '../lib/subdomain';
import { SidebarNav, SidebarHeader, SidebarUserFooter } from '../components/admin/nav/SidebarNav';
import { AddSchoolModal } from '../components/admin/schools/AddSchoolModal';

/**
 * ClientAdminEditorialLayout - Editorial-style admin layout with dark sidebar
 * Inspired by OKR/strategic planning tools with warm paper aesthetic
 */
export function ClientAdminEditorialLayout() {
  const { slug } = useSubdomain();
  const navigate = useNavigate();
  const { data: district, isLoading } = useDistrict(slug || '');
  const { data: schools = [] } = useSchools(slug || '');
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const publicSiteUrl = buildSubdomainUrlWithPath('district', '', slug || '');

  return (
    <div className="min-h-screen bg-[#faf9f7] flex font-['Source_Sans_3',_-apple-system,_sans-serif]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col ${isSidebarCollapsed ? 'w-16' : 'w-[260px]'} bg-white border-r border-slate-200 fixed top-0 left-0 bottom-0 z-50 transition-all duration-200`}>
        {/* Sidebar Header */}
        {!isSidebarCollapsed && <SidebarHeader district={district} />}

        {isSidebarCollapsed ? (
          <div className="p-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mx-auto"
              style={{ backgroundColor: district.primary_color || '#D97706' }}
            >
              {district.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        ) : null}

        {/* Navigation */}
        {!isSidebarCollapsed && (
          <SidebarNav
            district={district}
            schools={schools}
            districtSlug={slug || ''}
            onAddSchool={() => setIsAddSchoolModalOpen(true)}
          />
        )}

        {/* View Public Site */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Eye size={16} />
              <span>View Public Site</span>
            </a>
          </div>
        )}

        {/* User Footer */}
        {!isSidebarCollapsed && (
          <SidebarUserFooter
            userName={user?.email?.split('@')[0] || 'Admin'}
            userRole="District Admin"
          />
        )}

        {/* Collapse Button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all w-full"
          >
            <ChevronsLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[260px]'} transition-all duration-200`}>
        {/* Top Header */}
        <header className="h-16 bg-[#faf9f7] border-b border-[#e8e6e1] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          {/* Left: Mobile menu + Title */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-[#f5f3ef] transition-colors"
            >
              <Menu className="h-5 w-5 text-[#4a4a4a]" />
            </button>
            <div>
              <div className="font-semibold text-sm text-[#1a1a1a]">{district.name}</div>
              <div className="text-xs text-[#8a8a8a]">District Admin</div>
            </div>
          </div>
          {/* Spacer for desktop */}
          <div className="hidden lg:block" />
          {/* Right: Actions */}
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

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 flex flex-col">
            {/* Mobile Header with Close */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {district.logo_url ? (
                  <img
                    src={district.logo_url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: district.primary_color || '#D97706' }}
                  >
                    {district.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-[#1a1a1a]">{district.name}</div>
                  <div className="text-xs text-[#8a8a8a]">Strategic Planning</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-[#8a8a8a]" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <SidebarNav
              district={district}
              schools={schools}
              districtSlug={slug || ''}
              onAddSchool={() => {
                setIsAddSchoolModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile View Public Site */}
            <div className="p-3 border-t border-slate-200">
              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Eye size={16} />
                <span>View Public Site</span>
              </a>
            </div>

            {/* Mobile User Footer */}
            <SidebarUserFooter
              userName={user?.email?.split('@')[0] || 'Admin'}
              userRole="District Admin"
            />
          </aside>
        </>
      )}

      {/* Add School Modal */}
      <AddSchoolModal
        isOpen={isAddSchoolModalOpen}
        onClose={() => setIsAddSchoolModalOpen(false)}
        districtId={district.id}
        districtSlug={slug || ''}
      />
    </div>
  );
}
