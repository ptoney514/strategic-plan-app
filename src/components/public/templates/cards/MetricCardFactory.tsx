import type { Metric } from '../../../../lib/types';
import { AnimatedCounterCard } from './AnimatedCounterCard';
import { DonutProgressCard } from './DonutProgressCard';
import { TrendIndicatorCard } from './TrendIndicatorCard';
import { AreaChartCard } from './AreaChartCard';
import { GroupedBarCard } from './GroupedBarCard';

type CardVariant = 'default' | 'compact' | 'rich';

interface MetricCardFactoryProps {
  metric: Metric;
  variant?: CardVariant;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
}

/**
 * MetricCardFactory - Routes metrics to appropriate card types
 * Selection logic:
 * 1. Use visualization_config.chartType if specified
 * 2. Use chart_type if specified
 * 3. Infer from metric properties (data_points, target_value, etc.)
 * 4. Default based on variant
 */
export function MetricCardFactory({
  metric,
  variant = 'default',
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
}: MetricCardFactoryProps) {
  const props = { metric, enableAnimations, animationDelay, darkMode };

  // Determine card type from configuration or inference
  const cardType = determineCardType(metric, variant);

  switch (cardType) {
    case 'counter':
      return <AnimatedCounterCard {...props} />;
    case 'donut':
      return <DonutProgressCard {...props} />;
    case 'trend':
      return <TrendIndicatorCard {...props} />;
    case 'area':
      return <AreaChartCard {...props} />;
    case 'bar':
    case 'grouped-bar':
      return <GroupedBarCard {...props} />;
    default:
      // Default to trend for rich, counter for compact, donut for default
      if (variant === 'rich') {
        return <TrendIndicatorCard {...props} />;
      }
      if (variant === 'compact') {
        return <AnimatedCounterCard {...props} />;
      }
      return <DonutProgressCard {...props} />;
  }
}

/**
 * Determine the best card type for a metric
 */
function determineCardType(
  metric: Metric,
  variant: CardVariant
): 'counter' | 'donut' | 'trend' | 'area' | 'bar' | 'grouped-bar' | 'default' {
  // 1. Check explicit visualization config
  if (metric.visualization_config?.chartType) {
    const configType = metric.visualization_config.chartType;
    if (configType === 'donut' || configType === 'pie') return 'donut';
    if (configType === 'area') return 'area';
    if (configType === 'bar') return 'bar';
    if (configType === 'line') return 'area'; // Use area for line charts
    if (configType === 'value' || configType === 'number') return 'counter';
    if (configType === 'gauge' || configType === 'progress') return 'donut';
  }

  // 2. Check chart_type field
  if (metric.chart_type) {
    if (metric.chart_type === 'donut') return 'donut';
    if (metric.chart_type === 'area') return 'area';
    if (metric.chart_type === 'bar') return 'bar';
    if (metric.chart_type === 'line') return 'area';
    if (metric.chart_type === 'value' || metric.chart_type === 'number') return 'counter';
    if (metric.chart_type === 'progress' || metric.chart_type === 'gauge') return 'donut';
  }

  // 3. Infer from metric properties
  const hasDataPoints = metric.data_points && metric.data_points.length > 0;
  const hasTarget = metric.target_value !== undefined && metric.target_value !== null;
  const hasTrend = metric.trend_direction !== undefined || metric.ytd_change !== undefined;
  const isCumulative = metric.is_cumulative;

  // If we have time series data, prefer charts
  if (hasDataPoints) {
    if (metric.data_points!.length >= 4) {
      return isCumulative ? 'area' : 'bar';
    }
    return 'grouped-bar';
  }

  // If we have a target, show progress
  if (hasTarget) {
    // For rich variant, show trend if we have change data
    if (variant === 'rich' && hasTrend) {
      return 'trend';
    }
    return 'donut';
  }

  // If we have trend data, show trend
  if (hasTrend) {
    return 'trend';
  }

  // 4. Default based on variant
  if (variant === 'rich') return 'trend';
  if (variant === 'compact') return 'counter';

  return 'default';
}
