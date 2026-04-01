'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  FileText,
  Target,
  BarChart3,
  LayoutDashboard,
  FileBarChart,
  Users,
  HelpCircle,
  Palette,
  Shapes,
  ChevronDown,
  Check,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';
import { useUserDistricts } from '../../hooks/useUserDistricts';
import { useSubdomain } from '../../contexts/SubdomainContext';
import { useDistrict } from '../../hooks/useDistricts';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { District } from '../../lib/types';

// Logo path - can be moved to R2/CDN later
const LOGO_URL = '/assets/stratadash-logo.png';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string; // relative path (e.g., '', 'plans', 'objectives')
}

const mainNavItems: NavItem[] = [
  { label: 'Home', icon: <Home size={20} />, path: '' },
  { label: 'Districts', icon: <Building2 size={20} />, path: 'districts' },
  { label: 'Strategic plans', icon: <FileText size={20} />, path: 'plans' },
  { label: 'Objectives & goals', icon: <Target size={20} />, path: 'objectives' },
  { label: 'Metrics', icon: <BarChart3 size={20} />, path: 'metrics' },
  { label: 'Dashboards', icon: <LayoutDashboard size={20} />, path: 'dashboards' },
  { label: 'Reports', icon: <FileBarChart size={20} />, path: 'reports' },
  { label: 'Appearance', icon: <Palette size={20} />, path: 'appearance' },
  { label: 'Visual Library', icon: <Shapes size={20} />, path: 'visuals' },
];

const footerNavItems: NavItem[] = [
  { label: 'Invite teammates', icon: <Users size={20} />, path: 'invite' },
  { label: 'Help & Support', icon: <HelpCircle size={20} />, path: 'help' },
];

interface DashboardSidebarProps {
  basePath?: string; // e.g., '/' for root, '/admin' for district admin
}

export function DashboardSidebar({ basePath = '/' }: DashboardSidebarProps) {
  const location = { pathname: usePathname() ?? '/' };
  const { type: subdomainType, slug: currentSlug } = useSubdomain();
  const { data: currentDistrict, isLoading: isDistrictLoading } = useDistrict(currentSlug || '');
  const { data: districts, isLoading: isDistrictsLoading } = useUserDistricts();

  // Check if we're on a district subdomain (not root or admin)
  const isDistrictContext = subdomainType === 'district' && currentSlug;
  const hasMultipleDistricts = (districts?.length ?? 0) > 1;
  const isLoading = isDistrictLoading || isDistrictsLoading;

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
      className="flex flex-col w-[270px] text-slate-300 shrink-0 fixed top-0 left-0 bottom-0 z-40 border-r border-slate-700/50"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Header Area - District Switcher or Logo */}
      {isDistrictContext ? (
        isLoading ? (
          <DistrictHeaderSkeleton />
        ) : currentDistrict && hasMultipleDistricts ? (
          <DistrictSwitcherHeader
            currentDistrict={currentDistrict}
            districts={districts || []}
            currentSlug={currentSlug}
            basePath={basePath}
          />
        ) : currentDistrict ? (
          <StaticDistrictHeader district={currentDistrict} basePath={basePath} />
        ) : (
          <FallbackDistrictHeader slug={currentSlug} basePath={basePath} />
        )
      ) : (
        <div className="h-[72px] flex items-center px-6 border-b border-slate-700/50">
          <Link href={basePath} className="flex items-center gap-3 group">
            <img
              src={LOGO_URL}
              alt="StrataDASH"
              className="w-9 h-9 object-contain"
            />
            <span className="text-lg font-semibold text-white tracking-tight">StrataDASH</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="grow px-3 py-6 overflow-y-auto">
        <div className="mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3">
          Menu
        </div>
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <Link
                href={getHref(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive(item.path)
                    ? 'bg-brand-teal/20 text-white shadow-xs border border-brand-teal/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <span className={cn(
                  'shrink-0',
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
                href={getHref(item.path)}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/**
 * District avatar component for dark sidebar
 */
function DistrictAvatar({ district, size = 'md' }: { district: District; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (district.logo_url) {
    return (
      <img
        src={district.logo_url}
        alt=""
        className={cn(sizeClasses, 'rounded-lg object-cover shrink-0')}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses,
        'rounded-lg flex items-center justify-center text-white font-bold shrink-0'
      )}
      style={{ backgroundColor: district.primary_color || '#D97706' }}
    >
      {district.name.substring(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * Loading skeleton for district header
 */
function DistrictHeaderSkeleton() {
  return (
    <div className="h-[72px] flex items-center gap-3 px-4 border-b border-slate-700/50">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-lg bg-slate-700 animate-pulse shrink-0" />
      <div className="min-w-0 flex-1">
        {/* Name skeleton */}
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse mb-1.5" />
        {/* Subtitle skeleton */}
        <div className="h-3 w-24 bg-slate-700/60 rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Fallback header when district data fails to load
 */
function FallbackDistrictHeader({ slug, basePath }: { slug: string; basePath: string }) {
  // Format slug for display (e.g., "westside" -> "Westside")
  const displayName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="h-[72px] flex items-center px-4 border-b border-slate-700/50">
      <Link href={basePath} className="flex items-center gap-3 group min-w-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0 bg-slate-600"
        >
          {displayName.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm truncate">{displayName}</div>
          <div className="text-xs text-slate-400">Strategic Planning</div>
        </div>
      </Link>
    </div>
  );
}

/**
 * Static district header - shown when user has only one district
 */
function StaticDistrictHeader({ district, basePath }: { district: District; basePath: string }) {
  return (
    <div className="h-[72px] flex items-center px-4 border-b border-slate-700/50">
      <Link href={basePath} className="flex items-center gap-3 group min-w-0">
        <DistrictAvatar district={district} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm truncate">{district.name}</div>
          <div className="text-xs text-slate-400">Strategic Planning</div>
        </div>
      </Link>
    </div>
  );
}

/**
 * District switcher header - shown when user has multiple districts
 */
function DistrictSwitcherHeader({
  currentDistrict,
  districts,
  currentSlug,
  basePath,
}: {
  currentDistrict: District;
  districts: District[];
  currentSlug: string;
  basePath: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-[72px] w-full flex items-center gap-3 px-4 border-b border-slate-700/50 hover:bg-white/5 transition-colors focus:outline-hidden"
          data-testid="district-switcher"
        >
          <DistrictAvatar district={currentDistrict} />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-semibold text-white text-sm truncate">{currentDistrict.name}</div>
            <div className="text-xs text-slate-400">Strategic Planning</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[240px] bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="px-3 py-1.5 text-xs font-medium text-slate-400">
            Your Districts
          </div>

          {districts.map((district) => {
            const isCurrent = district.slug === currentSlug;
            return (
              <DropdownMenu.Item key={district.id} asChild>
                <a
                  href={buildSubdomainUrlWithPath('district', basePath, district.slug)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm outline-hidden cursor-pointer transition-colors',
                    isCurrent
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )}
                  data-testid="district-option"
                  data-current={isCurrent}
                >
                  <DistrictAvatar district={district} size="sm" />
                  <span className="flex-1 truncate">{district.name}</span>
                  {isCurrent && (
                    <Check className="w-4 h-4 text-brand-mint shrink-0" />
                  )}
                </a>
              </DropdownMenu.Item>
            );
          })}

          <DropdownMenu.Separator className="h-px bg-slate-700 my-1" />

          <DropdownMenu.Item asChild>
            <a
              href={buildSubdomainUrlWithPath('root', '/dashboard')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white outline-hidden cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>View All Districts</span>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
