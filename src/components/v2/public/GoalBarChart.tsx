'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { WidgetDataPoint } from '@/lib/types/v2';

export interface GoalBarChartProps {
  dataPoints: WidgetDataPoint[];
  targetValue?: number;
  title?: string;
  legendLabel?: string;
}

export function GoalBarChart({
  dataPoints,
  targetValue,
  title = 'Annual Growth',
  legendLabel = 'Value %',
}: GoalBarChartProps) {
  const chartData = dataPoints.map((dp, idx) => ({
    name: dp.label,
    value: dp.value ?? 0,
    isCurrent: idx === dataPoints.length - 1,
  }));

  return (
    <div className="bg-md3-surface-lowest rounded-xl border border-md3-outline-variant/15 p-8 h-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold tracking-tight text-md3-on-surface">{title}</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#702ae1] to-[#b28cff]" />
          <span className="text-[10px] font-bold text-md3-outline uppercase">{legendLabel}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 700, fill: '#68788f' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 700, fill: '#68788f' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, legendLabel]}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
          />
          {targetValue != null && (
            <ReferenceLine
              y={targetValue}
              stroke="#68788f"
              strokeDasharray="6 4"
              label={{ value: `Target: ${targetValue}%`, position: 'right', fontSize: 10, fill: '#68788f' }}
            />
          )}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isCurrent ? '#702ae1' : 'url(#barGradient)'}
                stroke={entry.isCurrent ? '#b28cff' : 'none'}
                strokeWidth={entry.isCurrent ? 2 : 0}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#702ae1" />
              <stop offset="100%" stopColor="#b28cff" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
