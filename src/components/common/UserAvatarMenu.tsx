import { Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

            <DropdownMenu.Item asChild>
              <a
                href={buildSubdomainUrlWithPath('admin')}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                Admin
              </a>
            </DropdownMenu.Item>
          </div>

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
