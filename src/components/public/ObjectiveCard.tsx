import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Target, BarChart3 } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';

interface ObjectiveCardProps {
  objective: Goal;
  childGoals: Goal[];
  metrics: Metric[];
  index: number;
}

// Color mapping for objective cards
const colorConfig = {
  red: {
    border: 'border-t-district-red',
    badge: 'bg-district-red',
    badgeText: 'text-white',
  },
  blue: {
    border: 'border-t-district-blue',
    badge: 'bg-district-blue',
    badgeText: 'text-white',
  },
  amber: {
    border: 'border-t-district-amber',
    badge: 'bg-district-amber',
    badgeText: 'text-white',
  },
  green: {
    border: 'border-t-district-green',
    badge: 'bg-district-green',
    badgeText: 'text-white',
  },
};

// Get color based on goal's color field or default by position
function getColor(goal: Goal, index: number): keyof typeof colorConfig {
  if (goal.color && goal.color in colorConfig) {
    return goal.color as keyof typeof colorConfig;
  }
  const defaultColors: (keyof typeof colorConfig)[] = ['red', 'blue', 'amber', 'green'];
  return defaultColors[index % defaultColors.length];
}

export function ObjectiveCard({ objective, childGoals, metrics, index }: ObjectiveCardProps) {
  const { slug } = useParams();
  const color = getColor(objective, index);
  const colors = colorConfig[color];

  // Get metrics for this objective and its children
  const objectiveMetrics = metrics.filter(m =>
    m.goal_id === objective.id || childGoals.some(g => g.id === m.goal_id)
  );

  // Find hero metric (first metric with is_primary flag, or first metric)
  const heroMetric = objectiveMetrics.find(m => m.is_primary) || objectiveMetrics[0];

  // Calculate status
  const status = calculateStatus(objective.overall_progress);

  // Format hero metric value
  const formatMetricValue = (metric: Metric) => {
    const value = metric.current_value ?? metric.actual_value ?? 0;

    if (metric.metric_type === 'percent' || metric.is_percentage) {
      return { value: value.toFixed(0), unit: '%' };
    }
    if (metric.metric_type === 'rating') {
      return { value: value.toFixed(2), unit: `/ ${metric.target_value || 5}` };
    }
    if (metric.metric_type === 'currency') {
      return { value: `$${value.toLocaleString()}`, unit: '' };
    }
    return { value: value.toString(), unit: metric.unit || '' };
  };

  return (
    <Link
      to={`/${slug}/goal/${objective.id}`}
      className={`group block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-t-[3px] ${colors.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="p-6">
        {/* Header: Number badge + Title + Goal count */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg ${colors.badge} ${colors.badgeText} flex items-center justify-center font-display font-semibold text-sm`}
            >
              {objective.goal_number}
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors">
              {objective.title}
            </h3>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {childGoals.length} goal{childGoals.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {objective.description || objective.executive_summary || 'Strategic objective for organizational growth and excellence.'}
        </p>

        {/* Metrics Summary */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>{childGoals.length} Goals</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{objectiveMetrics.length} Metrics</span>
          </div>
        </div>

        {/* Footer: Status + Hero metric + View details */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <StatusBadge status={status} size="sm" />
            {heroMetric && (
              <div className="flex items-baseline gap-1">
                <span className="font-display font-semibold text-xl text-gray-900">
                  {formatMetricValue(heroMetric).value}
                </span>
                <span className="text-sm text-gray-400">
                  {formatMetricValue(heroMetric).unit}
                </span>
              </div>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-district-red transition-colors">
            View details
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
