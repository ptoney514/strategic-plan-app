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
 * ClientAdminLayout - Redesigned admin layout with hierarchical sidebar
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-500">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-amber-600 hover:underline">
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r border-slate-200">
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
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-50 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>

              <div className="lg:hidden">
                <div className="font-semibold text-sm text-slate-900">
                  {school?.name || district.name}
                </div>
                <div className="text-xs text-slate-500">{userRole}</div>
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
                  <div className="font-semibold text-sm text-slate-900">{district.name}</div>
                  <div className="text-xs text-slate-500">Strategic Planning</div>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
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
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Add School</h2>
            <p className="text-slate-500 text-sm mb-4">
              School creation modal coming soon...
            </p>
            <button
              onClick={() => setShowAddSchoolModal(false)}
              className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
