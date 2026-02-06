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
 * School navigation item with expandable sub-navigation (Editorial dark theme)
 * Shows: Overview, Objectives, Users, Appearance
 */
export function SchoolNavItem({ school, districtSlug: _districtSlug, onMobileClose }: SchoolNavItemProps) {
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
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          paddingLeft: '24px',
          backgroundColor: isActive && isSubItemActive('overview') ? 'var(--editorial-sidebar-active)' : 'transparent',
          color: isActive && isSubItemActive('overview') ? '#ffffff' : 'var(--editorial-sidebar-text)',
        }}
        onMouseEnter={(e) => {
          if (!(isActive && isSubItemActive('overview'))) {
            e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(isActive && isSubItemActive('overview'))) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Building2 size={16} />
        <span className="flex-1 text-left truncate">{school.name}</span>
        {!school.is_public && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--editorial-accent-secondary)' }} title="Draft" />
        )}
      </button>

      {/* Sub-navigation */}
      {isExpanded && (
        <div className="ml-4 space-y-0.5 mt-0.5">
          {[
            { section: 'objectives', icon: Target, label: 'Objectives' },
            { section: 'users', icon: Users, label: 'Users' },
            { section: 'appearance', icon: Palette, label: 'Appearance' },
          ].map(({ section, icon: Icon, label }) => (
            <button
              key={section}
              onClick={() => handleNavigate(`${schoolBasePath}/${section}`)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                paddingLeft: '36px',
                backgroundColor: isSubItemActive(section) ? 'var(--editorial-sidebar-active)' : 'transparent',
                color: isSubItemActive(section) ? '#ffffff' : 'var(--editorial-sidebar-text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isSubItemActive(section)) {
                  e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
                  e.currentTarget.style.color = 'var(--editorial-sidebar-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubItemActive(section)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--editorial-sidebar-text-muted)';
                }
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
