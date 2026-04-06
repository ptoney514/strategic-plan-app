'use client'
import Link from 'next/link';
import { useMemo } from 'react';
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
import { WidgetGrid } from '@/components/v2/widgets/WidgetGrid';
import {
  statusBadgeClasses,
  statusBadgeLabel,
  computeGoalTrend,
} from '@/lib/utils/goalHealth';
import type { HierarchicalGoal } from '@/lib/types';
import type { Widget } from '@/lib/types/v2';
import { findGoalLineage } from '@/lib/utils/goalTree';

function sortWidgets(widgets: Widget[]): Widget[] {
  return [...widgets].sort((a, b) => a.position - b.position);
}

function formatWidgetValue(widget?: Widget, fallbackProgress?: number): string | undefined {
  if (widget?.config?.value != null) {
    const unit = widget.config.unit || '';
    if (unit === '%') return `${widget.config.value}%`;
    if (unit) return `${widget.config.value} ${unit}`;
    return String(widget.config.value);
  }

  if (fallbackProgress != null) {
    return `${fallbackProgress}%`;
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

  const goals = useMemo(
    () => (allGoals || []) as HierarchicalGoal[],
    [allGoals],
  );
  const lineage = useMemo(
    () => (goalId ? findGoalLineage(goals, goalId) : []),
    [goalId, goals],
  );

  const goal = lineage[lineage.length - 1];
  const objective = lineage.find((node) => node.level === 0);
  const parentNode = lineage.length > 1 ? lineage[lineage.length - 2] : undefined;
  const children = useMemo(
    () => (goal?.children || []) as HierarchicalGoal[],
    [goal],
  );
  const siblingGoals = useMemo(
    () => (parentNode ? (parentNode.children || []).filter((node) => node.id !== goalId) : []),
    [goalId, parentNode],
  );
  const comparisonGoals = useMemo(
    () => (children.length > 0 ? children : siblingGoals),
    [children, siblingGoals],
  );

  const relevantGoalIds = useMemo(() => {
    const ids = new Set<string>();
    if (goalId) ids.add(goalId);
    children.forEach((child) => ids.add(child.id));
    comparisonGoals.forEach((comparisonGoal) => ids.add(comparisonGoal.id));
    return Array.from(ids);
  }, [children, comparisonGoals, goalId]);

  const { data: widgets } = useWidgetsByGoals(slug || '', relevantGoalIds);

  const widgetsByGoal = useMemo(() => {
    const widgetMap = new Map<string, Widget[]>();

    (widgets || []).forEach((widget) => {
      if (!widget.goalId) return;
      const currentList = widgetMap.get(widget.goalId) || [];
      currentList.push(widget);
      widgetMap.set(widget.goalId, currentList);
    });

    widgetMap.forEach((widgetList, key) => {
      widgetMap.set(key, sortWidgets(widgetList));
    });

    return widgetMap;
  }, [widgets]);

  const currentGoalWidgets = goalId ? widgetsByGoal.get(goalId) || [] : [];
  const primaryWidget = currentGoalWidgets[0];
  const supplementalWidgets = currentGoalWidgets.slice(1);
  const comparisonWidgets = comparisonGoals
    .map((comparisonGoal) => (widgetsByGoal.get(comparisonGoal.id) || [])[0])
    .filter((widget): widget is Widget => Boolean(widget));

  const derivedTrend = primaryWidget
    ? computeGoalTrend(primaryWidget)
    : {
        delta: 0,
        direction: 'flat' as const,
        value: goal?.overall_progress ?? 0,
        target: 100,
        baseline: 0,
        progress: goal?.overall_progress ?? 0,
      };

  const chartConfig = primaryWidget?.config || {};
  const unit = chartConfig.unit || '%';
  const isDonutWidget = primaryWidget
    ? primaryWidget.type === 'donut'
      || primaryWidget.type === 'progress-bar'
      || primaryWidget.type === 'big-number'
    : false;
  const isBarChart = primaryWidget?.type === 'bar-chart' || primaryWidget?.type === 'area-line';
  const subGoalItems = children.map((child) => {
    const childWidget = (widgetsByGoal.get(child.id) || [])[0];

    return {
      id: child.id,
      goalNumber: child.goal_number,
      title: child.title,
      description: child.description,
      href: `${basePath}/goals/${child.id}`,
      target: childWidget?.config?.target,
      current: childWidget?.config?.value,
      unit: childWidget?.config?.unit || unit,
      status: child.status,
      valuePreview: formatWidgetValue(childWidget, child.overall_progress),
      childCount: child.children?.length || 0,
    };
  });

  const breadcrumbItems = [
    { label: 'Plan', href: basePath },
    ...lineage.map((node, index) => {
      const isLast = index === lineage.length - 1;
      const href = isLast
        ? undefined
        : node.level === 0
        ? `${basePath}/objectives/${node.id}`
        : `${basePath}/goals/${node.id}`;

      return { label: node.title, href };
    }),
  ];

  const backHref = parentNode
    ? parentNode.level === 0
      ? `${basePath}/objectives/${parentNode.id}`
      : `${basePath}/goals/${parentNode.id}`
    : objective
    ? `${basePath}/objectives/${objective.id}`
    : `${basePath}/objectives`;
  const backLabel = parentNode && parentNode.level > 0
    ? 'Back to parent goal'
    : 'Back to goals';
  const showContextualVisuals = supplementalWidgets.length > 0 || comparisonWidgets.length > 0;

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

  return (
    <div className="min-h-[calc(100vh-128px)] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <Breadcrumb items={breadcrumbItems} />
        <Link
          href={backHref}
          data-testid="goal-detail-back-link"
          className="flex items-center text-sm font-medium text-md3-primary hover:translate-x-[-4px] transition-transform duration-200"
        >
          <MaterialIcon icon="arrow_back" size={18} className="mr-1" />
          {backLabel}
        </Link>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-md3-outline-variant/15 bg-md3-surface-low p-5 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-md3-primary text-xl font-black text-md3-on-primary">
              {goal.goal_number}
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-black tracking-tight text-md3-on-surface sm:text-3xl">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="max-w-2xl leading-relaxed text-md3-on-surface-variant">
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

      <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className={isDonutWidget ? 'lg:col-span-5' : 'lg:col-span-4'}>
          <GoalKpiPanel
            value={derivedTrend.value}
            unit={unit}
            total={isDonutWidget && chartConfig.target ? chartConfig.target : undefined}
            totalLabel={isDonutWidget ? unit : undefined}
            statusLabel={statusBadgeLabel(goal.status).toUpperCase()}
            statusColor={
              goal.status?.toLowerCase().includes('target') || goal.status?.toLowerCase().includes('exceeding')
                ? 'text-md3-secondary bg-md3-secondary/5'
                : goal.status?.toLowerCase().includes('risk') || goal.status?.toLowerCase().includes('progress')
                ? 'text-md3-tertiary bg-md3-tertiary/5'
                : 'text-md3-error bg-md3-error/5'
            }
            trend={primaryWidget && chartConfig.baseline != null ? {
              delta: derivedTrend.delta,
              direction: derivedTrend.direction,
              label: `from baseline (${derivedTrend.baseline}${unit === '%' ? '%' : ''})`,
            } : undefined}
            target={chartConfig.target}
            baseline={chartConfig.baseline}
            forecast={chartConfig.indicatorText}
          />
        </div>

        <div className={isDonutWidget ? 'lg:col-span-7' : 'lg:col-span-8'}>
          {isBarChart && chartConfig.dataPoints ? (
            <GoalBarChart
              dataPoints={chartConfig.dataPoints}
              targetValue={chartConfig.target}
              title={primaryWidget?.title || 'Annual Growth'}
              legendLabel={chartConfig.label || `${unit} Value`}
            />
          ) : (
            <SvgDonutChart
              value={derivedTrend.value}
              total={chartConfig.target || 100}
              color="#994100"
              label={`${derivedTrend.value} of ${chartConfig.target || 100} ${unit === '%' ? 'completed' : `${unit} completed`}`}
            />
          )}
        </div>
      </div>

      {subGoalItems.length > 0 && (
        <div className="mb-10">
          <SubGoalAccordion subGoals={subGoalItems} />
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold tracking-tight text-md3-on-surface">
            Contextual visuals
          </h2>
          <p className="text-sm text-md3-on-surface-variant max-w-2xl">
            Supporting charts and comparisons for this goal stay in the main content area so the explorer context remains visible.
          </p>
        </div>

        {supplementalWidgets.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-md3-on-surface-variant">
                Goal visuals
              </h3>
              <span className="text-xs text-md3-on-surface-variant">
                {supplementalWidgets.length} additional view{supplementalWidgets.length === 1 ? '' : 's'}
              </span>
            </div>
            <WidgetGrid widgets={supplementalWidgets} variant="public-detail" />
          </div>
        )}

        {comparisonWidgets.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-md3-on-surface-variant">
                {children.length > 0 ? 'Child comparisons' : 'Related comparisons'}
              </h3>
              <span className="text-xs text-md3-on-surface-variant">
                {comparisonWidgets.length} comparison visual{comparisonWidgets.length === 1 ? '' : 's'}
              </span>
            </div>
            <WidgetGrid widgets={comparisonWidgets} variant="public-detail" />
          </div>
        )}

        {!showContextualVisuals && (
          <div className="rounded-xl border border-dashed border-md3-outline-variant/30 bg-md3-surface-lowest p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-md3-surface-container text-md3-on-surface-variant">
              <MaterialIcon icon="insights" />
            </div>
            <p className="font-semibold text-md3-on-surface mb-1">
              No additional visuals published yet
            </p>
            <p className="text-sm text-md3-on-surface-variant max-w-lg mx-auto">
              This goal still has its primary score and narrative context above. Extra charts and comparison widgets can appear here as the district publishes them.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
