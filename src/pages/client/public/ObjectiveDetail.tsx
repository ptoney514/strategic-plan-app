import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link, useLocation } from 'react-router-dom';
import { useGoal, useChildGoals } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import { StatusBadge, MobileGoalBottomSheet, GoalsOverviewGrid } from '../../../components/public';
import type { StatusType } from '../../../components/public/StatusBadge';
import { FolderOpen } from 'lucide-react';
import type { District, Goal, Metric } from '../../../lib/types';

interface ObjectiveDetailContext {
  district: District;
  objectives: Goal[];
  goals: Goal[];
}

// Color mapping for objective header
const colorConfig = {
  red: {
    badge: 'bg-district-red',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-district-red',
  },
  blue: {
    badge: 'bg-district-blue',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-district-blue',
  },
  amber: {
    badge: 'bg-district-amber',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-district-amber',
  },
  green: {
    badge: 'bg-district-green',
    light: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-district-green',
  },
};

function getColor(goal: Goal, index: number): keyof typeof colorConfig {
  if (goal.color && goal.color in colorConfig) {
    return goal.color as keyof typeof colorConfig;
  }
  const defaultColors: (keyof typeof colorConfig)[] = ['red', 'blue', 'amber', 'green'];
  return defaultColors[index % defaultColors.length];
}

export function ObjectiveDetail() {
  const { goalId, slug } = useParams<{ goalId: string; slug: string }>();
  const context = useOutletContext<ObjectiveDetailContext>();
  const location = useLocation();

  const { data: objective, isLoading: objectiveLoading } = useGoal(goalId!);
  const { data: childGoals, isLoading: childrenLoading } = useChildGoals(goalId!);
  const { data: allMetrics, isLoading: metricsLoading } = useMetricsByDistrict(context?.district?.id || '');

  const isLoading = objectiveLoading || childrenLoading || metricsLoading;

  // Mobile carousel state
  const [focusedGoalId, setFocusedGoalId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect hash changes for mobile carousel
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#goal-') && isMobile) {
        const goalIdFromHash = hash.replace('#goal-', '');
        setFocusedGoalId(goalIdFromHash);
      } else if (!hash && isMobile) {
        setFocusedGoalId(null);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes (including from replaceState)
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isMobile]);

  // Also respond to React Router location changes
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith('#goal-') && isMobile) {
      const goalIdFromHash = hash.replace('#goal-', '');
      setFocusedGoalId(goalIdFromHash);
    }
  }, [location.hash, isMobile]);

  // Close carousel and clear hash
  const handleCarouselClose = () => {
    setFocusedGoalId(null);
    window.history.replaceState(null, '', location.pathname);
  };

  // Find the objective index for color assignment
  const objectiveIndex = context?.objectives?.findIndex(o => o.id === goalId) ?? 0;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-lg" />
          <div className="flex-1">
            <div className="h-8 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-1 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-gray-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Objective not found</p>
        <Link to={`/${slug}`} className="mt-4 inline-flex items-center text-district-red hover:underline">
          Return to Overview
        </Link>
      </div>
    );
  }

  const color = getColor(objective, objectiveIndex);
  const colors = colorConfig[color];

  // Get child goals (Level 1) and sort by goal_number
  const level1Goals = (childGoals?.filter(g => g.level === 1) || []).sort((a, b) => {
    const aNum = parseFloat(a.goal_number?.replace(/[^\d.]/g, '') || '0');
    const bNum = parseFloat(b.goal_number?.replace(/[^\d.]/g, '') || '0');
    return aNum - bNum;
  });

  // Helper to get manual status set by admin (stored in indicator_text)
  // Default to 'on-target' to match admin2 behavior
  const getManualStatus = (goal: Goal): StatusType => {
    const validStatuses = ['on-target', 'needs-attention', 'off-track', 'not-started', 'on-track', 'complete'];
    // Use indicator_text (set via badge UI) first, fall back to overall_progress_custom_value for backwards compat
    const statusText = goal.indicator_text || goal.overall_progress_custom_value;
    const manualStatus = statusText?.toLowerCase().replace(/\s+/g, '-');
    return validStatuses.includes(manualStatus || '')
      ? (manualStatus as StatusType)
      : 'on-target';  // Default to on-target to match admin2
  };

  const status = getManualStatus(objective);

  // All metrics for filtering
  const metrics: Metric[] = allMetrics || [];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex text-xs text-gray-500 space-x-2 items-center">
        <Link to={`/${slug}`} className="hover:text-gray-900 transition-colors">
          Strategic Plan
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{objective.goal_number} {objective.title}</span>
      </nav>

      {/* Header with Number Badge and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg ${colors.badge} text-white flex items-center justify-center font-display font-semibold text-xl lg:text-2xl shadow-sm flex-shrink-0`}
        >
          {objective.goal_number}
        </div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-display font-semibold text-2xl lg:text-3xl text-gray-900 tracking-tight">
              {objective.title}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
            {objective.description || objective.executive_summary ||
              `This strategic objective encompasses our commitment to excellence and continuous improvement.`}
          </p>
        </div>
      </div>

      {/* Goals Overview Grid - 3 columns on desktop, single column on mobile */}
      {level1Goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-4 mb-6">
            <h2 className="font-display font-medium text-lg text-gray-900 dark:text-gray-100">
              Goals Overview
            </h2>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {level1Goals.length} goal{level1Goals.length !== 1 ? 's' : ''} total
            </div>
          </div>

          <GoalsOverviewGrid
            goals={level1Goals}
            metrics={metrics}
            colorClass={colors.badge}
            isMobile={isMobile}
            onMobileGoalSelect={(goalId) => {
              setFocusedGoalId(goalId);
              window.history.replaceState(null, '', `#goal-${goalId}`);
            }}
          />
        </div>
      )}

      {/* Mobile Goal Bottom Sheet */}
      {isMobile && focusedGoalId && level1Goals.length > 0 && (
        <MobileGoalBottomSheet
          goal={level1Goals.find(g => g.id === focusedGoalId)!}
          metrics={metrics}
          colorClass={colors.badge}
          onClose={handleCarouselClose}
        />
      )}

      {/* Empty state for objectives with no goals */}
      {level1Goals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            This objective doesn't have any goals defined yet. Goals help track progress toward achieving this strategic objective.
          </p>
        </div>
      )}
    </div>
  );
}
