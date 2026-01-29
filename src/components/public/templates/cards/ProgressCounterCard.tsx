import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ProgressCounterCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  value: number;
  trendPercent?: number; // e.g., 12 for +12%
  trendLabel?: string; // e.g., "this month"
  progressPercent: number; // 0-100
  progressLabel?: string; // e.g., "of Annual Capacity reached"
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
  accentColor?: string;
}

// Default accent color (coral/terra cotta)
const DEFAULT_ACCENT_COLOR = '#c85a42';

/**
 * ProgressCounterCard - Big number with trend indicator and progress bar
 * Features:
 * - Large animated counter value
 * - Trend indicator with percentage change
 * - Horizontal progress bar showing capacity/goal progress
 * - Icon with accent-tinted background
 */
export function ProgressCounterCard({
  title,
  subtitle,
  icon,
  value,
  trendPercent,
  trendLabel,
  progressPercent,
  progressLabel,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
  accentColor = DEFAULT_ACCENT_COLOR,
}: ProgressCounterCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Clamp progress to 0-100
  const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);

  // Animate counting effect for the main value
  useEffect(() => {
    if (!enableAnimations) {
      setDisplayValue(value);
      setProgressWidth(clampedProgress);
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
      setDisplayValue(Math.round(value * easeOut));
      setProgressWidth(clampedProgress * easeOut);

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
  }, [value, clampedProgress, enableAnimations, animationDelay]);

  // Determine if trend is positive, negative, or neutral
  const isPositiveTrend = trendPercent !== undefined && trendPercent > 0;
  const isNegativeTrend = trendPercent !== undefined && trendPercent < 0;

  // Style classes based on dark mode
  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  const subtitleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const valueClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  const captionClasses = darkMode
    ? 'text-white/60'
    : 'text-slate-500 dark:text-slate-400';

  // Trend color - green for positive, red for negative
  const trendColorClass = isPositiveTrend
    ? 'text-emerald-500'
    : isNegativeTrend
    ? 'text-red-500'
    : 'text-slate-400';

  const TrendIcon = isPositiveTrend
    ? ArrowUpRight
    : isNegativeTrend
    ? ArrowDownRight
    : null;

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-2xl border p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 ${cardClasses}`}
    >
      {/* Header: Title + Subtitle on left, Icon on right */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${titleClasses}`}>{title}</h3>
          {subtitle && (
            <p className={`text-sm ${subtitleClasses}`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
        )}
      </div>

      {/* Large Counter Value */}
      <div className={`text-5xl font-bold tracking-tight mb-2 ${valueClasses}`}>
        {displayValue.toLocaleString()}
      </div>

      {/* Trend Indicator */}
      {trendPercent !== undefined && (
        <div className={`flex items-center gap-1 mb-6 ${trendColorClass}`}>
          {TrendIcon && <TrendIcon className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {isPositiveTrend ? '+' : ''}
            {trendPercent}%
            {trendLabel && (
              <span className={`ml-1 ${captionClasses}`}>{trendLabel}</span>
            )}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-slate-800 dark:bg-slate-200"
            initial={enableAnimations ? { width: 0 } : false}
            animate={{ width: `${progressWidth}%` }}
            transition={{
              duration: 1.5,
              delay: animationDelay / 1000,
              ease: [0.33, 1, 0.68, 1], // ease-out cubic
            }}
          />
        </div>

        {/* Progress Caption */}
        <p className={`mt-2 text-sm ${captionClasses}`}>
          {Math.round(progressWidth)}%{progressLabel && ` ${progressLabel}`}
        </p>
      </div>
    </motion.div>
  );
}
