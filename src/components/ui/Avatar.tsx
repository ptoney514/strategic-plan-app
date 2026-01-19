import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

/**
 * Generates initials from a name string.
 * - If name has multiple words, uses first letter of first and last word
 * - Otherwise uses first two characters
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'U';

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return trimmed.substring(0, 2).toUpperCase();
}

/**
 * Avatar - Displays a user avatar with image or initials fallback
 *
 * Used throughout the app for user representation in headers,
 * menus, and profile sections.
 */
export function Avatar({ name, size = 'md', src, className }: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold',
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
