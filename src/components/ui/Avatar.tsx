import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Avatar - Displays a user avatar with image or generic user icon fallback
 *
 * Used throughout the app for user representation in headers,
 * menus, and profile sections. Supports dark mode.
 */
export function Avatar({ name, size = 'md', src, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
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
        'rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      aria-label={name || 'User avatar'}
    >
      <User className={cn('text-slate-600 dark:text-slate-300', iconSizeClasses[size])} />
    </div>
  );
}
