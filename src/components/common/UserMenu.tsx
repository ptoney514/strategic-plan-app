import { UserAvatarMenu } from './UserAvatarMenu';

/**
 * UserMenu - Reusable user dropdown menu
 *
 * @deprecated Use UserAvatarMenu directly for new code.
 * This component is maintained for backward compatibility.
 *
 * Shows user avatar/initials with dropdown for:
 * - My Profile link
 * - Settings link
 * - Admin Dashboard (for admins)
 * - Sign Out button
 *
 * Used on marketing page and other authenticated pages.
 */
export function UserMenu() {
  return <UserAvatarMenu />;
}
