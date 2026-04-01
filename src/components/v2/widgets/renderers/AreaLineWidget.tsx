import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';
import { ChartTooltip } from '../ChartTooltip';

interface AreaLineWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

export function AreaLineWidget({ config }: AreaLineWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const accentColor = config.colors?.[0] ?? 'var(--editorial-accent-primary, #6366f1)';

  const chartData = dataPoints.map((dp) => ({
    label: dp.label,
    value: dp.value ?? 0,
  }));

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.12} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#f0eee9"
            strokeWidth={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#b0b0b0' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#b0b0b0' }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />
          <Tooltip content={<ChartTooltip />} />
          {config.target !== undefined && (
            <ReferenceLine
              y={config.target}
              stroke={accentColor}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={accentColor}
            fill="url(#areaGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
