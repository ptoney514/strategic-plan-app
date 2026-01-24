import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Target,
  BarChart3,
  LayoutDashboard,
  FileBarChart,
  Users,
  HelpCircle,
} from 'lucide-react';

// Logo path - can be moved to R2/CDN later
const LOGO_URL = '/assets/stratadash-logo.png';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string; // relative path (e.g., '', 'plans', 'objectives')
}

const mainNavItems: NavItem[] = [
  { label: 'Home', icon: <Home size={20} />, path: '' },
  { label: 'Strategic plans', icon: <FileText size={20} />, path: 'plans' },
  { label: 'Objectives & goals', icon: <Target size={20} />, path: 'objectives' },
  { label: 'Metrics', icon: <BarChart3 size={20} />, path: 'metrics' },
  { label: 'Dashboards', icon: <LayoutDashboard size={20} />, path: 'dashboards' },
  { label: 'Reports', icon: <FileBarChart size={20} />, path: 'reports' },
];

const footerNavItems: NavItem[] = [
  { label: 'Invite teammates', icon: <Users size={20} />, path: 'invite' },
  { label: 'Help & Support', icon: <HelpCircle size={20} />, path: 'help' },
];

interface DashboardSidebarProps {
  basePath?: string; // e.g., '/' for root, '/admin' for district admin
}

export function DashboardSidebar({ basePath = '/' }: DashboardSidebarProps) {
  const location = useLocation();

  // Build full href from basePath and relative path
  const getHref = (path: string) => {
    if (path === '') return basePath;
    return `${basePath}/${path}`.replace(/\/+/g, '/');
  };

  const isActive = (path: string) => {
    const href = getHref(path);
    if (path === '') {
      // Home is active only on exact match
      return location.pathname === basePath || location.pathname === `${basePath}/`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col w-[270px] text-slate-300 flex-shrink-0 fixed top-0 left-0 bottom-0 z-20 border-r border-slate-700/50"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-slate-700/50">
        <Link to={basePath} className="flex items-center gap-3 group">
          <img
            src={LOGO_URL}
            alt="StrataDASH"
            className="w-9 h-9 object-contain"
          />
          <span className="text-lg font-semibold text-white tracking-tight">StrataDASH</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-6 overflow-y-auto">
        <div className="mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3">
          Menu
        </div>
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={getHref(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive(item.path)
                    ? 'bg-brand-teal/20 text-white shadow-sm border border-brand-teal/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  isActive(item.path) ? 'text-brand-mint' : 'text-slate-400'
                )}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-3 py-4 border-t border-slate-700/50 mb-2" style={{ backgroundColor: '#0F172A' }}>
        <ul className="space-y-1">
          {footerNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={getHref(item.path)}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
