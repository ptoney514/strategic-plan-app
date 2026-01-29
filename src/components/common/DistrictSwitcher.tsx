import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useUserDistricts } from '../../hooks/useUserDistricts';
import { useSubdomain } from '../../contexts/SubdomainContext';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import { cn } from '../../lib/utils';
import type { District } from '../../lib/types';

interface DistrictSwitcherProps {
  currentDistrict: District;
  className?: string;
}

/**
 * DistrictSwitcher - Dropdown to switch between districts
 *
 * Similar to Supabase's organization/project switcher pattern.
 * Shows current district and allows switching to other districts
 * the user has admin access to.
 *
 * Features:
 * - Current district displayed with logo/initials
 * - Dropdown with all accessible districts
 * - Checkmark on current district
 * - "View All Districts" link to main dashboard
 * - Only renders if user has multiple districts
 */
export function DistrictSwitcher({ currentDistrict, className }: DistrictSwitcherProps) {
  const { data: districts, isLoading } = useUserDistricts();
  const { slug: currentSlug } = useSubdomain();

  // Don't render if loading or user has only one district (or none)
  if (isLoading || !districts || districts.length <= 1) {
    return (
      <StaticDistrictHeader district={currentDistrict} className={className} />
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700',
            'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal',
            className
          )}
          data-testid="district-switcher"
        >
          <DistrictAvatar district={currentDistrict} />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {currentDistrict.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Strategic Planning
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[240px] bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2'
          )}
        >
          {/* Districts Section Header */}
          <div className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Your Districts
          </div>

          {/* District List */}
          {districts.map((district) => {
            const isCurrent = district.slug === currentSlug;
            return (
              <DropdownMenu.Item
                key={district.id}
                asChild
              >
                <a
                  href={buildSubdomainUrlWithPath('district', '/admin', district.slug)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm outline-none cursor-pointer transition-colors',
                    isCurrent
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  data-testid="district-option"
                  data-current={isCurrent}
                >
                  <DistrictAvatar district={district} size="sm" />
                  <span className="flex-1 truncate">{district.name}</span>
                  {isCurrent && (
                    <Check className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  )}
                </a>
              </DropdownMenu.Item>
            );
          })}

          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {/* View All Districts Link */}
          <DropdownMenu.Item asChild>
            <a
              href={buildSubdomainUrlWithPath('root', '/dashboard')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 outline-none cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>View All Districts</span>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * Static district header - shown when user has only one district
 */
function StaticDistrictHeader({ district, className }: { district: District; className?: string }) {
  return (
    <div className={cn('p-4 border-b border-slate-200 dark:border-slate-700', className)}>
      <div className="flex items-center gap-3">
        <DistrictAvatar district={district} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
            {district.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Strategic Planning
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * District avatar component - shows logo or initials
 */
function DistrictAvatar({ district, size = 'md' }: { district: District; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (district.logo_url) {
    return (
      <img
        src={district.logo_url}
        alt=""
        className={cn(sizeClasses, 'rounded-lg object-cover flex-shrink-0')}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses,
        'rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0'
      )}
      style={{ backgroundColor: district.primary_color || '#D97706' }}
    >
      {district.name.substring(0, 2).toUpperCase()}
    </div>
  );
}
