import { useState } from 'react';
import { Plus, Shield, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  useDistrictsWithStats,
  useSystemAdminStats,
  useRecentUsers,
} from '../../hooks/useSystemAdminStats';
import { useCreateDistrict } from '../../hooks/useDistricts';
import { StatsCardsGrid, DistrictSection, RecentUsersTable } from '../../components/admin/dashboard';
import { DistrictFormModal } from '../../components/admin/DistrictFormModal';
import type { District } from '../../lib/types';

/**
 * SystemDashboard - Main system administrator dashboard
 * Displays all districts, stats, and recent users
 */
export function SystemDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Data fetching
  const { data: stats, isLoading: statsLoading } = useSystemAdminStats();
  const { data: districts = [], isLoading: districtsLoading, error } = useDistrictsWithStats();
  const { data: recentUsers = [], isLoading: usersLoading } = useRecentUsers(5);

  // Mutations
  const createDistrict = useCreateDistrict();

  // Loading state
  if (districtsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading districts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-10 py-8 max-w-[1400px] mx-auto">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">Failed to load districts</p>
          <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a227] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight">
                System Administration
              </h1>
              <p className="text-sm text-[#8a8a8a]">Manage all districts and system-wide settings</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#b85c38] hover:bg-[#a04d2d] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New District
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCardsGrid
        totalDistricts={stats?.totalDistricts ?? districts.length}
        totalGoals={stats?.totalGoals ?? 0}
        totalUsers={stats?.totalUsers ?? 0}
        totalSchools={stats?.totalSchools ?? 0}
        isLoading={statsLoading}
      />

      {/* Districts Section */}
      <DistrictSection districts={districts} />

      {/* Recent Users Section */}
      <div className="mt-8">
        <RecentUsersTable users={recentUsers} isLoading={usersLoading} />
      </div>

      {/* Create District Modal */}
      {showCreateForm && (
        <DistrictFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={async (data) => {
            await createDistrict.mutateAsync(data as Partial<District>);
            setShowCreateForm(false);
          }}
          isLoading={createDistrict.isPending}
        />
      )}
    </div>
  );
}
