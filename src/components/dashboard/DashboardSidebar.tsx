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
    <aside className="flex flex-col w-[270px] bg-[#1E1B4B] text-slate-300 flex-shrink-0 fixed top-0 left-0 bottom-0 z-20 border-r border-indigo-900/50">
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-indigo-900/50">
        <Link to={basePath} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <BarChart3 className="text-white" size={20} />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">StrataDASH</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-6 overflow-y-auto">
        <div className="mb-3 text-[11px] font-semibold text-indigo-300/60 uppercase tracking-widest px-3">
          Menu
        </div>
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={getHref(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                  isActive(item.path)
                    ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
                )}
              >
                <span className={cn(isActive(item.path) ? 'text-white' : 'text-current')}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-3 py-4 border-t border-indigo-900/50 bg-[#1E1B4B] mb-2">
        <ul className="space-y-1">
          {footerNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={getHref(item.path)}
                className="flex items-center gap-3 px-3 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
