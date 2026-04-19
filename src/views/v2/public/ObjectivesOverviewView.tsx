'use client'
import { useRouter } from 'next/navigation';
import { useSubdomain, useDistrictLink } from '@/contexts/SubdomainContext';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { Breadcrumb } from '@/components/v2/public/Breadcrumb';
import { NumberedObjectiveCard } from '@/components/v2/public/NumberedObjectiveCard';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { computeStatusCounts } from '@/lib/utils/goalHealth';
import type { HierarchicalGoal } from '@/lib/types';

const ACCENT_COLORS = ['#702ae1', '#00675d', '#005950', '#D97706'];

function statusDotsForGoals(children: HierarchicalGoal[]): { color: string }[] {
  return children.map((c) => {
    const s = c.status?.toLowerCase().replace(/\s+/g, '_');
    if (s === 'on_target' || s === 'on_track' || s === 'exceeding' || s === 'completed' || s === 'complete') return { color: 'bg-emerald-500' };
    if (s === 'at_risk' || s === 'in_progress') return { color: 'bg-amber-500' };
    if (s === 'critical' || s === 'off_track') return { color: 'bg-red-500' };
    return { color: 'bg-slate-200' };
  });
}

export function ObjectivesOverviewView() {
  const router = useRouter();
  const { slug } = useSubdomain();
  const link = useDistrictLink();
  const homeHref = link('/');
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals, isLoading: goalsLoading } = useGoalsByPlan(activePlan?.id || '');

  const isLoading = plansLoading || goalsLoading;
  const objectives = (goals?.filter((g) => g.level === 0) || []) as HierarchicalGoal[];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      {/* Header */}
      <header className="mx-auto mb-10 max-w-7xl sm:mb-12">
        <Breadcrumb
          items={[
            { label: 'Plan', href: homeHref },
            { label: 'All Objectives' },
          ]}
        />
        <div className="mt-5 flex flex-col gap-5 sm:mt-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-md3-on-surface sm:text-4xl lg:text-5xl">
              Strategic Objectives
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 sm:text-[12px]">
                {objectives.length} Objectives
              </span>
              <span className="text-md3-outline text-sm">
                Updated {new Date(activePlan?.updated_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
          >
            <MaterialIcon icon="filter_list" size={20} />
            Filters coming soon
            <MaterialIcon icon="expand_more" size={14} />
          </button>
        </div>
      </header>

      {/* Objectives Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
        {objectives.map((obj, idx) => {
          const children = (obj.children || []) as HierarchicalGoal[];
          const childCounts = computeStatusCounts(children);
          const num = String(idx + 1).padStart(2, '0');

          return (
            <NumberedObjectiveCard
              key={obj.id}
              testId={`objectives-overview-card-${idx + 1}`}
              number={num}
              title={obj.title}
              description={obj.description}
              accentColor={ACCENT_COLORS[idx % ACCENT_COLORS.length]}
              statusDots={statusDotsForGoals(children)}
              onTargetCount={childCounts.onTarget}
              offTrackCount={childCounts.critical + childCounts.atRisk}
              goalCount={children.length}
              onClick={() => router.push(link(`/objectives/${obj.id}`))}
            />
          );
        })}
      </div>

      {/* Footer stats */}
      <footer className="mx-auto mt-12 flex max-w-7xl flex-col gap-8 border-t border-slate-100 pt-8 sm:mt-16 sm:pt-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Health Score
            </p>
            <p className="text-4xl font-bold tabular-nums text-md3-on-surface">
              --<span className="text-xl text-slate-400 font-medium">/100</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Active Milestones
            </p>
            <p className="text-4xl font-bold tabular-nums text-md3-on-surface">
              {objectives.flatMap((o) => o.children || []).length}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
        >
          <MaterialIcon icon="download" size={18} />
          Strategic report coming soon
        </button>
      </footer>
    </div>
  );
}
