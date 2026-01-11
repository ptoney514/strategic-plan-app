import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'header';
}

export function ThemeToggle({ variant = 'header' }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  const baseClasses = 'p-2 rounded-lg transition-colors';
  const variantClasses = variant === 'header'
    ? 'text-white hover:bg-white/10'
    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

  return (
    <button
      onClick={toggle}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" strokeWidth={1.5} />
      ) : (
        <Moon className="w-5 h-5" strokeWidth={1.5} />
      )}
    </button>
  );
}
