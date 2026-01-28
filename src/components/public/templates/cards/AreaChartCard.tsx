import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Metric, TimeSeriesDataPoint, DataPoint } from '../../../../lib/types';

interface AreaChartCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
}

/**
 * AreaChartCard - Cumulative tracking with area chart
 * Features:
 * - Multi-point area chart with gradient fill
 * - Optional target line
 * - Responsive with tooltip
 */
export function AreaChartCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
}: AreaChartCardProps) {
  // Transform metric data to chart format
  const chartData = (() => {
    if (metric.data_points && Array.isArray(metric.data_points) && metric.data_points.length > 0) {
      const firstPoint = metric.data_points[0];
      if ('date' in firstPoint) {
        return (metric.data_points as TimeSeriesDataPoint[]).map(dp => ({
          name: new Date(dp.date).toLocaleDateString('en-US', { month: 'short' }),
          value: dp.value,
          target: dp.target,
        }));
      }
      return (metric.data_points as DataPoint[]).map(dp => ({
        name: dp.label,
        value: dp.value,
      }));
    }
    // Generate sample data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = (metric.current_value ?? metric.actual_value ?? 100) * 0.7;
    return months.map((month, i) => ({
      name: month,
      value: Math.round(baseValue + (baseValue * 0.3 * i / 5) + Math.random() * baseValue * 0.1),
    }));
  })();

  const primaryColor = darkMode ? '#60a5fa' : '#3b82f6';
  const gradientId = `areaGradient-${metric.id}`;

  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const axisColor = darkMode ? 'rgba(255,255,255,0.3)' : '#94a3b8';
  const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-xl border p-6 ${cardClasses}`}
    >
      <h3 className={`text-sm font-medium mb-4 ${titleClasses}`}>
        {metric.metric_name || metric.name}
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1e293b' : '#fff',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: darkMode ? '#e2e8f0' : '#1e293b',
              }}
            />
            {metric.target_value && (
              <ReferenceLine
                y={metric.target_value}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'Target',
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'right',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationBegin={enableAnimations ? animationDelay : 0}
              animationDuration={enableAnimations ? 1500 : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {metric.description && (
        <p className={`mt-2 text-xs ${titleClasses}`}>
          {metric.description}
        </p>
      )}
    </motion.div>
  );
}
