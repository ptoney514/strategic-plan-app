import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';

interface BarChartWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];

export function BarChartWidget({ config }: BarChartWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const legendLabels = config.legend ?? [];
  const colors = config.colors ?? DEFAULT_COLORS;

  // Determine the number of series from the first dataPoint with values
  const firstWithValues = dataPoints.find((dp) => dp.values && dp.values.length > 0);
  const seriesCount = firstWithValues?.values?.length ?? 1;

  // Transform data for Recharts
  const chartData = dataPoints.map((dp) => {
    const entry: Record<string, string | number> = { label: dp.label };
    if (dp.values) {
      dp.values.forEach((v, i) => {
        entry[`series_${i}`] = v;
      });
    } else if (dp.value !== undefined) {
      entry['series_0'] = dp.value;
    }
    return entry;
  });

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--editorial-border, #e5e7eb)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--editorial-text-secondary, #6b7280)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--editorial-text-secondary, #6b7280)' }}
          />
          <Tooltip />
          {legendLabels.length > 0 && <Legend />}
          {Array.from({ length: seriesCount }, (_, i) => (
            <Bar
              key={i}
              dataKey={`series_${i}`}
              name={legendLabels[i] ?? `Series ${i + 1}`}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
