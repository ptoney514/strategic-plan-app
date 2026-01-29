import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Metric, TimeSeriesDataPoint, DataPoint } from '../../../../lib/types';

interface GroupedBarCardProps {
  metric: Metric;
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
}

/**
 * GroupedBarCard - Period comparison with grouped bars
 * Features:
 * - Quarterly/monthly grouped bars
 * - Actual vs Target comparison
 * - Responsive with legend
 */
export function GroupedBarCard({
  metric,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
}: GroupedBarCardProps) {
  // Transform metric data to chart format
  const chartData = (() => {
    if (metric.data_points && Array.isArray(metric.data_points) && metric.data_points.length > 0) {
      const firstPoint = metric.data_points[0];
      if ('date' in firstPoint) {
        return (metric.data_points as TimeSeriesDataPoint[]).map(dp => ({
          name: new Date(dp.date).toLocaleDateString('en-US', { month: 'short' }),
          actual: dp.value,
          target: dp.target ?? metric.target_value,
        }));
      }
      return (metric.data_points as DataPoint[]).map(dp => ({
        name: dp.label,
        actual: dp.value,
        target: metric.target_value,
      }));
    }
    // Generate sample quarterly data
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const baseValue = (metric.current_value ?? metric.actual_value ?? 100);
    const targetValue = metric.target_value ?? baseValue * 1.1;
    return quarters.map((quarter, i) => ({
      name: quarter,
      actual: Math.round(baseValue * (0.7 + i * 0.1) + Math.random() * baseValue * 0.1),
      target: Math.round(targetValue * (0.8 + i * 0.07)),
    }));
  })();

  const actualColor = darkMode ? '#60a5fa' : '#3b82f6';
  const targetColor = '#10b981';

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
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={2}
          >
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
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconSize={10}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill={actualColor}
              radius={[4, 4, 0, 0]}
              animationBegin={enableAnimations ? animationDelay : 0}
              animationDuration={enableAnimations ? 1000 : 0}
            />
            <Bar
              dataKey="target"
              name="Target"
              fill={targetColor}
              radius={[4, 4, 0, 0]}
              animationBegin={enableAnimations ? animationDelay + 200 : 0}
              animationDuration={enableAnimations ? 1000 : 0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
