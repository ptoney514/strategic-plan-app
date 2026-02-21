import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { Metric } from '../../../../lib/types';
import type { ReactNode } from 'react';
import { AnimatedCounter } from '../../../common/AnimatedCounter';
import { safeNumber } from '../../../../lib/utils/safeNumber';

export type DonutStyleVariant = 'classic' | 'achievement';

interface DonutProgressCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
  /** Style variant: 'classic' (progress colors) or 'achievement' (fixed accent color with icon) */
  styleVariant?: DonutStyleVariant;
  /** Optional icon for achievement style (displayed in top-right corner) */
  icon?: ReactNode;
  /** Custom accent color (defaults vary by style) */
  accentColor?: string;
}

/**
 * DonutProgressCard - Progress toward goal with donut chart
 * Features:
 * - Animated donut/ring chart
 * - Center value display
 * - Percentage to goal calculation
 */
// Default accent color for achievement style (coral/terra cotta)
const ACHIEVEMENT_DEFAULT_COLOR = '#c85a42';

export function DonutProgressCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
  styleVariant = 'classic',
  icon,
  accentColor,
}: DonutProgressCardProps) {
  const currentValue = safeNumber(metric.current_value ?? metric.actual_value ?? 0);
  const targetValue = safeNumber(metric.target_value ?? 100);
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const remaining = Math.max(100 - progress, 0);

  const data = [
    { name: 'Progress', value: progress },
    { name: 'Remaining', value: remaining },
  ];

  // Get colors based on progress (classic style only)
  const getProgressColor = () => {
    if (styleVariant === 'achievement') {
      return accentColor || ACHIEVEMENT_DEFAULT_COLOR;
    }
    // Classic style: progress-based colors
    if (progress >= 90) return '#10b981'; // emerald-500
    if (progress >= 70) return '#22c55e'; // green-500
    if (progress >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const progressColor = getProgressColor();
  const remainingColor = darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9';

  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const valueClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  // Achievement style has shadow with hover effect
  const hoverClasses = styleVariant === 'achievement'
    ? 'shadow-sm hover:shadow-md transition-shadow duration-300'
    : '';

  // Ring dimensions vary by style
  const innerRadius = styleVariant === 'achievement' ? 50 : 45;
  const outerRadius = styleVariant === 'achievement' ? 70 : 60;
  const chartHeight = styleVariant === 'achievement' ? 'h-40' : 'h-36';

  // Data for RadialBarChart (achievement style)
  const radialData = [
    { name: 'Progress', value: currentValue, fill: progressColor }
  ];

  // Render achievement-style layout with RadialBarChart
  if (styleVariant === 'achievement') {
    return (
      <motion.div
        initial={enableAnimations ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: animationDelay / 1000 }}
        className={`rounded-xl border p-6 ${cardClasses} ${hoverClasses}`}
      >
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={`text-lg font-bold ${valueClasses}`}>
              {metric.metric_name || metric.name}
            </h3>
            <p className={`text-sm ${titleClasses}`}>
              Target: {targetValue.toLocaleString()} {metric.unit}
            </p>
          </div>
          {icon && (
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${progressColor}15` }}
            >
              <div style={{ color: progressColor }}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Chart with center content - RadialBarChart with rounded corners */}
        <div className={`relative ${chartHeight}`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              barSize={15}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, targetValue]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: remainingColor }}
                dataKey="value"
                cornerRadius={10}
                animationBegin={enableAnimations ? animationDelay : 0}
                animationDuration={enableAnimations ? 1000 : 0}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center content for achievement style */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {enableAnimations ? (
              <AnimatedCounter
                value={currentValue}
                className={`text-2xl font-bold ${valueClasses}`}
              />
            ) : (
              <span className={`text-2xl font-bold ${valueClasses}`}>
                {currentValue.toLocaleString()}
              </span>
            )}
            <div className="mt-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {progress.toFixed(0)}% to Goal
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Classic style (original layout)
  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-xl border p-6 ${cardClasses}`}
    >
      <h3 className={`text-sm font-medium mb-4 ${titleClasses}`}>
        {metric.metric_name || metric.name}
      </h3>

      <div className={`relative ${chartHeight}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              animationBegin={enableAnimations ? animationDelay : 0}
              animationDuration={enableAnimations ? 1000 : 0}
            >
              <Cell fill={progressColor} />
              <Cell fill={remainingColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${valueClasses}`}>
            {progress.toFixed(0)}%
          </span>
          <span className={`text-xs ${titleClasses}`}>
            of goal
          </span>
        </div>
      </div>

      <div className={`mt-2 text-center text-sm ${titleClasses}`}>
        <span className={valueClasses}>{currentValue.toLocaleString()}</span>
        {' / '}
        <span>{targetValue.toLocaleString()}</span>
        {metric.unit && <span className="ml-1">{metric.unit}</span>}
      </div>
    </motion.div>
  );
}
