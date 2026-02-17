import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Metric } from '../../../../lib/types';
import { safeNumber } from '../../../../lib/utils/safeNumber';

interface AnimatedCounterCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
}

/**
 * AnimatedCounterCard - Big number display with animated counting
 * Features:
 * - Animated number counting from 0 to target
 * - Trend indicator (up/down/stable)
 * - Configurable units and formatting
 */
export function AnimatedCounterCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
}: AnimatedCounterCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const targetValue = safeNumber(metric.current_value ?? metric.actual_value ?? 0);
  const unit = metric.unit || '';
  const isPercentage = metric.is_percentage || unit === '%';

  // Format the display value
  const formatValue = (value: number) => {
    if (isPercentage) {
      return `${value.toFixed(metric.decimal_places ?? 0)}%`;
    }
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
    return value.toFixed(metric.decimal_places ?? 0);
  };

  // Animate counting effect
  useEffect(() => {
    if (!enableAnimations) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds
    const startDelay = animationDelay;

    const animate = () => {
      const elapsed = Date.now() - startTime - startDelay;
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(targetValue * easeOut);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, enableAnimations, animationDelay]);

  // Determine trend
  const getTrend = () => {
    if (metric.trend_direction === 'improving') return 'up';
    if (metric.trend_direction === 'declining') return 'down';
    if (metric.ytd_change !== undefined) {
      if (metric.ytd_change > 0) return 'up';
      if (metric.ytd_change < 0) return 'down';
    }
    return 'stable';
  };

  const trend = getTrend();
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up'
    ? (metric.is_higher_better !== false ? 'text-emerald-500' : 'text-red-500')
    : trend === 'down'
    ? (metric.is_higher_better !== false ? 'text-red-500' : 'text-emerald-500')
    : 'text-slate-400';

  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const valueClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-xl border p-6 ${cardClasses}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-sm font-medium ${titleClasses}`}>
          {metric.metric_name || metric.name}
        </h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          {metric.ytd_change !== undefined && (
            <span className="text-xs font-medium">
              {metric.ytd_change > 0 ? '+' : ''}{safeNumber(metric.ytd_change).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div className={`text-4xl font-bold tracking-tight ${valueClasses}`}>
        {formatValue(displayValue)}
        {!isPercentage && unit && (
          <span className="text-xl font-normal ml-1 text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {metric.target_value !== undefined && (
        <div className={`mt-2 text-sm ${titleClasses}`}>
          Target: {formatValue(metric.target_value)}
        </div>
      )}
    </motion.div>
  );
}
