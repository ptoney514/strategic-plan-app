'use client'
import { useParams, useRouter } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { useWidgetsByGoals } from '@/hooks/v2/useWidgets';
import { Breadcrumb } from '@/components/v2/public/Breadcrumb';
import { GoalMetricCard } from '@/components/v2/public/GoalMetricCard';
import { computeStatusCounts, computeGoalTrend } from '@/lib/utils/goalHealth';
import type { HierarchicalGoal } from '@/lib/types';
import type { Widget } from '@/lib/types/v2';

function statusDotChar(status?: string): string {
  const s = status?.toLowerCase().replace(/\s+/g, '_');
  if (s === 'on_target' || s === 'exceeding' || s === 'completed') return 'text-emerald-500';
  if (s === 'at_risk' || s === 'in_progress') return 'text-amber-500';
  if (s === 'critical' || s === 'off_track') return 'text-red-500';
  return 'text-slate-300';
}

export function ObjectiveDetailView() {
  const params = useParams<{ objectiveId: string }>();
  const objectiveId = Array.isArray(params.objectiveId) ? params.objectiveId[0] : params.objectiveId;
  const router = useRouter();
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
  const { data: plans } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals, isLoading } = useGoalsByPlan(activePlan?.id || '');

  const objective = goals?.find((g) => g.id === objectiveId && g.level === 0) as HierarchicalGoal | undefined;
  const children: HierarchicalGoal[] = (objective?.children || []) as HierarchicalGoal[];

  const childIds = children.map((c) => c.id);
  const { data: widgets } = useWidgetsByGoals(slug || '', childIds);

  const getWidgetForGoal = (goalId: string): Widget | undefined =>
    widgets?.find((w) => w.goalId === goalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium text-md3-on-surface-variant">Objective not found</p>
      </div>
    );
  }

  const counts = computeStatusCounts(children);
  const objIdx = goals?.filter((g) => g.level === 0).findIndex((g) => g.id === objectiveId) ?? 0;
  const objNumber = String(objIdx + 1).padStart(2, '0');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plan', href: basePath },
          { label: objective.title },
        ]}
      />

      {/* Objective Header */}
      <section className="mt-5 rounded-2xl bg-white p-5 ghost-border sm:mt-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-start gap-6 sm:gap-8 md:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ghost-border sm:h-16 sm:w-16">
            <span className="text-2xl font-black tabular-nums sm:text-3xl">{objNumber}</span>
          </div>
          <div className="flex-1">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {objective.title}
            </h2>
            {objective.description && (
              <p className="mb-6 max-w-4xl text-base leading-relaxed text-slate-600 sm:mb-8 sm:text-lg">
                {objective.description}
              </p>
            )}
            <div className="border-t border-slate-100 pt-6 sm:pt-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Goal Health Summary
                  </span>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex flex-wrap items-center gap-2 text-xl tracking-widest">
                      {children.map((c) => (
                        <span key={c.id} className={statusDotChar(c.status)}>
                          {c.status?.toLowerCase().includes('target') || c.status?.toLowerCase().includes('exceeding') ? '\u25CF' : '\u25CB'}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-medium leading-6 text-slate-600">
                      <span className="text-emerald-600">{counts.onTarget} on target</span>
                      {' \u00B7 '}
                      <span className="text-red-500">{counts.critical + counts.atRisk} off</span>
                      {counts.noData > 0 && (
                        <>
                          {' \u00B7 '}
                          <span className="text-slate-400">{counts.noData} awaiting</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
                >
                  PDF export coming soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {children.map((child) => {
          const widget = getWidgetForGoal(child.id);
          const trend = computeGoalTrend(widget);

          return (
            <GoalMetricCard
              key={child.id}
              goalNumber={child.goal_number}
              title={child.title}
              status={child.status}
              currentScore={widget ? trend.value : child.overall_progress}
              unit={widget?.config?.unit || '%'}
              trendDelta={widget ? trend.delta : undefined}
              trendDirection={widget ? trend.direction : undefined}
              target={widget?.config?.target}
              progressPercent={widget ? trend.progress : child.overall_progress}
              testId={`objective-goal-card-${child.goal_number}`}
              onClick={() => router.push(`${basePath}/goals/${child.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
