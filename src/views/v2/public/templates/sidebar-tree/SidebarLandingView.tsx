'use client'
import { useRouter } from 'next/navigation';
import { useSubdomain, useDistrictLink } from '@/contexts/SubdomainContext';
import { useDistrict } from '@/hooks/useDistricts';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { KpiStatCard } from '@/components/v2/public/KpiStatCard';
import { PlanHealthBar } from '@/components/v2/public/PlanHealthBar';
import { LandingObjectiveCard } from '@/components/v2/public/LandingObjectiveCard';
import { computeStatusCounts, computeHealthSegments } from '@/lib/utils/goalHealth';
import type { HierarchicalGoal } from '@/lib/types';

const OBJECTIVE_ICONS = ['menu_book', 'volunteer_activism', 'model_training', 'diversity_3'];
const OBJECTIVE_ICON_CLASSES = [
  'bg-md3-primary/10 text-md3-primary',
  'bg-amber-500/10 text-amber-600',
  'bg-teal-500/10 text-teal-600',
  'bg-orange-500/10 text-orange-600',
];

function statusDotsForGoals(children: HierarchicalGoal[]): { color: string }[] {
  return children.map((c) => {
    const s = c.status?.toLowerCase().replace(/\s+/g, '_');
    if (s === 'on_target' || s === 'on_track' || s === 'exceeding' || s === 'completed' || s === 'complete') return { color: 'bg-emerald-500' };
    if (s === 'at_risk' || s === 'in_progress') return { color: 'bg-amber-500' };
    if (s === 'critical' || s === 'off_track') return { color: 'bg-red-500' };
    return { color: 'border border-slate-300' };
  });
}

function statusBadgeForObjective(children: HierarchicalGoal[]): { label: string; classes: string } {
  const counts = computeStatusCounts(children);
  if (counts.critical > 0) return { label: 'Critical', classes: 'bg-red-50 text-red-700' };
  if (counts.atRisk > counts.onTarget) return { label: 'At Risk', classes: 'bg-amber-50 text-amber-700' };
  return { label: 'On Track', classes: 'bg-emerald-50 text-emerald-700' };
}

export function SidebarLandingView() {
  const router = useRouter();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const link = useDistrictLink();
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals, isLoading: goalsLoading } = useGoalsByPlan(activePlan?.id || '');

  const isLoading = plansLoading || goalsLoading;
  const objectives = (goals?.filter((g) => g.level === 0) || []) as HierarchicalGoal[];
  const allLevel1Goals = objectives.flatMap((o) => o.children || []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium text-md3-on-surface-variant">No public plan available</p>
      </div>
    );
  }

  const counts = computeStatusCounts(allLevel1Goals);
  const segments = computeHealthSegments(allLevel1Goals);
  const dateRange = activePlan.start_date && activePlan.end_date
    ? `${new Date(activePlan.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()} — ${new Date(activePlan.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`
    : '';
  const lastUpdated = new Date(activePlan.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="overflow-x-clip">
      {/* Hero Section */}
      <section id="district-identity" className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
              {dateRange && (
                <div className="inline-flex items-center rounded-full bg-md3-primary-fixed/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-md3-primary">
                  {dateRange}
                </div>
              )}
              <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200/80 lg:hidden">
                Updated {lastUpdated}
              </div>
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-md3-on-surface sm:mb-6 sm:text-5xl lg:text-6xl">
              {district?.name} Strategic Plan
            </h1>
            {activePlan.description && (
              <p className="mb-6 max-w-[34rem] text-base font-light leading-relaxed text-md3-on-surface-variant sm:mb-8 sm:text-lg lg:text-xl">
                {activePlan.description}
              </p>
            )}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-80 sm:px-6"
            >
              <MaterialIcon icon="download" size={18} />
              Vision PDF coming soon
            </button>
          </div>
          <div className="hidden text-right lg:block">
            <p className="text-[12px] text-md3-on-surface-variant uppercase tracking-widest font-medium mb-1">
              Last Updated
            </p>
            <p className="text-lg font-medium text-md3-on-surface">
              {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          <KpiStatCard label="Total Objectives" value={objectives.length} />
          <KpiStatCard label="Total Goals" value={allLevel1Goals.length} />
          <KpiStatCard label="On Target" value={counts.onTarget} statusDot="bg-emerald-500" valueColor="text-emerald-600" />
          <KpiStatCard label="Needs Attention" value={counts.atRisk + counts.critical} statusDot="bg-amber-500" valueColor="text-amber-600" />
        </div>
      </section>

      {/* Plan Health */}
      {segments.length > 0 && (
        <section id="plan-health" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
          <PlanHealthBar segments={segments} />
        </section>
      )}

      {/* Objective Cards */}
      <section id="objectives-overview" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <h3 className="mb-6 px-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-md3-primary sm:mb-8 sm:text-[12px]">
          Core Strategic Objectives
        </h3>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
          {objectives.map((obj, idx) => {
            const children = (obj.children || []) as HierarchicalGoal[];
            const childCounts = computeStatusCounts(children);
            return (
              <LandingObjectiveCard
                key={obj.id}
                testId={`objective-card-${idx + 1}`}
                title={obj.title}
                description={obj.description}
                icon={OBJECTIVE_ICONS[idx % OBJECTIVE_ICONS.length]}
                iconBgClass={OBJECTIVE_ICON_CLASSES[idx % OBJECTIVE_ICON_CLASSES.length]}
                statusBadge={statusBadgeForObjective(children)}
                statusDots={statusDotsForGoals(children)}
                goalCount={children.length}
                onTargetCount={childCounts.onTarget}
                offTrackCount={childCounts.critical + childCounts.atRisk}
                onClick={() => router.push(link(`/objectives/${obj.id}`))}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default SidebarLandingView;
