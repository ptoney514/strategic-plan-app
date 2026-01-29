import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ReactNode } from 'react';
import { CustomTooltip } from './CustomTooltip';

// Colors
const ACCENT_COLOR = '#c85a42';
const SECONDARY_COLOR = '#f1f5f9'; // Very light slate for "involved" bars

interface QuarterData {
  quarter: string;
  primary: number;
  secondary: number;
}

interface QuarterlyComparisonCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  data: QuarterData[];
  primaryLabel: string; // e.g., "Students Involved"
  secondaryLabel: string; // e.g., "Students Placed"
  summaryLabel?: string; // e.g., "Conversion Rate"
  summaryValue?: string; // e.g., "20.8%"
  enableAnimations?: boolean;
  animationDelay?: number;
  darkMode?: boolean;
  accentColor?: string;
}

/**
 * QuarterlyComparisonCard - Grouped bar chart comparing two metrics across quarters
 * Features:
 * - Grouped bar chart with 4 quarters (Q1-Q4)
 * - Two bar series with rounded tops
 * - Dashed horizontal grid lines
 * - Hover state with subtle background highlight
 * - Polished tooltip with colored dots
 * - Recharts Legend with circle icons
 * - Summary footer with accent-tinted background
 * - Smooth animations
 */
export function QuarterlyComparisonCard({
  title,
  subtitle,
  icon,
  data,
  primaryLabel,
  secondaryLabel,
  summaryLabel,
  summaryValue,
  enableAnimations = true,
  animationDelay = 0,
  darkMode = false,
  accentColor = ACCENT_COLOR,
}: QuarterlyComparisonCardProps) {
  const cardClasses = darkMode
    ? 'bg-white/10 backdrop-blur-sm border-white/20'
    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';

  const titleClasses = darkMode
    ? 'text-white'
    : 'text-slate-900 dark:text-slate-100';

  const subtitleClasses = darkMode
    ? 'text-white/70'
    : 'text-slate-500 dark:text-slate-400';

  const axisColor = darkMode ? 'rgba(255,255,255,0.5)' : '#64748b';
  const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9';

  // Calculate max value for Y-axis domain (round up to nice number)
  const maxValue = Math.max(...data.map((d) => Math.max(d.primary, d.secondary)));
  const yAxisMax = Math.ceil(maxValue / 80) * 80;
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => (yAxisMax / 4) * i);

  // Transform data for Recharts Legend to use proper names
  const chartData = data.map((d) => ({
    quarter: d.quarter,
    [primaryLabel]: d.primary,
    [secondaryLabel]: d.secondary,
  }));

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay / 1000 }}
      className={`rounded-2xl border shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ${cardClasses}`}
    >
      {/* Main content area */}
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${titleClasses}`}>{title}</h3>
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
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <div style={{ color: accentColor }}>{icon}</div>
            </motion.div>
          )}
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
              barCategoryGap="25%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="quarter"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
                domain={[0, yAxisMax]}
                ticks={yAxisTicks}
                width={45}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={<CustomTooltip />}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              {/* Primary bars (very light gray - "Involved") */}
              <Bar
                dataKey={primaryLabel}
                name={primaryLabel}
                fill={SECONDARY_COLOR}
                radius={[4, 4, 0, 0]}
                barSize={40}
                animationBegin={enableAnimations ? animationDelay : 0}
                animationDuration={enableAnimations ? 1000 : 0}
                animationEasing="ease-out"
              />
              {/* Secondary bars (coral - "Placed") */}
              <Bar
                dataKey={secondaryLabel}
                name={secondaryLabel}
                fill={accentColor}
                radius={[4, 4, 0, 0]}
                barSize={40}
                animationBegin={enableAnimations ? animationDelay + 200 : 0}
                animationDuration={enableAnimations ? 1000 : 0}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Footer */}
      {summaryLabel && summaryValue && (
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (animationDelay / 1000) + 0.8 }}
          className="px-8 py-5 flex items-center justify-between"
          style={{
            backgroundColor: darkMode ? `${accentColor}20` : `${accentColor}08`,
          }}
        >
          <span
            className="text-base font-semibold"
            style={{ color: accentColor }}
          >
            {summaryLabel}
          </span>
          <span
            className="text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {summaryValue}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
