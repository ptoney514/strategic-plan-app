'use client';
import { useParams } from 'next/navigation';
import { useSubdomain, useDistrictLink } from '@/contexts/SubdomainContext';
import { usePlansBySlug } from '@/hooks/v2/usePlans';
import { useGoalsByPlan } from '@/hooks/v2/useGoals';
import { useWidgetsByGoals } from '@/hooks/v2/useWidgets';
import { Breadcrumb } from '@/components/v2/public/Breadcrumb';
import { getObjectiveNarrative } from '@/lib/utils/objectiveFixtures';
import { ObjectiveHeader } from './ObjectiveDetailView/ObjectiveHeader';
import { ObjectiveDataColumn } from './ObjectiveDetailView/ObjectiveDataColumn';
import type { HierarchicalGoal } from '@/lib/types';

export function ObjectiveDetailView() {
  const params = useParams<{ objectiveId: string }>();
  const objectiveId = Array.isArray(params.objectiveId)
    ? params.objectiveId[0]
    : params.objectiveId;
  const { slug } = useSubdomain();
  const link = useDistrictLink();
  const homeHref = link('/');

  const { data: plans } = usePlansBySlug(slug || '');
  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const { data: goals, isLoading } = useGoalsByPlan(activePlan?.id || '');

  const objective = goals?.find(
    (g) => g.id === objectiveId && g.level === 0
  ) as HierarchicalGoal | undefined;
  const childGoals: HierarchicalGoal[] = (objective?.children || []) as HierarchicalGoal[];

  const childIds = childGoals.map((c) => c.id);
  const { data: widgets } = useWidgetsByGoals(slug || '', childIds);

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-testid="objective-detail-loading"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-md3-primary" />
      </div>
    );
  }

  if (!objective) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
        data-testid="objective-detail-not-found"
      >
        <p className="text-lg font-medium text-md3-on-surface-variant">
          Objective not found
        </p>
      </div>
    );
  }

  const narrative = getObjectiveNarrative(objective.goal_number);
  const objIdx =
    goals?.filter((g) => g.level === 0).findIndex((g) => g.id === objectiveId) ?? 0;
  const objNumber = String(objIdx + 1).padStart(2, '0');

  return (
    <div
      className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="obj-wm"
        aria-hidden="true"
        data-testid="objective-watermark"
      >
        {objNumber}
      </div>

      <Breadcrumb
        items={[
          { label: 'Plan', href: homeHref },
          { label: objective.title },
        ]}
      />

      <div
        className="relative mt-6 grid items-start gap-10 md:grid-cols-12 md:gap-14"
        data-testid="objective-detail-grid"
      >
        <ObjectiveHeader
          narrative={narrative}
          status={objective.status}
        />
        <ObjectiveDataColumn
          narrative={narrative}
          objectiveStatus={objective.status}
          childGoals={childGoals}
          widgets={widgets ?? []}
        />
      </div>
    </div>
  );
}
