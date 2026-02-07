import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAdminContext } from '../hooks/useAdminContext';
import { useAuth } from '../contexts/AuthContext';
import {
  SidebarNav,
  SidebarHeader,
  SidebarFooter,
  SidebarUserFooter,
} from '../components/admin/nav';
import { UserAvatarMenu } from '../components/common/UserAvatarMenu';

/**
 * ClientAdminLayout - Unified admin layout with editorial dark sidebar
 * Supports both district and school admin contexts
 */
export function ClientAdminLayout() {
  const navigate = useNavigate();
  const {
    district,
    school,
    schools,
    districtSlug,
    schoolSlug,
    publicUrl,
    isLoading,
  } = useAdminContext();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);

  // Handle view public site
  const handleViewPublic = () => {
    navigate(publicUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--editorial-accent-primary)' }} />
          <p className="mt-4" style={{ color: 'var(--editorial-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <div className="text-center">
          <p className="text-xl" style={{ color: 'var(--editorial-text-muted)' }}>District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center hover:underline" style={{ color: 'var(--editorial-accent-primary)' }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get user display info
  const userName = user?.email?.split('@')[0] || 'Admin';
  const userRole = schoolSlug ? 'School Admin' : 'District Admin';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      {/* Left Sidebar - Desktop (Editorial Dark) */}
      <aside className="hidden lg:flex lg:flex-col w-72 flex-shrink-0" style={{ backgroundColor: 'var(--editorial-sidebar-bg)' }}>
        {/* Sidebar Header */}
        <SidebarHeader
          district={district}
          userEmail={user?.email}
          userRole={userRole}
        />

        {/* Navigation */}
        <SidebarNav
          district={district}
          schools={schools || []}
          districtSlug={districtSlug}
          schoolSlug={schoolSlug}
          onAddSchool={() => setShowAddSchoolModal(true)}
        />

        {/* User Footer */}
        <SidebarUserFooter userName={userName} userRole={userRole} />

        {/* View Public Footer */}
        <SidebarFooter publicUrl={publicUrl} onNavigate={handleViewPublic} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="border-b px-6 py-4" style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}>
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md transition-colors"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="lg:hidden">
                <div className="font-semibold text-sm" style={{ color: 'var(--editorial-text-primary)' }}>
                  {school?.name || district.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>{userRole}</div>
              </div>
            </div>

            {/* Right: User Menu with Dropdown */}
            <div className="flex items-center gap-3">
              <UserAvatarMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar (Editorial Dark) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside
            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--editorial-sidebar-bg)' }}
          >
            {/* Mobile Header with Close */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
                    style={{ backgroundColor: district.primary_color || 'var(--editorial-accent-primary)' }}
                  >
                    {district.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--editorial-sidebar-text)' }}>{district.name}</div>
                  <div className="text-xs" style={{ color: 'var(--editorial-sidebar-text-muted)' }}>Strategic Planning</div>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--editorial-sidebar-text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <SidebarNav
              district={district}
              schools={schools || []}
              districtSlug={districtSlug}
              schoolSlug={schoolSlug}
              onAddSchool={() => {
                setShowAddSchoolModal(true);
                setIsMobileMenuOpen(false);
              }}
              onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile User Footer */}
            <SidebarUserFooter userName={userName} userRole={userRole} />

            {/* Mobile View Public Footer */}
            <SidebarFooter
              publicUrl={publicUrl}
              onNavigate={() => {
                handleViewPublic();
                setIsMobileMenuOpen(false);
              }}
            />
          </aside>
        </>
      )}

      {/* Add School Modal Placeholder */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl w-full max-w-md mx-4 p-6" style={{ backgroundColor: 'var(--editorial-surface)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--editorial-text-primary)' }}>Add School</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-muted)' }}>
              School creation modal coming soon...
            </p>
            <button
              onClick={() => setShowAddSchoolModal(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-secondary)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
