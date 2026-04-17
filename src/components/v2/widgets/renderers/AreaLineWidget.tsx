import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';
import { ChartTooltip } from '../ChartTooltip';

interface AreaLineWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

const FALLBACK_COLORS = [
  'var(--color-md3-primary)',
  'var(--color-md3-secondary)',
  'var(--color-md3-tertiary)',
];

/**
 * Shadcn-style area chart:
 * - Soft gradient fill (top opacity ~0.28, bottom ~0.02)
 * - Horizontal-only grid with very thin lines
 * - Minimal axes (small neutral labels, no axis line/tick marks)
 * - Dashed reference line for target
 * - Supports single OR multi-series via `dataPoints[].values`
 */
export function AreaLineWidget({ config }: AreaLineWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const legend = config.legend ?? [];
  const colors = config.colors ?? FALLBACK_COLORS;
  const unit = config.unit;

  const firstWithValues = dataPoints.find((dp) => dp.values && dp.values.length > 0);
  const seriesCount = firstWithValues?.values?.length ?? 1;

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
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {Array.from({ length: seriesCount }, (_, i) => (
              <linearGradient
                key={i}
                id={`area-gradient-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.28} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            stroke="var(--color-md3-outline-variant)"
            strokeOpacity={0.25}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-md3-on-surface-variant)' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-md3-on-surface-variant)' }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
            width={36}
          />
          <Tooltip
            cursor={{
              stroke: 'var(--color-md3-outline-variant)',
              strokeOpacity: 0.5,
              strokeDasharray: '3 3',
            }}
            content={<ChartTooltip unit={unit} showSeriesNames={seriesCount > 1} />}
          />
          {config.target !== undefined && (
            <ReferenceLine
              y={config.target}
              stroke="var(--color-md3-on-surface-variant)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: `Target ${config.target}${unit ?? ''}`,
                position: 'insideTopRight',
                fill: 'var(--color-md3-on-surface-variant)',
                fontSize: 10,
              }}
            />
          )}
          {seriesCount > 1 && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          )}
          {Array.from({ length: seriesCount }, (_, i) => (
            <Area
              key={i}
              type="monotone"
              dataKey={`series_${i}`}
              name={legend[i] ?? `Series ${i + 1}`}
              stroke={colors[i % colors.length]}
              strokeWidth={2.25}
              fill={`url(#area-gradient-${i})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-md3-surface-lowest)' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
