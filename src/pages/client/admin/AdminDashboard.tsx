import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../../hooks/useAdminContext';
import { useGoals, useSchoolGoals } from '../../../hooks/useGoals';
import {
  SiteStatusBanner,
  QuickActionsGrid,
  ObjectivesList,
  UsersList,
} from '../../../components/admin/dashboard';

/**
 * AdminDashboard - Redesigned dashboard for district/school admins
 * Features: Site status banner, quick actions, objectives list, team preview
 *
 * Works for both district and school contexts:
 * - District admin: Shows district objectives and all district users
 * - School admin: Shows school objectives and school users
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const {
    type,
    district,
    school,
    districtSlug: _districtSlug,
    schoolSlug: _schoolSlug,
    basePath,
    publicUrl,
    isLoading: contextLoading,
  } = useAdminContext();

  // Fetch goals based on context
  const districtGoals = useGoals(type === 'district' ? district?.id || '' : '');
  const schoolGoals = useSchoolGoals(type === 'school' ? school?.id || '' : '');

  const goals = type === 'school' ? schoolGoals : districtGoals;
  const goalsData = goals.data || [];
  const goalsLoading = goals.isLoading;

  // Extract objectives (level 0 goals)
  const objectives = goalsData.filter((g) => g.level === 0);
  const draftObjectives = objectives.filter((g) => !g.is_public);

  // Context-specific data
  const contextName = type === 'school' ? school?.name : district?.name;
  const contextPublic = type === 'school' ? school?.is_public : district?.is_public;
  const siteUrl = type === 'school'
    ? `${school?.slug || ''}.strategicplanner.app`
    : `${district?.slug || ''}.strategicplanner.app`;

  // Mock users for now - will be replaced with actual user management
  const mockUsers = [
    {
      id: '1',
      email: district?.admin_email || 'admin@example.com',
      role: 'district_admin' as const,
    },
  ];

  const handleAddObjective = () => {
    navigate(`${basePath}/objectives/new`);
  };

  const handleInviteUser = () => {
    navigate(`${basePath}/users`);
  };

  const handleCustomize = () => {
    navigate(`${basePath}/appearance`);
  };

  const handlePreviewSite = () => {
    window.open(publicUrl, '_blank');
  };

  const handleViewSite = () => {
    window.open(publicUrl, '_blank');
  };

  if (contextLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Site Status Banner */}
      <SiteStatusBanner
        districtName={contextName || 'Loading...'}
        publicUrl={siteUrl}
        objectivesCount={objectives.length}
        draftsCount={draftObjectives.length}
        usersCount={mockUsers.length}
        isPublic={contextPublic || false}
        onViewSite={handleViewSite}
      />

      {/* Quick Actions Grid */}
      <QuickActionsGrid
        onAddObjective={handleAddObjective}
        onInviteUser={handleInviteUser}
        onCustomize={handleCustomize}
        onPreviewSite={handlePreviewSite}
      />

      {/* Two-Column Layout: Objectives and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectives List - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <ObjectivesList
            objectives={objectives}
            basePath={basePath}
            isLoading={goalsLoading}
          />
        </div>

        {/* Users List - 1/3 width on desktop */}
        <div>
          <UsersList
            users={mockUsers}
            basePath={basePath}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
