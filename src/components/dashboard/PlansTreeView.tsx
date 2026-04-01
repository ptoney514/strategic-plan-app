import { useState } from 'react';
import Link from 'next/link';
import { MessageSquareText, MoreHorizontal, Plus, ChevronRight, X, Target } from 'lucide-react';
import type { PlanWithSummary, HierarchicalGoal } from '../../lib/types';
import { cn } from '../../lib/utils';

interface PlansTreeViewProps {
  plans: PlanWithSummary[];
  goalsByPlan: Record<string, HierarchicalGoal[]>;
  onAddObjective: (planId: string) => void;
  isLoading?: boolean;
}

type GoalStatus = 'on-track' | 'at-risk' | 'critical' | 'no-data';

function getGoalStatus(goal: HierarchicalGoal): GoalStatus {
  if (goal.status) {
    if (goal.status === 'on-target') return 'on-track';
    if (goal.status === 'at-risk') return 'at-risk';
    if (goal.status === 'critical' || goal.status === 'off-target') return 'critical';
    if (goal.status === 'not-started') return 'no-data';
    return 'no-data';
  }

  // Fallback based on overall_progress
  if (goal.overall_progress !== undefined && goal.overall_progress !== null) {
    if (goal.overall_progress >= 70) return 'on-track';
    if (goal.overall_progress >= 40) return 'at-risk';
    return 'critical';
  }

  return 'no-data';
}

function StatusBadge({ status }: { status: GoalStatus }) {
  const config = {
    'on-track': {
      label: 'On Track',
      classes: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      dotClass: 'bg-emerald-500',
    },
    'at-risk': {
      label: 'At Risk',
      classes: 'bg-amber-50 text-amber-600 border-amber-100',
      dotClass: 'bg-amber-500',
    },
    critical: {
      label: 'Critical',
      classes: 'bg-red-50 text-red-600 border-red-100',
      dotClass: 'bg-red-500',
    },
    'no-data': {
      label: 'No Data',
      classes: 'bg-slate-50 text-slate-500 border-slate-100',
      dotClass: 'bg-slate-400',
    },
  };

  const { label, classes, dotClass } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
        classes
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotClass)} />
      {label}
    </span>
  );
}

function ObjectiveItem({
  goal,
}: {
  goal: HierarchicalGoal;
}) {
  const status = getGoalStatus(goal);
  const childCount = goal.children?.length || 0;

  return (
    <div className="relative">
      {/* Connector Line */}
      <div className="absolute left-[11px] top-4 w-4 h-px bg-slate-200" />

      <div className="bg-white border border-slate-200 rounded-md p-3 flex items-start justify-between group hover:border-brand-teal/50 transition-colors">
        <div className="flex gap-3 w-full">
          <div className="w-6 h-6 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
            {status === 'on-track' ? (
              <Target size={12} />
            ) : (
              <X size={12} strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/objectives/${goal.id}`}
                className="text-sm font-medium text-slate-900 leading-snug hover:text-brand-teal transition-colors"
              >
                {goal.title}
              </Link>
              <StatusBadge status={status} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-brand-teal/10 text-brand-teal">
                <ChevronRight size={10} />
                {childCount} {childCount === 1 ? 'goal' : 'goals'}
              </span>
              <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  goals,
  onAddObjective,
}: {
  plan: PlanWithSummary;
  goals: HierarchicalGoal[];
  onAddObjective: (planId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get level 0 goals (objectives) for this plan
  const objectives = goals.filter((g) => g.level === 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Plan Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b border-transparent hover:bg-slate-50/50 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-brand-teal">
            <MessageSquareText size={20} />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">{plan.name}</h4>
          <span className="text-xs text-slate-500">
            ({objectives.length} {objectives.length === 1 ? 'objective' : 'objectives'})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </button>

      {/* Tree Content */}
      {isExpanded && (
        <div className="relative px-4 pb-4">
          {/* Vertical Line */}
          {objectives.length > 0 && (
            <div className="absolute left-[26px] top-0 bottom-8 w-px bg-slate-200" />
          )}

          {/* Objectives */}
          <div className="relative pl-8 space-y-3 pt-3">
            {objectives.map((objective) => (
              <ObjectiveItem
                key={objective.id}
                goal={objective}
              />
            ))}

            {/* Add button */}
            <div className="relative mt-3">
              {objectives.length > 0 && (
                <>
                  <div className="absolute left-[11px] top-[-12px] bottom-1/2 w-px bg-slate-200" />
                  <div className="absolute left-[11px] top-[50%] -translate-y-1/2 w-4 h-px bg-slate-200" />
                </>
              )}
              <button
                onClick={() => onAddObjective(plan.id)}
                className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-deepTeal transition-colors py-1.5 px-3 rounded-md border border-slate-200 hover:border-brand-teal/50 hover:bg-brand-teal/5 bg-white w-max"
              >
                <Plus size={16} />
                Add new objective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlansTreeView({
  plans,
  goalsByPlan,
  onAddObjective,
  isLoading,
}: PlansTreeViewProps) {
  if (isLoading) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Your plans</h3>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Your plans</h3>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-slate-500 text-sm">
            No plans found. Create your first strategic plan to get started.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">Your plans</h3>
      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            goals={goalsByPlan[plan.id] || []}
            onAddObjective={onAddObjective}
          />
        ))}
      </div>
    </section>
  );
}
