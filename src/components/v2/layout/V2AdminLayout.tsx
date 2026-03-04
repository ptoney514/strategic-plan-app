import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Palette, Users, Grid3X3, Upload, Menu, X } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useAuth } from '../../../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '', icon: LayoutDashboard, end: true },
  { label: 'Plans & Goals', path: '/plans', icon: FileText, end: false },
  { label: 'Appearance', path: '/appearance', icon: Palette, end: false },
  { label: 'Team', path: '/team', icon: Users, end: false },
  { label: 'Widgets', path: '/widgets', icon: Grid3X3, end: false },
  { label: 'Import', path: '/import', icon: Upload, end: false },
];

export function V2AdminLayout() {
  const { slug } = useSubdomain();
  const { data: district, isLoading } = useDistrict(slug || '');
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const basePath = '/admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--editorial-accent-primary)' }} />
          <p className="mt-4" style={{ color: 'var(--editorial-text-primary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <p className="text-xl" style={{ color: 'var(--editorial-text-primary)' }}>District not found</p>
      </div>
    );
  }

  const userName = user?.email?.split('@')[0] || 'Admin';
  const { name, logo_url, primary_color } = district;
  const initials = name.substring(0, 2).toUpperCase();
  const logoBg = primary_color || 'var(--editorial-accent-primary)';

  function DistrictLogo({ size = 'w-9 h-9' }: { size?: string }) {
    return logo_url ? (
      <img src={logo_url} alt="" className={`${size} rounded-lg object-cover`} />
    ) : (
      <div className={`${size} rounded-lg flex items-center justify-center text-white font-bold text-xs`} style={{ backgroundColor: logoBg }}>
        {initials}
      </div>
    );
  }

  function renderNav(onNavigate?: () => void) {
    return (
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={`${basePath}${path}`}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--editorial-accent-primary)' : 'var(--editorial-sidebar-text-muted)',
            })}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    );
  }

  const sidebarHeader = (
    <div className="px-4 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <DistrictLogo />
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--editorial-sidebar-text)' }}>{district.name}</div>
        <div className="text-xs truncate" style={{ color: 'var(--editorial-sidebar-text-muted)' }}>{userName}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0" style={{ backgroundColor: 'var(--editorial-sidebar-bg)' }}>
        {sidebarHeader}
        {renderNav()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4" style={{ backgroundColor: 'var(--editorial-surface)', borderBottom: '1px solid var(--editorial-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md transition-colors"
                style={{ color: 'var(--editorial-text-primary)' }}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="lg:hidden">
                <div className="font-semibold text-sm" style={{ color: 'var(--editorial-text-primary)' }}>{district.name}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--editorial-bg)' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col" style={{ backgroundColor: 'var(--editorial-sidebar-bg)' }}>
            <div className="px-4 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <DistrictLogo />
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--editorial-sidebar-text)' }}>{district.name}</div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--editorial-sidebar-text-muted)' }} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNav(() => setIsMobileMenuOpen(false))}
          </aside>
        </>
      )}
    </div>
  );
}
