'use client'
import { useRouter } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
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
    if (s === 'on_target' || s === 'exceeding' || s === 'completed') return { color: 'bg-emerald-500' };
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

export function PlanLandingView() {
  const router = useRouter();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const basePath = `/district/${slug}`;
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

  return (
    <div>
      {/* Hero Section */}
      <section className="px-8 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            {dateRange && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-md3-primary-fixed/20 text-md3-primary text-[10px] font-bold tracking-widest uppercase mb-6">
                {dateRange}
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-extrabold text-md3-on-surface tracking-tight leading-tight mb-6">
              {district?.name} Strategic Plan
            </h1>
            {activePlan.description && (
              <p className="text-xl text-md3-on-surface-variant font-light leading-relaxed mb-8">
                {activePlan.description}
              </p>
            )}
            <button className="bg-md3-primary hover:opacity-90 text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
              <MaterialIcon icon="download" size={18} />
              Download Vision PDF
            </button>
          </div>
          <div className="text-right hidden lg:block">
            <p className="text-[12px] text-md3-on-surface-variant uppercase tracking-widest font-medium mb-1">
              Last Updated
            </p>
            <p className="text-lg font-medium text-md3-on-surface">
              {new Date(activePlan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="px-8 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KpiStatCard label="Total Objectives" value={objectives.length} />
          <KpiStatCard label="Total Goals" value={allLevel1Goals.length} />
          <KpiStatCard label="On Target" value={counts.onTarget} statusDot="bg-emerald-500" valueColor="text-emerald-600" />
          <KpiStatCard label="Needs Attention" value={counts.atRisk + counts.critical} statusDot="bg-amber-500" valueColor="text-amber-600" />
        </div>
      </section>

      {/* Plan Health */}
      {segments.length > 0 && (
        <section className="px-8 pb-16 max-w-7xl mx-auto">
          <PlanHealthBar segments={segments} />
        </section>
      )}

      {/* Objective Cards */}
      <section className="px-8 pb-20 max-w-7xl mx-auto">
        <h3 className="text-[12px] uppercase font-extrabold tracking-[0.2em] text-md3-primary mb-8 px-1">
          Core Strategic Objectives
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {objectives.map((obj, idx) => {
            const children = (obj.children || []) as HierarchicalGoal[];
            const childCounts = computeStatusCounts(children);
            return (
              <LandingObjectiveCard
                key={obj.id}
                title={obj.title}
                description={obj.description}
                icon={OBJECTIVE_ICONS[idx % OBJECTIVE_ICONS.length]}
                iconBgClass={OBJECTIVE_ICON_CLASSES[idx % OBJECTIVE_ICON_CLASSES.length]}
                statusBadge={statusBadgeForObjective(children)}
                statusDots={statusDotsForGoals(children)}
                goalCount={children.length}
                onTargetCount={childCounts.onTarget}
                offTrackCount={childCounts.critical + childCounts.atRisk}
                onClick={() => router.push(`${basePath}/objectives/${obj.id}`)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
