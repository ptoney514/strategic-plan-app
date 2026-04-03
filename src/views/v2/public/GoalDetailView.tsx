'use client'
import { useParams } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { useWidgetsByGoals } from '@/hooks/v2/useWidgets';
import { Breadcrumb } from '@/components/v2/public/Breadcrumb';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { GoalKpiPanel } from '@/components/v2/public/GoalKpiPanel';
import { SvgDonutChart } from '@/components/v2/public/SvgDonutChart';
import { GoalBarChart } from '@/components/v2/public/GoalBarChart';
import { SubGoalAccordion } from '@/components/v2/public/SubGoalAccordion';
import { statusBadgeClasses, statusBadgeLabel, computeGoalTrend } from '@/lib/utils/goalHealth';
import type { HierarchicalGoal } from '@/lib/types';
import type { Widget } from '@/lib/types/v2';

function findGoalInHierarchy(goals: HierarchicalGoal[], id: string): HierarchicalGoal | undefined {
  for (const g of goals) {
    if (g.id === id) return g;
    const found = findGoalInHierarchy(g.children || [], id);
    if (found) return found;
  }
  return undefined;
}

function findParentObjective(goals: HierarchicalGoal[], goalId: string): HierarchicalGoal | undefined {
  for (const obj of goals) {
    if (obj.level === 0) {
      const found = (obj.children || []).find((c) => c.id === goalId);
      if (found) return obj;
      for (const child of obj.children || []) {
        const grandchild = (child.children || []).find((gc) => gc.id === goalId);
        if (grandchild) return obj;
      }
    }
  }
  return undefined;
}

export function GoalDetailView() {
  const params = useParams<{ goalId: string }>();
  const goalId = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
  const { data: plans } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: allGoals, isLoading } = useGoalsByPlan(activePlan?.id || '');

  const goal = allGoals && goalId ? findGoalInHierarchy(allGoals as HierarchicalGoal[], goalId) : undefined;
  const parentObj = allGoals ? findParentObjective(allGoals as HierarchicalGoal[], goalId) : undefined;
  const children: HierarchicalGoal[] = (goal?.children || []) as HierarchicalGoal[];

  const allGoalIds = [goalId, ...children.map((c) => c.id)].filter(Boolean) as string[];
  const { data: widgets } = useWidgetsByGoals(slug || '', allGoalIds);

  const primaryWidget: Widget | undefined = widgets?.find((w) => w.goalId === goalId);
  const trend = computeGoalTrend(primaryWidget);
  const config = primaryWidget?.config || {};

  // Determine chart type: donut for progress-bar/donut, bar for bar-chart/area-line
  const isDonut = !primaryWidget || primaryWidget.type === 'donut' || primaryWidget.type === 'progress-bar' || primaryWidget.type === 'big-number';
  const isBarChart = primaryWidget?.type === 'bar-chart' || primaryWidget?.type === 'area-line';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium text-md3-on-surface-variant">Goal not found</p>
      </div>
    );
  }

  const unit = config.unit || '%';

  // Build sub-goal items
  const subGoalItems = children.map((c) => {
    const cWidget = widgets?.find((w) => w.goalId === c.id);
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      target: cWidget?.config?.target,
      current: cWidget?.config?.value,
      unit: cWidget?.config?.unit || unit,
      status: c.status,
    };
  });

  return (
    <div className="min-h-[calc(100vh-128px)]">
      {/* Breadcrumbs & Back Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <Breadcrumb
          items={[
            { label: 'Plan', href: basePath },
            ...(parentObj ? [{ label: parentObj.title, href: `${basePath}/objectives/${parentObj.id}` }] : []),
            { label: goal.title },
          ]}
        />
        <a
          href={parentObj ? `${basePath}/objectives/${parentObj.id}` : `${basePath}/objectives`}
          className="flex items-center text-sm font-medium text-md3-primary hover:translate-x-[-4px] transition-transform duration-200"
        >
          <MaterialIcon icon="arrow_back" size={18} className="mr-1" />
          Back to goals
        </a>
      </div>

      {/* Goal Header */}
      <div className="bg-md3-surface-low p-8 rounded-xl border border-md3-outline-variant/15 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-md3-primary text-md3-on-primary rounded-lg flex items-center justify-center font-black text-xl flex-shrink-0">
              {goal.goal_number}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-md3-on-surface mb-2">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-md3-on-surface-variant max-w-2xl leading-relaxed">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${statusBadgeClasses(goal.status)}`}>
              {statusBadgeLabel(goal.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Left Panel: KPI Stats */}
        <div className={isDonut ? 'lg:col-span-5' : 'lg:col-span-4'}>
          <GoalKpiPanel
            value={trend.value}
            unit={unit}
            total={isDonut && config.target ? config.target : undefined}
            totalLabel={isDonut ? unit : undefined}
            statusLabel={statusBadgeLabel(goal.status).toUpperCase()}
            statusColor={
              goal.status?.toLowerCase().includes('target') || goal.status?.toLowerCase().includes('exceeding')
                ? 'text-md3-secondary bg-md3-secondary/5'
                : goal.status?.toLowerCase().includes('risk') || goal.status?.toLowerCase().includes('progress')
                ? 'text-md3-tertiary bg-md3-tertiary/5'
                : 'text-md3-error bg-md3-error/5'
            }
            trend={{
              delta: trend.delta,
              direction: trend.direction,
              label: `from baseline (${trend.baseline}${unit === '%' ? '%' : ''})`,
            }}
            target={config.target}
            baseline={config.baseline}
            forecast={config.indicatorText}
          />
        </div>

        {/* Right Panel: Chart */}
        <div className={isDonut ? 'lg:col-span-7' : 'lg:col-span-8'}>
          {isBarChart && config.dataPoints ? (
            <GoalBarChart
              dataPoints={config.dataPoints}
              targetValue={config.target}
              title={primaryWidget?.title || 'Annual Growth'}
              legendLabel={config.label || `${unit} Value`}
            />
          ) : (
            <SvgDonutChart
              value={trend.value}
              total={config.target || 100}
              color="#994100"
              label={`${trend.value} of ${config.target || 100} ${unit === '%' ? 'completed' : unit + ' completed'}`}
            />
          )}
        </div>
      </div>

      {/* Sub-Goals Accordion */}
      {subGoalItems.length > 0 && <SubGoalAccordion subGoals={subGoalItems} />}
    </div>
  );
}
