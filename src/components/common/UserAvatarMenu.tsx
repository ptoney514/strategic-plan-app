import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings, LogOut, User, LayoutDashboard, ChevronDown, Building2, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubdomain } from '../../contexts/SubdomainContext';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { buildSubdomainUrlWithPath, getSubdomainUrl } from '../../lib/subdomain';
import { supabase } from '../../lib/supabase';

interface AdminDistrict {
  district_slug: string;
  district_name: string;
}

interface UserAvatarMenuProps {
  className?: string;
  showName?: boolean;
}

/**
 * UserAvatarMenu - Production-ready user dropdown menu with avatar
 *
 * Features:
 * - Radix UI DropdownMenu for accessibility (focus trapping, keyboard nav, ARIA)
 * - Circular avatar with initials fallback
 * - Menu items: My Profile, Settings, Admin, Sign Out
 * - Fade + slide animation
 * - Mobile responsive (hides username on small screens)
 */
export function UserAvatarMenu({ className, showName = true }: UserAvatarMenuProps) {
  const { user, logout, isSystemAdmin } = useAuth();
  const { type: subdomainType } = useSubdomain();
  const navigate = useNavigate();
  const [adminDistricts, setAdminDistricts] = useState<AdminDistrict[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  // Build dashboard URL - use absolute URL on non-root subdomains
  const dashboardUrl = subdomainType === 'root'
    ? '/dashboard'
    : getSubdomainUrl('root') + '/dashboard';

  // Fetch user's admin districts
  useEffect(() => {
    async function fetchAdminDistricts() {
      if (!user) {
        setLoadingDistricts(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('spb_district_admins')
          .select(`
            district_slug,
            spb_districts!inner(name)
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to fetch admin districts:', error);
          return;
        }

        if (data) {
          const districts = data.map((d) => {
            // The join returns spb_districts as an object with name property
            const districtData = d.spb_districts as unknown as { name: string } | null;
            return {
              district_slug: d.district_slug,
              district_name: districtData?.name || d.district_slug,
            };
          });
          setAdminDistricts(districts);
        }
      } finally {
        setLoadingDistricts(false);
      }
    }

    fetchAdminDistricts();
  }, [user]);

  // Get display name from user metadata or fall back to email
  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Determine if user has any admin access
  const hasAdminAccess = isSystemAdmin || adminDistricts.length > 0;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
            className
          )}
          aria-label="User menu"
        >
          <Avatar name={displayName} size="md" />
          {showName && (
            <>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 min-w-[220px] bg-white rounded-lg shadow-lg border border-slate-200 py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          {/* Navigation Items */}
          <div className="py-1">
            <DropdownMenu.Item asChild>
              {subdomainType === 'root' ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-teal" />
                  Dashboard
                </Link>
              ) : (
                <a
                  href={dashboardUrl}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-teal" />
                  Dashboard
                </a>
              )}
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                to="/account"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                to="/account"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </Link>
            </DropdownMenu.Item>
          </div>

          {/* Admin Section - Only shown if user has admin access and districts loaded */}
          {!loadingDistricts && hasAdminAccess && (
            <>
              <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Admin
                </div>

                {/* System Admin link - only for system admins */}
                {isSystemAdmin && (
                  <DropdownMenu.Item asChild>
                    <a
                      href={buildSubdomainUrlWithPath('admin')}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      System Admin
                    </a>
                  </DropdownMenu.Item>
                )}

                {/* District admin links */}
                {adminDistricts.map((district) => (
                  <DropdownMenu.Item key={district.district_slug} asChild>
                    <a
                      href={buildSubdomainUrlWithPath('district', '/admin', district.district_slug)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-brand-teal" />
                      {district.district_name}
                    </a>
                  </DropdownMenu.Item>
                ))}
              </div>
            </>
          )}

          {/* Sign Out */}
          <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
          <div className="py-1">
            <DropdownMenu.Item
              onSelect={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors w-full"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              Sign Out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
