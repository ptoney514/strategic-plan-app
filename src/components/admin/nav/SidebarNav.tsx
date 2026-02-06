import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  Users,
  Palette,
  Plus,
  Settings,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { SchoolNavItem } from './SchoolNavItem';
import { DistrictSwitcher } from '../../common/DistrictSwitcher';
import type { District, School } from '../../../lib/types';

interface SidebarNavProps {
  district: District;
  schools: School[];
  districtSlug: string;
  schoolSlug?: string;
  onAddSchool?: () => void;
  onMobileClose?: () => void;
}

/**
 * Hierarchical sidebar navigation for district admin (Editorial dark theme)
 * Shows Dashboard, Plans, Objectives & Goals under MAIN
 * Shows Users, Appearance, Settings under MANAGE
 * Shows Schools section with expandable school items
 */
export function SidebarNav({
  district: _district,
  schools,
  districtSlug,
  schoolSlug,
  onAddSchool,
  onMobileClose,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolsExpanded, setSchoolsExpanded] = useState(true);

  // With subdomain routing, admin path is just /admin (no district slug in path)
  const districtBasePath = '/admin';
  const isDistrictContext = !schoolSlug;

  const handleNavigate = (path: string) => {
    navigate(path);
    onMobileClose?.();
  };

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-white'
        : ''
    }`;

  const navItemStyle = (active: boolean) => ({
    backgroundColor: active ? 'var(--editorial-sidebar-active)' : 'transparent',
    color: active ? '#ffffff' : 'var(--editorial-sidebar-text)',
  });

  const sectionLabelStyle = {
    color: 'var(--editorial-sidebar-text-muted)',
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {/* MAIN Section */}
      <div className="mb-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest" style={sectionLabelStyle}>
        Main
      </div>

      {/* Dashboard */}
      <button
        onClick={() => handleNavigate(districtBasePath)}
        className={navItemClass(isActive(districtBasePath, true) && isDistrictContext)}
        style={navItemStyle(isActive(districtBasePath, true) && isDistrictContext)}
        onMouseEnter={(e) => {
          if (!(isActive(districtBasePath, true) && isDistrictContext)) {
            e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(isActive(districtBasePath, true) && isDistrictContext)) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Home size={18} />
        <span>Dashboard</span>
      </button>

      {/* Plans */}
      <button
        onClick={() => handleNavigate(`${districtBasePath}/plans`)}
        className={navItemClass(isActive(`${districtBasePath}/plans`))}
        style={navItemStyle(isActive(`${districtBasePath}/plans`))}
        onMouseEnter={(e) => {
          if (!isActive(`${districtBasePath}/plans`)) {
            e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive(`${districtBasePath}/plans`)) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <FileText size={18} />
        <span>Plans</span>
      </button>

      {/* Objectives & Goals */}
      <button
        onClick={() => handleNavigate(`${districtBasePath}/objectives`)}
        className={navItemClass(isActive(`${districtBasePath}/objectives`))}
        style={navItemStyle(isActive(`${districtBasePath}/objectives`))}
        onMouseEnter={(e) => {
          if (!isActive(`${districtBasePath}/objectives`)) {
            e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive(`${districtBasePath}/objectives`)) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Target size={18} />
        <span>Objectives & Goals</span>
      </button>

      {/* MANAGE Section */}
      <div className="pt-5">
        <div className="mb-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest" style={sectionLabelStyle}>
          Manage
        </div>

        {/* Users */}
        <button
          onClick={() => handleNavigate(`${districtBasePath}/users`)}
          className={navItemClass(isActive(`${districtBasePath}/users`))}
          style={navItemStyle(isActive(`${districtBasePath}/users`))}
          onMouseEnter={(e) => {
            if (!isActive(`${districtBasePath}/users`)) {
              e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(`${districtBasePath}/users`)) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Users size={18} />
          <span>Users</span>
        </button>

        {/* Appearance */}
        <button
          onClick={() => handleNavigate(`${districtBasePath}/appearance`)}
          className={navItemClass(isActive(`${districtBasePath}/appearance`))}
          style={navItemStyle(isActive(`${districtBasePath}/appearance`))}
          onMouseEnter={(e) => {
            if (!isActive(`${districtBasePath}/appearance`)) {
              e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(`${districtBasePath}/appearance`)) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Palette size={18} />
          <span>Appearance</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNavigate(`${districtBasePath}/settings`)}
          className={navItemClass(isActive(`${districtBasePath}/settings`))}
          style={navItemStyle(isActive(`${districtBasePath}/settings`))}
          onMouseEnter={(e) => {
            if (!isActive(`${districtBasePath}/settings`)) {
              e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(`${districtBasePath}/settings`)) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Schools Section */}
      {schools.length > 0 && (
        <div className="pt-5">
          <button
            onClick={() => setSchoolsExpanded(!schoolsExpanded)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors"
            style={sectionLabelStyle}
          >
            {schoolsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Schools
            <span className="ml-auto text-[11px] font-normal px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--editorial-sidebar-hover)', color: 'var(--editorial-sidebar-text-muted)' }}>
              {schools.length}
            </span>
          </button>

          {schoolsExpanded && (
            <div className="mt-1 space-y-0.5">
              {schools.map((school) => (
                <SchoolNavItem
                  key={school.id}
                  school={school}
                  districtSlug={districtSlug}
                  onMobileClose={onMobileClose}
                />
              ))}

              {/* Add School Button */}
              <button
                onClick={() => {
                  onAddSchool?.();
                  onMobileClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ paddingLeft: '24px', color: 'var(--editorial-accent-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus size={16} />
                Add School
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

interface SidebarFooterProps {
  publicUrl: string;
  onNavigate: () => void;
}

/**
 * Sidebar footer with View Public button (Editorial dark theme)
 */
export function SidebarFooter({ publicUrl: _publicUrl, onNavigate }: SidebarFooterProps) {
  return (
    <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <button
        onClick={onNavigate}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ color: 'var(--editorial-sidebar-text)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--editorial-sidebar-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Eye size={16} />
        <span>View Public Site</span>
      </button>
    </div>
  );
}

interface SidebarHeaderProps {
  district: District;
  userEmail?: string;
  userRole?: string;
}

/**
 * Sidebar header with district switcher (Editorial dark theme)
 */
export function SidebarHeader({ district, userEmail: _userEmail, userRole: _userRole }: SidebarHeaderProps) {
  return <DistrictSwitcher currentDistrict={district} variant="dark" />;
}

interface SidebarUserFooterProps {
  userName: string;
  userRole: string;
}

/**
 * User info footer for sidebar (Editorial dark theme)
 */
export function SidebarUserFooter({ userName, userRole }: SidebarUserFooterProps) {
  return (
    <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm"
          style={{ backgroundColor: 'var(--editorial-accent-primary)', color: '#ffffff' }}
        >
          {userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: 'var(--editorial-sidebar-text)' }}>{userName}</div>
          <div className="text-xs" style={{ color: 'var(--editorial-sidebar-text-muted)' }}>{userRole}</div>
        </div>
      </div>
    </div>
  );
}
