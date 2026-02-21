import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { Metric, TimeSeriesDataPoint } from '../../../../lib/types';
import { safeNumber } from '../../../../lib/utils/safeNumber';

interface TrendIndicatorCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
}

/**
 * TrendIndicatorCard - Value with change indicator and sparkline
 * Features:
 * - Large current value display
 * - Percentage change from previous period
 * - Subtle sparkline background
 */
export function TrendIndicatorCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
}: TrendIndicatorCardProps) {
  const currentValue = safeNumber(metric.current_value ?? metric.actual_value ?? 0);
  const change = safeNumber(metric.ytd_change ?? 0);
  const isPositive = change > 0;
  const isNegative = change < 0;

  // Determine if positive change is good
  const isGood = metric.is_higher_better !== false ? isPositive : isNegative;
  const isBad = metric.is_higher_better !== false ? isNegative : isPositive;

  // Generate sparkline data from metric data_points or mock it
  const sparklineData = (() => {
    if (metric.data_points && Array.isArray(metric.data_points) && metric.data_points.length > 0) {
      // Check if it's TimeSeriesDataPoint
      const firstPoint = metric.data_points[0];
      if ('date' in firstPoint) {
        return (metric.data_points as TimeSeriesDataPoint[]).map(dp => ({
          value: dp.value,
        }));
      }
      // It's DataPoint
      return metric.data_points.map(dp => ({
        value: dp.value,
      }));
    }
    // Generate mock trend data
    const baseValue = currentValue * 0.8;
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + (currentValue - baseValue) * (i / 6) + Math.random() * currentValue * 0.1,
    }));
  })();

  const formatValue = (value: number) => {
    if (metric.metric_type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: metric.decimal_places ?? 0,
      maximumFractionDigits: metric.decimal_places ?? 0,
    });
  };

  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const valueClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  const changeColorClasses = isGood
    ? 'text-emerald-500 bg-emerald-500/10'
    : isBad
    ? 'text-red-500 bg-red-500/10'
    : 'text-slate-400 bg-slate-400/10';

  const sparklineColor = isGood ? '#10b981' : isBad ? '#ef4444' : '#94a3b8';

  const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-xl border p-6 relative overflow-hidden ${cardClasses}`}
    >
      {/* Sparkline background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparklineColor}
              strokeWidth={1.5}
              fill={`url(#gradient-${metric.id})`}
              animationBegin={enableAnimations ? animationDelay : 0}
              animationDuration={enableAnimations ? 1000 : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`text-sm font-medium ${titleClasses}`}>
            {metric.metric_name || metric.name}
          </h3>
          <TrendIcon className={`h-4 w-4 ${isGood ? 'text-emerald-500' : isBad ? 'text-red-500' : 'text-slate-400'}`} />
        </div>

        <div className={`text-3xl font-bold tracking-tight mb-2 ${valueClasses}`}>
          {formatValue(currentValue)}
          {metric.unit && !metric.is_percentage && (
            <span className="text-lg font-normal ml-1 text-slate-400">
              {metric.unit}
            </span>
          )}
        </div>

        {change !== 0 && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${changeColorClasses}`}>
            <ChangeIcon className="h-3 w-3" />
            {Math.abs(change).toFixed(1)}%
            <span className="text-slate-400 dark:text-slate-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
