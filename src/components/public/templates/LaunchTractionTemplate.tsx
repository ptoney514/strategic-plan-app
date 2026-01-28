import type { District, Metric, DashboardConfig } from '../../../lib/types';
import { ThemeToggle } from '../ThemeToggle';
import { MetricCardFactory } from './cards/MetricCardFactory';

interface LaunchTractionTemplateProps {
  district: District;
  metrics: Metric[];
  config: DashboardConfig;
  isLoading?: boolean;
}

/**
 * LaunchTractionTemplate - Animated dashboard for tracking outcomes
 * Features:
 * - Full-width layout (no sidebar)
 * - Animated counters and charts
 * - Large hero metrics
 * - Trend indicators
 */
export function LaunchTractionTemplate({
  district,
  metrics,
  config,
  isLoading = false,
}: LaunchTractionTemplateProps) {
  const gridCols = config.gridColumns || 4;
  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[gridCols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Hero loading skeleton */}
        <div className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl p-8">
          <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
        </div>
        {/* Grid loading skeleton */}
        <div className={`grid ${gridColsClass} gap-6`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-6 h-40">
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-12 bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Separate hero metrics (first 2-3 primary metrics) from rest
  const primaryMetrics = metrics.filter(m => m.is_primary === true).slice(0, 3);
  const remainingMetrics = metrics.filter(m => !primaryMetrics.includes(m));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{district.name}</h1>
            {district.tagline && (
              <p className="text-slate-300 text-lg">{district.tagline}</p>
            )}
          </div>
          <ThemeToggle variant="default" />
        </div>

        {/* Hero Metrics Row */}
        {primaryMetrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {primaryMetrics.map((metric, index) => (
              <MetricCardFactory
                key={metric.id}
                metric={metric}
                variant="rich"
                enableAnimations={config.enableAnimations}
                animationDelay={index * 150}
                darkMode
              />
            ))}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      {remainingMetrics.length > 0 && (
        <div className={`grid ${gridColsClass} gap-6`}>
          {remainingMetrics.map((metric, index) => (
            <MetricCardFactory
              key={metric.id}
              metric={metric}
              variant={config.cardVariant || 'rich'}
              enableAnimations={config.enableAnimations}
              animationDelay={(primaryMetrics.length + index) * 100}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">No metrics configured yet.</p>
        </div>
      )}
    </div>
  );
}
