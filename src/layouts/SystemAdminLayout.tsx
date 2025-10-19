import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Building2, Settings, LogOut, Shield } from 'lucide-react';

/**
 * SystemAdminLayout - Layout for system administrator area (/admin)
 * Only accessible to system administrators
 */
export function SystemAdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* System Admin Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-white">System Administration</h1>
                <p className="text-xs text-slate-300">Strategic Plan Builder</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link
                to="/admin"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Building2 className="h-4 w-4 inline mr-1" />
                Districts
              </Link>
              <Link
                to="/admin/settings"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Settings
              </Link>
              <button
                onClick={() => navigate('/')}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Exit Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
