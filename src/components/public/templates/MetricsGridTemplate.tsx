import type { District, Metric, DashboardConfig } from '../../../lib/types';
import { NarrativeHero } from '../NarrativeHero';
import { MetricCardFactory } from './cards/MetricCardFactory';

interface MetricsGridTemplateProps {
  district: District;
  metrics: Metric[];
  config: DashboardConfig;
  isLoading?: boolean;
}

/**
 * MetricsGridTemplate - Flat grid of KPI cards
 * Features:
 * - Optional narrative hero
 * - Flat grid of metric cards (no hierarchy)
 * - Configurable grid columns
 * - Animation support
 */
export function MetricsGridTemplate({
  metrics,
  config,
  isLoading = false,
}: MetricsGridTemplateProps) {
  const gridCols = config.gridColumns || 3;
  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[gridCols] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (isLoading) {
    return (
      <div className={`grid ${gridColsClass} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 h-48">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-4" />
            <div className="h-10 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Filter to primary metrics or limit to reasonable count
  const displayMetrics = metrics.filter(m => m.is_primary !== false).slice(0, 12);

  if (displayMetrics.length === 0) {
    return (
      <div>
        {config.showNarrativeHero !== false && <NarrativeHero />}
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">No metrics configured yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {config.showNarrativeHero !== false && <NarrativeHero />}
      <div className={`grid ${gridColsClass} gap-6`}>
        {displayMetrics.map((metric, index) => (
          <MetricCardFactory
            key={metric.id}
            metric={metric}
            variant={config.cardVariant || 'default'}
            enableAnimations={config.enableAnimations}
            animationDelay={index * 100}
          />
        ))}
      </div>
    </div>
  );
}
