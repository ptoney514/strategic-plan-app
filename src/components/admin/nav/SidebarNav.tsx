import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Landmark,
  Target,
  Users,
  Palette,
  Plus,
  Settings,
  Eye,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { NavSection } from './NavSection';
import { SchoolNavItem } from './SchoolNavItem';
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
 * Hierarchical sidebar navigation for district admin
 * Shows District section, Schools section with expandable school items
 */
export function SidebarNav({
  district,
  schools,
  districtSlug,
  schoolSlug,
  onAddSchool,
  onMobileClose,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [districtExpanded, setDistrictExpanded] = useState(true);
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

  const isDistrictSectionActive = (section: string) => {
    if (section === 'overview') {
      return location.pathname === districtBasePath && isDistrictContext;
    }
    return location.pathname === `${districtBasePath}/${section}` && isDistrictContext;
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {/* Dashboard */}
      <button
        onClick={() => handleNavigate(districtBasePath)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive(districtBasePath, true) && isDistrictContext
            ? 'bg-amber-50 text-amber-700'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Home size={16} />
        <span>Dashboard</span>
      </button>

      {/* District Section */}
      <div className="pt-4">
        <button
          onClick={() => setDistrictExpanded(!districtExpanded)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          {districtExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          District
        </button>

        {districtExpanded && (
          <div className="mt-1 space-y-0.5">
            {/* District Overview */}
            <button
              onClick={() => handleNavigate(districtBasePath)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDistrictSectionActive('overview')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Landmark size={16} />
              <span className="flex-1 text-left truncate">{district.name}</span>
            </button>

            {/* District Sub-items */}
            <button
              onClick={() => handleNavigate(`${districtBasePath}/objectives`)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isDistrictSectionActive('objectives')
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={{ paddingLeft: '24px' }}
            >
              <Target size={16} />
              Objectives
            </button>

            <button
              onClick={() => handleNavigate(`${districtBasePath}/users`)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isDistrictSectionActive('users')
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={{ paddingLeft: '24px' }}
            >
              <Users size={16} />
              Users
            </button>

            <button
              onClick={() => handleNavigate(`${districtBasePath}/appearance`)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isDistrictSectionActive('appearance') || isDistrictSectionActive('settings')
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={{ paddingLeft: '24px' }}
            >
              <Palette size={16} />
              Appearance
            </button>
          </div>
        )}
      </div>

      {/* Schools Section */}
      <div className="pt-4">
        <button
          onClick={() => setSchoolsExpanded(!schoolsExpanded)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          {schoolsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Schools
          <span className="ml-auto text-xs font-normal bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
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
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              style={{ paddingLeft: '24px' }}
            >
              <Plus size={16} />
              Add School
            </button>
          </div>
        )}
      </div>

      {/* Settings - Bottom */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={() => handleNavigate(`${districtBasePath}/settings`)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive(`${districtBasePath}/settings`)
              ? 'bg-amber-50 text-amber-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </nav>
  );
}

interface SidebarFooterProps {
  publicUrl: string;
  onNavigate: () => void;
}

/**
 * Sidebar footer with View Public button
 */
export function SidebarFooter({ publicUrl, onNavigate }: SidebarFooterProps) {
  return (
    <div className="p-3 border-t border-slate-200">
      <button
        onClick={onNavigate}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
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
 * Sidebar header with district logo and name
 */
export function SidebarHeader({ district, userEmail, userRole }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        {district.logo_url ? (
          <img
            src={district.logo_url}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: district.primary_color || '#D97706' }}
          >
            {district.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 text-sm truncate">{district.name}</div>
          <div className="text-xs text-slate-500">Strategic Planning</div>
        </div>
      </div>
    </div>
  );
}

interface SidebarUserFooterProps {
  userName: string;
  userRole: string;
}

/**
 * User info footer for sidebar
 */
export function SidebarUserFooter({ userName, userRole }: SidebarUserFooterProps) {
  return (
    <div className="p-3 border-t border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-medium text-sm">
          {userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">{userName}</div>
          <div className="text-xs text-slate-500">{userRole}</div>
        </div>
      </div>
    </div>
  );
}
