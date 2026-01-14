import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../../../hooks/useAdminContext';
import { useSchoolGoals } from '../../../../hooks/useGoals';
import {
  SiteStatusBanner,
  QuickActionsGrid,
  ObjectivesList,
  UsersList,
} from '../../../../components/admin/dashboard';

/**
 * SchoolDashboard - Dashboard for school administrators
 * Shows school-specific objectives, status, and quick actions
 */
export function SchoolDashboard() {
  const navigate = useNavigate();
  const {
    school,
    districtSlug: _districtSlug,
    schoolSlug,
    basePath,
    publicUrl,
    isLoading: contextLoading,
  } = useAdminContext();

  // Fetch school goals
  const { data: goalsData = [], isLoading: goalsLoading } = useSchoolGoals(school?.id || '');

  // Extract objectives (level 0 goals)
  const objectives = goalsData.filter((g) => g.level === 0);
  const draftObjectives = objectives.filter((g) => !g.is_public);

  // School URL
  const siteUrl = `${schoolSlug || ''}.strategicplanner.app`;

  // Mock users - will be replaced with actual user management
  const mockUsers = [
    {
      id: '1',
      email: school?.principal_email || 'admin@school.com',
      role: 'school_admin' as const,
      name: school?.principal_name,
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
        districtName={school?.name || 'Loading...'}
        publicUrl={siteUrl}
        objectivesCount={objectives.length}
        draftsCount={draftObjectives.length}
        usersCount={mockUsers.length}
        isPublic={school?.is_public || false}
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
