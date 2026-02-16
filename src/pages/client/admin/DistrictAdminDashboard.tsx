import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useOrgMembers } from '../../../hooks/useMembers';
import { usePlans } from '../../../hooks/usePlans';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import { KPICardsGrid } from '../../../components/admin/dashboard/KPICardsGrid';
import { GoalProgressChart } from '../../../components/admin/dashboard/GoalProgressChart';
import { DistrictHealthCard } from '../../../components/admin/dashboard/DistrictHealthCard';
import { QuickActionsPanel } from '../../../components/admin/dashboard/QuickActionsPanel';
import { ActivityFeed } from '../../../components/admin/dashboard/ActivityFeed';

export function DistrictAdminDashboard() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const districtId = district?.id || '';

  const { data: goals = [], isLoading: goalsLoading } = useGoals(districtId);
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(slug || '');
  const { data: plans = [], isLoading: plansLoading } = usePlans(districtId);
  const { data: metrics = [], isLoading: metricsLoading } = useMetricsByDistrict(districtId);

  const isLoading = goalsLoading || membersLoading || plansLoading || metricsLoading;

  // Flatten nested goals for total count
  function countAllGoals(goalList: typeof goals): number {
    let count = 0;
    for (const g of goalList) {
      count += 1;
      if (g.children) count += countAllGoals(g.children);
    }
    return count;
  }

  const totalGoals = countAllGoals(goals);
  const activePlans = plans.filter((p) => p.is_active);
  const planStatus = activePlans.length > 0 ? `${activePlans.length} Active` : 'None';

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1100px]">
        <div className="mb-8">
          <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--editorial-surface-alt)' }} />
          <div className="h-4 w-32 mt-2 rounded animate-pulse" style={{ backgroundColor: 'var(--editorial-surface-alt)' }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--editorial-surface-alt)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--editorial-surface-alt)' }} />
          <div className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--editorial-surface-alt)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1
            className="text-2xl sm:text-[28px] font-medium tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            {greeting} — here is your district overview.
          </p>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--editorial-text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardsGrid
        goalsCount={totalGoals}
        metricsCount={metrics.length}
        planStatus={planStatus}
        teamCount={Array.isArray(members) ? members.length : 0}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <GoalProgressChart goals={goals} />
          <DistrictHealthCard goals={goals} plans={plans} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActionsPanel slug={slug || ''} />
          <ActivityFeed goals={goals} metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
