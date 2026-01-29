import type { District, Goal, Metric, DashboardConfig } from '../../../lib/types';
import { NarrativeHero } from '../NarrativeHero';
import { ObjectivesGrid } from '../ObjectivesGrid';

interface HierarchicalTemplateProps {
  district: District;
  objectives: Goal[];
  goals: Goal[];
  metrics: Metric[];
  config: DashboardConfig;
  isLoading?: boolean;
}

/**
 * HierarchicalTemplate - Traditional strategic plan view
 * Features:
 * - Narrative hero section with plan title
 * - Objectives grid with clickable cards
 * - Nested goals and metrics structure
 */
export function HierarchicalTemplate({
  objectives,
  goals,
  metrics,
  config,
  isLoading = false,
}: HierarchicalTemplateProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 h-64">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-full mb-4" />
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {config.showNarrativeHero !== false && <NarrativeHero />}
      <ObjectivesGrid
        objectives={objectives}
        goals={goals}
        metrics={metrics}
      />
    </div>
  );
}
