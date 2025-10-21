import { useState } from 'react';
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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientAdminLayout - Redesigned admin layout with left sidebar (Webflow-style)
 */
export function ClientAdminLayout() {
  const { slug, schoolSlug } = useParams<{ slug: string; schoolSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: district, isLoading } = useDistrict(slug!);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if we're in school admin context
  const isSchoolAdmin = !!schoolSlug;
  const basePath = isSchoolAdmin ? `/${slug}/schools/${schoolSlug}/admin` : `/${slug}/admin`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">
                {isSchoolAdmin ? schoolSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : district.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {isSchoolAdmin ? 'School Admin' : 'District Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main */}
          <div>
            <Link
              to={basePath}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === basePath
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Content Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Content
            </div>
            <div className="space-y-1">
              <Link
                to={`${basePath}/goals`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActiveRoute(`${basePath}/goals`) || isActiveRoute(`${basePath}/objectives`)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Link>

              {/* Schools - Only show for district admins */}
              {!isSchoolAdmin && (
                <Link
                  to={`/${slug}/admin/schools`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActiveRoute(`/${slug}/admin/schools`)
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Schools</span>
                </Link>
              )}

              <Link
                to={`${basePath}/import`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActiveRoute(`${basePath}/import`)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Import Data</span>
              </Link>
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Settings
            </div>
            <div className="space-y-1">
              <Link
                to={`${basePath}/settings`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActiveRoute(`${basePath}/settings`)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Branding</span>
              </Link>

              <Link
                to={`${basePath}/audit`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActiveRoute(`${basePath}/audit`)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Activity Log</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate(isSchoolAdmin ? `/${slug}/schools/${schoolSlug}` : `/${slug}`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Public</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>

              <div className="lg:hidden">
                <div className="font-semibold text-sm text-gray-900">{district.name}</div>
                <div className="text-xs text-gray-500">{isSchoolAdmin ? 'School' : 'District'} Admin</div>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
                <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:inline" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{district.name}</div>
                  <div className="text-xs text-gray-500">{isSchoolAdmin ? 'School' : 'District'} Admin</div>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Same navigation as desktop */}
              <div>
                <Link
                  to={basePath}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === basePath
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Content
                </div>
                <div className="space-y-1">
                  <Link
                    to={`${basePath}/goals`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveRoute(`${basePath}/goals`)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    <span>Goals</span>
                  </Link>

                  {!isSchoolAdmin && (
                    <Link
                      to={`/${slug}/admin/schools`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActiveRoute(`/${slug}/admin/schools`)
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Schools</span>
                    </Link>
                  )}

                  <Link
                    to={`${basePath}/import`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveRoute(`${basePath}/import`)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Import Data</span>
                  </Link>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Settings
                </div>
                <div className="space-y-1">
                  <Link
                    to={`${basePath}/settings`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveRoute(`${basePath}/settings`)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Palette className="h-4 w-4" />
                    <span>Branding</span>
                  </Link>

                  <Link
                    to={`${basePath}/audit`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActiveRoute(`${basePath}/audit`)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span>Activity</span>
                  </Link>
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate(isSchoolAdmin ? `/${slug}/schools/${schoolSlug}` : `/${slug}`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Public</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
