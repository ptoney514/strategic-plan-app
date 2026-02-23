import { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, FileText, Target, TrendingUp, ArrowRight, Plus, ChevronRight, Settings, ExternalLink, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDashboardStats, useUserDistrictsWithStats } from '../../hooks/useUserDistricts';
import { useUserPlansWithCounts } from '../../hooks/useUserPlans';
import { usePlanGoals } from '../../hooks/useGoals';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';
import type { HierarchicalGoal, PlanWithSummary } from '../../lib/types';
import type { UserDistrictWithStats } from '../../lib/services/userDashboard.service';

export function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Detect if we're in district admin context
  const isDistrictAdmin = location.pathname.startsWith('/admin');
  const basePath = isDistrictAdmin ? '/admin' : '/dashboard';

  // Fetch stats, districts with stats, and plans
  const { data: stats, isLoading: statsLoading } = useUserDashboardStats();
  const { data: districtsWithStats = [], isLoading: districtsLoading } = useUserDistrictsWithStats();
  const { data: plans = [], isLoading: plansLoading } = useUserPlansWithCounts();

  // Build district lookup for plan section navigation
  const districtMap = useMemo(() => {
    const map = new Map<string, UserDistrictWithStats>();
    for (const d of districtsWithStats) {
      map.set(d.id, d);
    }
    return map;
  }, [districtsWithStats]);

  // Navigate to district admin page (cross-domain on root, in-app on district admin)
  const navigateToDistrictAdmin = (path: string, districtId?: string | null) => {
    if (isDistrictAdmin) {
      navigate(path);
      return;
    }
    // Root domain: redirect to district subdomain
    const district = districtId ? districtMap.get(districtId) : districtsWithStats[0];
    if (district) {
      window.location.href = buildSubdomainUrlWithPath('district', path, district.slug);
    }
  };

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const {
    data: selectedPlanObjectives = [],
    isLoading: selectedObjectivesLoading,
  } = usePlanGoals(selectedPlanId || '', { includeMetrics: false });

  // Get user display name
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Current date
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1
            className="text-2xl sm:text-[28px] font-medium tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            {greeting}, {firstName}
          </p>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--editorial-text-muted)' }}>
          {dateStr}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Districts"
          value={statsLoading ? '...' : String(stats?.district_count || 0)}
          icon={<Building2 size={20} />}
          hidden={isDistrictAdmin}
        />
        <StatCard
          label="Plans"
          value={statsLoading ? '...' : String(stats?.plan_count || 0)}
          icon={<FileText size={20} />}
        />
        <StatCard
          label="Objectives"
          value={statsLoading ? '...' : String(stats?.objective_count || 0)}
          icon={<Target size={20} />}
        />
        <StatCard
          label="Metrics"
          value={statsLoading ? '...' : String(stats?.metric_count || 0)}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Districts Section */}
      {!isDistrictAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-medium"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
            >
              Your Districts
            </h2>
            {districtsWithStats.length > 2 && (
              <Link
                to={`${basePath}/districts`}
                className="text-sm font-medium flex items-center gap-1 transition-colors"
                style={{ color: 'var(--editorial-accent-link)' }}
              >
                View all districts
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {districtsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl h-48"
                  style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
                />
              ))}
            </div>
          ) : districtsWithStats.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
              >
                <Building2 className="h-6 w-6" style={{ color: 'var(--editorial-text-muted)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
                No districts yet
              </h3>
              <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                You don't have access to any districts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {districtsWithStats.map((district) => (
                <DistrictCard key={district.id} district={district} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-medium"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Strategic Plans
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/plans`}
              className="text-sm font-medium flex items-center gap-1 transition-colors"
              style={{ color: 'var(--editorial-accent-link)' }}
            >
              View all plans
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => navigateToDistrictAdmin('/admin/plans/create')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg transition-colors font-medium text-sm"
              style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
            >
              <Plus size={14} />
              New Plan
            </button>
          </div>
        </div>

        {plansLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse rounded-xl p-5 h-20" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }} />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <FileText className="h-6 w-6" style={{ color: 'var(--editorial-text-muted)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--editorial-text-primary)' }}>
              No plans yet
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--editorial-text-muted)' }}>
              Create your first strategic plan to organize your objectives.
            </p>
            <button
              onClick={() => navigateToDistrictAdmin('/admin/plans/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-semibold text-sm"
              style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
            >
              <Plus size={16} />
              Create Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const district = districtMap.get(plan.district_id || '');
              return (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  districtName={district?.name}
                  districtColor={district?.primary_color}
                  isSelected={selectedPlanId === plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  onNavigateDetail={() => navigateToDistrictAdmin(`/admin/plans/${plan.id}`, plan.district_id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Overview (Tree View for first/selected plan) */}
      {plans.length > 0 && (
        <div>
          <h2
            className="text-lg font-medium mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            {selectedPlan ? `Plan Overview: ${selectedPlan.name}` : 'Plan Overview'}
          </h2>

          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
          >
            {!selectedPlan ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                  Select a plan above to preview its objectives.
                </p>
              </div>
            ) : selectedObjectivesLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-11 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
                  />
                ))}
              </div>
            ) : selectedPlanObjectives.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--editorial-border-light)' }}>
                {selectedPlanObjectives.map((objective) => (
                  <ObjectiveRow
                    key={objective.id}
                    objective={objective}
                    basePath={basePath}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
                  No objectives in this plan yet.
                </p>
                <Link
                  to={`${basePath}/objectives/create`}
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium"
                  style={{ color: 'var(--editorial-accent-primary)' }}
                >
                  <Plus size={14} />
                  Add Objective
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, hidden }: { label: string; value: string; icon: React.ReactNode; hidden?: boolean }) {
  if (hidden) return null;

  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-accent-primary)' }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
          {value}
        </div>
        <div className="text-xs font-medium" style={{ color: 'var(--editorial-text-muted)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function DistrictCard({ district }: { district: UserDistrictWithStats }) {
  const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);
  const publicUrl = buildSubdomainUrlWithPath('district', '/', district.slug);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      {/* Color accent strip */}
      <div className="h-1.5" style={{ backgroundColor: district.primary_color || '#6B8F71' }} />

      <div className="p-5">
        {/* District info */}
        <div className="flex items-start gap-4 mb-4">
          {district.logo_url ? (
            <img
              src={district.logo_url}
              alt=""
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: district.primary_color || '#D97706' }}
            >
              {district.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--editorial-text-primary)' }}>
              {district.name}
            </h3>
            {district.tagline && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--editorial-text-muted)' }}>
                {district.tagline}
              </p>
            )}
            <span
              className="inline-flex items-center mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={
                district.is_public
                  ? { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                  : { backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }
              }
            >
              {district.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MiniStat icon={<FileText size={14} />} label="Plans" value={district.plan_count} />
          <MiniStat icon={<Target size={14} />} label="Objectives" value={district.objective_count} />
          <MiniStat icon={<Users size={14} />} label="Users" value={district.user_count} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={adminUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg transition-colors font-medium text-sm"
            style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
          >
            <Settings size={14} />
            Open Admin
          </a>
          <a
            href={publicUrl}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
            style={{
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text-secondary)',
              backgroundColor: 'var(--editorial-surface)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface)'; }}
          >
            <ExternalLink size={14} />
            View Public
          </a>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
    >
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
        {icon}
      </div>
      <div className="text-lg font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--editorial-text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

function PlanRow({ plan, districtName, districtColor, isSelected, onClick, onNavigateDetail }: {
  plan: PlanWithSummary;
  districtName?: string;
  districtColor?: string;
  isSelected: boolean;
  onClick: () => void;
  onNavigateDetail: () => void;
}) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all"
      style={{
        backgroundColor: isSelected ? 'var(--editorial-surface-alt)' : 'var(--editorial-surface)',
        border: `1px solid ${isSelected ? 'var(--editorial-accent-primary)' : 'var(--editorial-border)'}`,
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }}
        >
          <FileText size={20} />
        </div>
        <div>
          <div className="font-medium text-sm" style={{ color: 'var(--editorial-text-primary)' }}>
            {plan.name}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {districtName && (
              <span
                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: districtColor ? `${districtColor}20` : 'var(--editorial-surface-alt)',
                  color: districtColor || 'var(--editorial-text-secondary)',
                }}
              >
                {districtName}
              </span>
            )}
            {plan.type_label && (
              <span className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>
                {plan.type_label}
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>
              {plan.objectiveCount || 0} objectives
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={plan.is_public
                ? { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                : { backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }
              }
            >
              {plan.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigateDetail();
        }}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--editorial-text-muted)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ObjectiveRow({ objective, basePath }: { objective: HierarchicalGoal; basePath: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = objective.children && objective.children.length > 0;

  return (
    <div>
      <div
        className="px-5 py-3.5 flex items-center gap-3 cursor-pointer transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <button
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs"
          style={{
            border: '1px solid var(--editorial-border)',
            color: hasChildren ? 'var(--editorial-text-secondary)' : 'var(--editorial-border)',
          }}
        >
          {expanded ? '−' : hasChildren ? '+' : '›'}
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--editorial-text-secondary)' }}>
            {objective.goal_number || '1.0'}
          </span>
        </div>

        <Link
          to={`${basePath}/objectives/${objective.id}`}
          className="flex-1 text-sm font-medium transition-colors"
          style={{ color: 'var(--editorial-text-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {objective.title}
        </Link>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0" style={{ border: '1px solid var(--editorial-border)' }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: objective.indicator_color || 'var(--editorial-accent-success)' }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--editorial-text-secondary)' }}>
            {objective.indicator_text || 'On Target'}
          </span>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div style={{ borderTop: '1px solid var(--editorial-border-light)' }}>
          {objective.children?.map((child) => (
            <div
              key={child.id}
              className="px-5 py-2.5 flex items-center gap-3"
              style={{ paddingLeft: '3.5rem', backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <span className="text-xs" style={{ color: 'var(--editorial-border)' }}>├─</span>
              <Link
                to={`${basePath}/objectives/${child.id}`}
                className="flex-1 text-sm transition-colors"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                {child.goal_number} {child.title}
              </Link>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: child.indicator_color || 'var(--editorial-accent-success)' }}
                />
                <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--editorial-text-muted)' }}>
                  {child.indicator_text || 'On Target'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
