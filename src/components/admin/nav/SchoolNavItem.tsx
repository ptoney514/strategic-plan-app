import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Target,
  Users,
  Palette,
} from 'lucide-react';
import type { School } from '../../../lib/types';

interface SchoolNavItemProps {
  school: School;
  districtSlug: string;
  onMobileClose?: () => void;
}

/**
 * School navigation item with expandable sub-navigation
 * Shows: Overview, Objectives, Users, Appearance
 */
export function SchoolNavItem({ school, districtSlug, onMobileClose }: SchoolNavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  // With subdomain routing, school admin path doesn't need district slug
  const schoolBasePath = `/schools/${school.slug}/admin`;
  const isActive = location.pathname.startsWith(schoolBasePath);

  // Auto-expand if this school is active
  const isExpanded = expanded || isActive;

  const handleNavigate = (path: string) => {
    navigate(path);
    onMobileClose?.();
  };

  const isSubItemActive = (section: string) => {
    if (section === 'overview') {
      return location.pathname === schoolBasePath;
    }
    return location.pathname === `${schoolBasePath}/${section}`;
  };

  return (
    <div>
      {/* School Header */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!isActive) {
            handleNavigate(schoolBasePath);
          }
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive && isSubItemActive('overview')
            ? 'bg-amber-50 text-amber-700'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
        style={{ paddingLeft: '24px' }}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Building2 size={16} />
        <span className="flex-1 text-left truncate">{school.name}</span>
        {!school.is_public && (
          <span className="w-2 h-2 bg-amber-400 rounded-full" title="Draft" />
        )}
      </button>

      {/* Sub-navigation */}
      {isExpanded && (
        <div className="ml-4 space-y-0.5 mt-0.5">
          <button
            onClick={() => handleNavigate(`${schoolBasePath}/objectives`)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isSubItemActive('objectives')
                ? 'bg-amber-50 text-amber-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            style={{ paddingLeft: '36px' }}
          >
            <Target size={14} />
            Objectives
          </button>

          <button
            onClick={() => handleNavigate(`${schoolBasePath}/users`)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isSubItemActive('users')
                ? 'bg-amber-50 text-amber-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            style={{ paddingLeft: '36px' }}
          >
            <Users size={14} />
            Users
          </button>

          <button
            onClick={() => handleNavigate(`${schoolBasePath}/appearance`)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isSubItemActive('appearance')
                ? 'bg-amber-50 text-amber-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            style={{ paddingLeft: '36px' }}
          >
            <Palette size={14} />
            Appearance
          </button>
        </div>
      )}
    </div>
  );
}
