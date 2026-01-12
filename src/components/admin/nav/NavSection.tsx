import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

interface NavSectionProps {
  label: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

/**
 * Collapsible navigation section with header
 */
export function NavSection({ label, defaultExpanded = true, children }: NavSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {label}
      </button>

      {expanded && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  indent?: number;
  onClick?: () => void;
  children?: ReactNode;
  badge?: ReactNode;
}

/**
 * Single navigation item with icon
 */
export function NavItem({
  icon: Icon,
  label,
  active = false,
  indent = 0,
  onClick,
  children,
  badge,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
      style={{ paddingLeft: `${12 + indent * 12}px` }}
    >
      <Icon size={16} />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge}
      {children}
    </button>
  );
}

interface NavLinkProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  indent?: number;
  badge?: ReactNode;
  onNavigate?: () => void;
}

/**
 * Navigation link item (uses anchor tag styling but expects onClick handler for navigation)
 */
export function NavLink({
  icon: Icon,
  label,
  active = false,
  indent = 0,
  badge,
  onNavigate,
}: NavLinkProps) {
  return (
    <button
      onClick={onNavigate}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
      }`}
      style={{ paddingLeft: `${12 + indent * 12}px` }}
    >
      <Icon size={16} />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge}
    </button>
  );
}
