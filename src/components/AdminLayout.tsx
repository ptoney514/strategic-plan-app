import React from 'react';
import { Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronLeft,
  Shield,
  Users,
  Upload,
  Eye
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { slug } = useParams();
  const location = useLocation();
  
  // For now, we'll have a simple auth check
  // In production, this would check actual auth status
  const isAdmin = true; // TODO: Implement proper auth
  
  if (!isAdmin) {
    return <Navigate to={`/${slug}`} replace />;
  }
  
  const navItems = [
    { 
      path: `/${slug}/admin`, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      exact: true 
    },
    { 
      path: `/${slug}/admin/goals`, 
      label: 'Goals & Status', 
      icon: Target 
    },
    { 
      path: `/${slug}/admin/metrics`, 
      label: 'Metrics Data', 
      icon: BarChart3 
    },
    { 
      path: `/${slug}/admin/audit`, 
      label: 'Audit Trail', 
      icon: FileText 
    },
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header Bar */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Admin Mode
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to={`/${slug}`}
              className="flex items-center space-x-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <Eye className="h-4 w-4" />
              <span>View Public Site</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-48px)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <Link 
              to={`/${slug}`}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to District</span>
            </Link>
            
            <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
            
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left rounded-md hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  <span>Import Data</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left rounded-md hover:bg-muted">
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left rounded-md hover:bg-muted">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}