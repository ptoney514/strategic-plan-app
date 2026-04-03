'use client'
import { useRouter } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
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
    if (s === 'on_target' || s === 'exceeding' || s === 'completed') return { color: 'bg-emerald-500' };
    if (s === 'at_risk' || s === 'in_progress') return { color: 'bg-amber-500' };
    if (s === 'critical' || s === 'off_track') return { color: 'bg-red-500' };
    return { color: 'bg-slate-200' };
  });
}

export function ObjectivesOverviewView() {
  const router = useRouter();
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
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
    <div className="p-8 lg:p-12">
      {/* Header */}
      <header className="mb-12 max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Plan', href: basePath },
            { label: 'All Objectives' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-md3-on-surface mb-2">
              Strategic Objectives
            </h2>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">
                {objectives.length} Objectives
              </span>
              <span className="text-md3-outline text-sm">
                Updated {new Date(activePlan?.updated_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white ghost-border rounded-lg text-sm font-semibold text-md3-on-surface hover:bg-slate-50 transition-all">
            <MaterialIcon icon="filter_list" size={20} />
            Filter by Status
            <MaterialIcon icon="expand_more" size={14} />
          </button>
        </div>
      </header>

      {/* Objectives Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {objectives.map((obj, idx) => {
          const children = (obj.children || []) as HierarchicalGoal[];
          const childCounts = computeStatusCounts(children);
          const num = String(idx + 1).padStart(2, '0');

          return (
            <NumberedObjectiveCard
              key={obj.id}
              number={num}
              title={obj.title}
              description={obj.description}
              accentColor={ACCENT_COLORS[idx % ACCENT_COLORS.length]}
              statusDots={statusDotsForGoals(children)}
              onTargetCount={childCounts.onTarget}
              offTrackCount={childCounts.critical + childCounts.atRisk}
              goalCount={children.length}
              onClick={() => router.push(`${basePath}/objectives/${obj.id}`)}
            />
          );
        })}
      </div>

      {/* Footer stats */}
      <footer className="mt-16 pt-12 border-t border-slate-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-12">
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
        <button className="bg-md3-primary text-white font-bold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
          <MaterialIcon icon="download" size={18} />
          Export Strategic Report
        </button>
      </footer>
    </div>
  );
}
