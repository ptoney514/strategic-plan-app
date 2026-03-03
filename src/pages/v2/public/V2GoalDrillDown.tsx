import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { GoalsService } from '../../../lib/services/goals.service';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug } from '../../../hooks/v2/usePlans';
import { useWidgetsByGoals } from '../../../hooks/v2/useWidgets';
import { GoalCard, ExpandedGoalCard, ProgressRing, GoalStatusBadge, Breadcrumb } from '../../../components/v2/public';
import type { Widget } from '../../../lib/types/v2';

export function V2GoalDrillDown() {
  const { goalId } = useParams<{ goalId: string }>();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: plans } = usePlansBySlug(slug || '');

  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const prevExpandedRef = useRef<string | null>(null);
  useEffect(() => {
    if (expandedGoalId && expandedGoalId !== prevExpandedRef.current) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`goal-card-${expandedGoalId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    prevExpandedRef.current = expandedGoalId;
  }, [expandedGoalId]);

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => GoalsService.getById(goalId!),
    enabled: !!goalId,
  });

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['goal-children', goalId],
    queryFn: () => GoalsService.getChildren(goalId!),
    enabled: !!goalId,
  });

  const childIds = children?.map((c) => c.id) || [];
  const { data: goalWidgets } = useWidgetsByGoals(childIds);

  const getWidgetsForGoal = (id: string): Widget[] =>
    goalWidgets?.filter((w) => w.goalId === id) || [];

  const isLoading = goalLoading || childrenLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>
          Goal not found
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: activePlan?.name || 'Plan', href: '/v2' },
          { label: goal.goal_number + ' ' + goal.title },
        ]}
      />

      {/* Objective header */}
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center rounded-xl font-bold text-lg text-white flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              backgroundColor: district?.primary_color || '#1e293b',
            }}
          >
            {goal.goal_number}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--editorial-text-primary)' }}>
              {goal.title}
            </h1>
            {goal.description && (
              <p className="mt-1 text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
                {goal.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {goal.overall_progress != null && goal.overall_progress_display_mode !== 'hidden' && (
            <ProgressRing progress={goal.overall_progress} size={40} strokeWidth={3} />
          )}
          <GoalStatusBadge status={goal.status_detail} />
        </div>
      </div>

      {/* Children section */}
      <div className="space-y-3">
        <h2
          className="uppercase tracking-wider text-xs font-semibold"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          Goals ({children?.length || 0})
        </h2>

        {!children?.length ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--editorial-text-secondary)' }}>
            No goals defined for this objective yet.
          </p>
        ) : (
          <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {children.map((child) => {
                  const isExpanded = expandedGoalId === child.id;
                  const childWidgets = getWidgetsForGoal(child.id);
                  return (
                    <motion.div
                      key={child.id}
                      id={`goal-card-${child.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.2 },
                      }}
                      className={isExpanded ? 'md:col-span-2' : ''}
                    >
                      {isExpanded ? (
                        <ExpandedGoalCard
                          goal={child}
                          widgets={childWidgets}
                          onClose={() => setExpandedGoalId(null)}
                          primaryColor={district?.primary_color}
                        />
                      ) : (
                        <GoalCard
                          goalNumber={child.goal_number}
                          title={child.title}
                          description={child.description}
                          status={child.status_detail}
                          widgets={childWidgets}
                          primaryColor={district?.primary_color}
                          isExpanded={false}
                          onClick={() => setExpandedGoalId(expandedGoalId === child.id ? null : child.id)}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}
