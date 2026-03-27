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
  /** 'light' for white sidebar, 'dark' for editorial dark sidebar */
  variant?: 'light' | 'dark';
}

/**
 * DistrictSwitcher - Dropdown to switch between districts
 *
 * Supports light (white bg) and dark (editorial sidebar) variants.
 * For users with multiple districts, shows a dropdown to switch between them.
 * For users with a single district, shows a static display.
 */
export function DistrictSwitcher({ currentDistrict, className, variant = 'light' }: DistrictSwitcherProps) {
  const { data: districts, isLoading } = useUserDistricts();
  const { slug: currentSlug } = useSubdomain();

  const isDark = variant === 'dark';

  // Don't render if loading or user has only one district (or none)
  if (isLoading || !districts || districts.length <= 1) {
    return (
      <StaticDistrictHeader district={currentDistrict} className={className} isDark={isDark} />
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 p-4 transition-colors',
            'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset',
            isDark
              ? 'focus-visible:ring-white/30'
              : 'focus-visible:ring-brand-teal',
            className
          )}
          style={isDark ? {
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          } : {
            borderBottom: '1px solid var(--editorial-border, #e2e8f0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'var(--editorial-sidebar-hover)' : 'var(--editorial-surface-alt, #f8fafc)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          data-testid="district-switcher"
        >
          <DistrictAvatar district={currentDistrict} />
          <div className="min-w-0 flex-1 text-left">
            <div
              className="font-semibold text-sm truncate"
              style={{ color: isDark ? 'var(--editorial-sidebar-text)' : 'var(--editorial-text-primary)' }}
            >
              {currentDistrict.name}
            </div>
            <div
              className="text-xs"
              style={{ color: isDark ? 'var(--editorial-sidebar-text-muted)' : 'var(--editorial-text-muted)' }}
            >
              Strategic Planning
            </div>
          </div>
          <ChevronDown
            className="w-4 h-4 shrink-0"
            style={{ color: isDark ? 'var(--editorial-sidebar-text-muted)' : 'var(--editorial-text-muted)' }}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[240px] rounded-lg shadow-lg py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            isDark
              ? 'bg-[#2a2a2a] border border-white/10'
              : 'bg-white border border-slate-200'
          )}
        >
          {/* Districts Section Header */}
          <div
            className="px-3 py-1.5 text-xs font-medium"
            style={{ color: isDark ? 'var(--editorial-sidebar-text-muted)' : 'var(--editorial-text-muted)' }}
          >
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
                    'flex items-center gap-3 px-3 py-2 text-sm outline-hidden cursor-pointer transition-colors',
                    isDark
                      ? isCurrent
                        ? 'bg-white/10 text-white'
                        : 'text-[#e8e6e1] hover:bg-white/10 hover:text-white'
                      : isCurrent
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                  )}
                  data-testid="district-option"
                  data-current={isCurrent}
                >
                  <DistrictAvatar district={district} size="sm" />
                  <span className="flex-1 truncate">{district.name}</span>
                  {isCurrent && (
                    <Check
                      className="w-4 h-4 shrink-0"
                      style={{ color: isDark ? 'var(--editorial-accent-secondary)' : 'var(--editorial-accent-primary)' }}
                    />
                  )}
                </a>
              </DropdownMenu.Item>
            );
          })}

          <DropdownMenu.Separator
            className="h-px my-1"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
          />

          {/* View All Districts Link */}
          <DropdownMenu.Item asChild>
            <a
              href={buildSubdomainUrlWithPath('root', '/dashboard')}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm outline-hidden cursor-pointer transition-colors',
                isDark
                  ? 'text-[#e8e6e1] hover:bg-white/10 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <LayoutDashboard
                className="w-4 h-4"
                style={{ color: isDark ? 'var(--editorial-sidebar-text-muted)' : 'var(--editorial-text-muted)' }}
              />
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
function StaticDistrictHeader({ district, className, isDark }: { district: District; className?: string; isDark: boolean }) {
  return (
    <div
      className={cn('p-4', className)}
      style={{
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--editorial-border, #e2e8f0)',
      }}
    >
      <div className="flex items-center gap-3">
        <DistrictAvatar district={district} />
        <div className="min-w-0 flex-1">
          <div
            className="font-semibold text-sm truncate"
            style={{ color: isDark ? 'var(--editorial-sidebar-text)' : 'var(--editorial-text-primary)' }}
          >
            {district.name}
          </div>
          <div
            className="text-xs"
            style={{ color: isDark ? 'var(--editorial-sidebar-text-muted)' : 'var(--editorial-text-muted)' }}
          >
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
      style={{ backgroundColor: district.primary_color || 'var(--editorial-accent-primary)' }}
    >
      {district.name.substring(0, 2).toUpperCase()}
    </div>
  );
}
