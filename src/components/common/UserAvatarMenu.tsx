import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, Building2, Shield, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import { supabase } from '../../lib/supabase';

interface AdminDistrict {
  district_slug: string;
  district_name: string;
}

interface UserAvatarMenuProps {
  className?: string;
}

/**
 * UserAvatarMenu - Supabase-style user dropdown menu with avatar
 *
 * Features:
 * - Radix UI DropdownMenu for accessibility (focus trapping, keyboard nav, ARIA)
 * - Circular avatar with user icon
 * - User info header with name and role
 * - Admin navigation links (System Admin, District admins)
 * - Theme selector (Dark/Light/System)
 * - Full dark mode support
 */
export function UserAvatarMenu({ className }: UserAvatarMenuProps) {
  const { user, logout, isSystemAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [adminDistricts, setAdminDistricts] = useState<AdminDistrict[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

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

  // Get user role label
  const roleLabel = isSystemAdmin ? 'System Admin' : 'District Admin';

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
            'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
            className
          )}
          aria-label="User menu"
        >
          <Avatar size="md" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 min-w-[220px] bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {roleLabel}
            </p>
          </div>

          {/* Admin Section - Only shown if user has admin access and districts loaded */}
          {!loadingDistricts && hasAdminAccess && (
            <>
              <div className="py-1">
                {/* System Admin link - only for system admins */}
                {isSystemAdmin && (
                  <DropdownMenu.Item asChild>
                    <a
                      href={buildSubdomainUrlWithPath('admin')}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                      System Admin
                    </a>
                  </DropdownMenu.Item>
                )}

                {/* District admin links */}
                {adminDistricts.map((district) => (
                  <DropdownMenu.Item key={district.district_slug} asChild>
                    <a
                      href={buildSubdomainUrlWithPath('district', '/admin', district.district_slug)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-brand-teal" />
                      {district.district_name}
                    </a>
                  </DropdownMenu.Item>
                ))}
              </div>
              <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
            </>
          )}

          {/* Theme Section */}
          <div className="py-1">
            <div className="px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Theme
            </div>
            <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
              <DropdownMenu.RadioItem
                value="dark"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors"
              >
                <Moon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="flex-1">Dark</span>
                <DropdownMenu.ItemIndicator>
                  <Check className="w-4 h-4 text-brand-teal" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value="light"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors"
              >
                <Sun className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="flex-1">Light</span>
                <DropdownMenu.ItemIndicator>
                  <Check className="w-4 h-4 text-brand-teal" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value="system"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors"
              >
                <Monitor className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="flex-1">System</span>
                <DropdownMenu.ItemIndicator>
                  <Check className="w-4 h-4 text-brand-teal" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </div>

          {/* Sign Out */}
          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
          <div className="py-1">
            <DropdownMenu.Item
              onSelect={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 outline-none cursor-pointer transition-colors w-full"
            >
              <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Log out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
