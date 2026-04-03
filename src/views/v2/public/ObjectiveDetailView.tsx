'use client'
import { useParams, useRouter } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { useWidgetsByGoals } from '@/hooks/v2/useWidgets';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
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
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plan', href: basePath },
          { label: objective.title },
        ]}
      />

      {/* Objective Header */}
      <section className="bg-white rounded-xl p-10 mb-12 ghost-border mt-6">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="h-16 w-16 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 ghost-border">
            <span className="text-3xl font-black tabular-nums">{objNumber}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
              {objective.title}
            </h2>
            {objective.description && (
              <p className="text-lg text-slate-600 leading-relaxed max-w-4xl mb-8">
                {objective.description}
              </p>
            )}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                    Goal Health Summary
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xl tracking-widest">
                      {children.map((c) => (
                        <span key={c.id} className={statusDotChar(c.status)}>
                          {c.status?.toLowerCase().includes('target') || c.status?.toLowerCase().includes('exceeding') ? '\u25CF' : '\u25CB'}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-600">
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
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              onClick={() => router.push(`${basePath}/goals/${child.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
