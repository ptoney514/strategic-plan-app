import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';

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
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--editorial-border, #e5e7eb)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--editorial-text-secondary, #6b7280)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--editorial-text-secondary, #6b7280)' }}
          />
          <Tooltip />
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
