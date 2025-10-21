import { useState } from 'react';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  Target,
  BarChart2,
  FileText,
  Eye,
  Home,
  ChevronDown,
  User,
  LogOut,
  Palette,
  Menu,
  X
} from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientAdminLayout - Layout for client admin area (/:slug/admin)
 * Supabase-style layout with left sidebar and top header
 */
export function ClientAdminLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: district, isLoading } = useDistrict(slug!);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header with All Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Brand */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-2">
                {/* Placeholder for logo - replace with actual logo when available */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <span className="font-semibold text-foreground hidden sm:inline">Strategic Plan</span>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* District Selector - Hidden on mobile */}
              <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{district.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {/* Center: Main Navigation - Desktop Only */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to={`/${slug}/admin`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin`) && !location.pathname.includes('/goals') && !location.pathname.includes('/settings') && !location.pathname.includes('/audit')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to={`/${slug}/admin/goals`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/goals`) || isActiveRoute(`/${slug}/admin/objectives`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Link>

              <Link
                to={`/${slug}/admin/settings`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/settings`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Branding</span>
              </Link>

              <Link
                to={`/${slug}/admin/audit`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/audit`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Audit</span>
              </Link>
            </nav>

            {/* Right: Actions & User */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate(`/${slug}`)}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">View Public</span>
              </button>

              <div className="h-6 w-px bg-border hidden sm:block" />

              {/* User Menu - Desktop */}
              <button className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground hidden md:inline">Admin</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <nav className="px-4 py-3 space-y-1">
              <Link
                to={`/${slug}/admin`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin`) && !location.pathname.includes('/goals') && !location.pathname.includes('/settings') && !location.pathname.includes('/audit')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to={`/${slug}/admin/goals`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/goals`) || isActiveRoute(`/${slug}/admin/objectives`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Link>

              <Link
                to={`/${slug}/admin/settings`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/settings`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Branding</span>
              </Link>

              <Link
                to={`/${slug}/admin/audit`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/audit`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Audit</span>
              </Link>

              <div className="pt-2 mt-2 border-t border-border">
                <button
                  onClick={() => {
                    navigate(`/${slug}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors w-full"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Public</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
