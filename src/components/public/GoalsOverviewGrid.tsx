import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Goal, Metric } from '../../lib/types';
import { CompactGoalSummaryCard } from './CompactGoalSummaryCard';
import { ExpandedGoalPanel } from './ExpandedGoalPanel';

interface GoalsOverviewGridProps {
  goals: Goal[];
  metrics: Metric[];
  colorClass: string;
  isMobile: boolean;
  onMobileGoalSelect: (goalId: string) => void;
}

export function GoalsOverviewGrid({
  goals,
  metrics,
  colorClass,
  isMobile,
  onMobileGoalSelect,
}: GoalsOverviewGridProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const handleCardClick = (goalId: string) => {
    if (isMobile) {
      onMobileGoalSelect(goalId);
    } else {
      // Toggle: if already expanded, collapse; otherwise expand
      setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
    }
  };

  const handleClose = () => {
    setExpandedGoalId(null);
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
