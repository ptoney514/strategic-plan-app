import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Metric, HierarchicalGoal } from '../../lib/types';
import { CompactGoalSummaryCard } from './CompactGoalSummaryCard';
import { ExpandedGoalPanel } from './ExpandedGoalPanel';

interface GoalsOverviewGridProps {
  goals: HierarchicalGoal[];
  metrics: Metric[];
  colorClass: string;
  isMobile: boolean;
  onMobileGoalSelect: (goalId: string) => void;
  expandedGoalId: string | null;
  onExpandChange: (goalId: string | null) => void;
}

export function GoalsOverviewGrid({
  goals,
  metrics,
  colorClass,
  isMobile,
  onMobileGoalSelect,
  expandedGoalId,
  onExpandChange,
}: GoalsOverviewGridProps) {
  const prevExpandedRef = useRef<string | null>(null);

  // Scroll expanded card to center when expansion state changes
  useEffect(() => {
    if (expandedGoalId && !isMobile && expandedGoalId !== prevExpandedRef.current) {
      // Wait for layout animation to start before scrolling
      const timer = setTimeout(() => {
        const element = document.getElementById(`goal-card-${expandedGoalId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    prevExpandedRef.current = expandedGoalId;
  }, [expandedGoalId, isMobile]);

  const handleCardClick = (goalId: string) => {
    if (isMobile) {
      onMobileGoalSelect(goalId);
    } else {
      // Toggle: if already expanded, collapse; otherwise expand
      onExpandChange(expandedGoalId === goalId ? null : goalId);
    }
  };

  const handleClose = () => {
    onExpandChange(null);
  };

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => {
            const isExpanded = expandedGoalId === goal.id && !isMobile;

            return (
              <motion.div
                key={goal.id}
                id={`goal-card-${goal.id}`}
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
                  <ExpandedGoalPanel
                    goal={goal}
                    metrics={metrics}
                    colorClass={colorClass}
                    onClose={handleClose}
                    subGoals={goal.children || []}
                  />
                ) : (
                  <CompactGoalSummaryCard
                    goal={goal}
                    metrics={metrics}
                    colorClass={colorClass}
                    isExpanded={false}
                    onClick={() => handleCardClick(goal.id)}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
