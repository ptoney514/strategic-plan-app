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
} from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientAdminFullWidthLayout - Full-width layout for pages like Objective Builder
 * Same header as ClientAdminLayout but no container constraints on content
 */
export function ClientAdminFullWidthLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: district, isLoading } = useDistrict(slug!);

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
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Brand */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <span className="font-semibold text-foreground">Strategic Plan</span>
              </div>

              <div className="h-6 w-px bg-border" />

              {/* District Selector */}
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{district.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {/* Center: Main Navigation */}
            <nav className="flex items-center space-x-1">
              <Link
                to={`/${slug}/admin`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin`) && !location.pathname.includes('/goals') && !location.pathname.includes('/metrics') && !location.pathname.includes('/audit')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4" />
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
                to={`/${slug}/admin/metrics`}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(`/${slug}/admin/metrics`)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Measures</span>
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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/${slug}`)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Public</span>
              </button>

              <div className="h-6 w-px bg-border" />

              {/* User Menu */}
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Admin</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width (No Container) */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
