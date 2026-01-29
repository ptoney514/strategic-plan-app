import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Metric, DataPoint } from '../../../../lib/types';
import type { ReactNode } from 'react';
import { AnimatedCounter } from '../../../common/AnimatedCounter';
import { CustomTooltip } from './CustomTooltip';

interface CategoryBreakdownCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
  icon?: ReactNode;
  subtitle?: string;
  centerLabel?: string; // e.g., "TOTAL VISITS"
}

// Primary accent color (coral)
const ACCENT_COLOR = '#c85a42';

/**
 * CategoryBreakdownCard - Wide card with donut chart and side legend
 * Features:
 * - 2-column layout (donut left, legend right)
 * - Donut chart with gap between segments (paddingAngle)
 * - Center display showing total value + accent-colored label
 * - Legend rows with subtle card backgrounds
 * - Slide-up entrance animation
 */
export function CategoryBreakdownCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
  icon,
  subtitle,
  centerLabel = 'TOTAL',
}: CategoryBreakdownCardProps) {
  // Extract data points from metric
  const dataPoints = (metric.data_points as DataPoint[]) || [];

  // Calculate total from data points or use current_value
  const total = metric.current_value ?? dataPoints.reduce((sum, dp) => sum + dp.value, 0);

  // Get primary color from first data point for accents
  const primaryColor = dataPoints[0]?.color || ACCENT_COLOR;

  // Prepare chart data
  const chartData = dataPoints.map((dp) => ({
    name: dp.label,
    value: dp.value,
    color: dp.color || '#1e293b',
    description: dp.description,
  }));

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

  const descriptionClasses = darkMode
    ? 'text-white/50'
    : 'text-slate-400 dark:text-slate-500';

  const legendCardClasses = darkMode
    ? 'bg-white/5'
    : 'bg-slate-50 dark:bg-slate-700/50';

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-2xl border p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 ${cardClasses}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className={`text-xl font-bold ${titleClasses}`}>
            {metric.metric_name || metric.name}
          </h3>
          {subtitle && (
            <p className={`text-sm mt-1 ${subtitleClasses}`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <motion.div
            initial={enableAnimations ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: (animationDelay / 1000) + 0.2 }}
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <div style={{ color: primaryColor }}>
              {icon}
            </div>
          </motion.div>
        )}
      </div>

      {/* Content: Donut + Legend */}
      <div className="flex items-center gap-10">
        {/* Donut Chart - Larger size */}
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={85}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
                animationBegin={enableAnimations ? animationDelay : 0}
                animationDuration={enableAnimations ? 1200 : 0}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {enableAnimations ? (
              <AnimatedCounter
                value={total}
                className={`text-4xl font-bold ${valueClasses}`}
              />
            ) : (
              <span className={`text-4xl font-bold ${valueClasses}`}>
                {total.toLocaleString()}
              </span>
            )}
            <span
              className="text-xs font-semibold tracking-wider uppercase mt-1"
              style={{ color: primaryColor }}
            >
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend with card backgrounds */}
        <div className="flex-1 space-y-4">
          {chartData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={enableAnimations ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: enableAnimations ? (animationDelay / 1000) + 0.3 + (index * 0.15) : 0,
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${legendCardClasses}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <span className={`text-sm font-semibold block ${valueClasses}`}>
                    {item.name}
                  </span>
                  {item.description && (
                    <p className={`text-xs ${descriptionClasses}`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-xl font-bold ml-4 flex-shrink-0 ${valueClasses}`}>
                {item.value.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
