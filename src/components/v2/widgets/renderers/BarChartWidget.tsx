import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';
import { ChartTooltip } from '../ChartTooltip';

interface BarChartWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

const FALLBACK_COLORS = [
  'var(--color-md3-primary)',
  'var(--color-md3-secondary)',
  'var(--color-md3-tertiary)',
  'var(--color-md3-primary-fixed-dim)',
];

/**
 * Shadcn-style bar chart:
 * - Gradient-filled bars, rounded top corners
 * - Minimal axes, dashed horizontal grid
 * - Dashed target reference line with inline label
 * - Highlights the most recent bar (full saturation) when single-series
 */
export function BarChartWidget({ config }: BarChartWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const legendLabels = config.legend ?? [];
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

  const showLegend = seriesCount > 1 && legendLabels.length >= 2;
  const lastIdx = chartData.length - 1;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {Array.from({ length: seriesCount }, (_, i) => (
              <linearGradient
                key={i}
                id={`bar-gradient-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={1} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.55} />
              </linearGradient>
            ))}
            <linearGradient id="bar-gradient-muted" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors[0 % colors.length]}
                stopOpacity={0.5}
              />
              <stop
                offset="100%"
                stopColor={colors[0 % colors.length]}
                stopOpacity={0.2}
              />
            </linearGradient>
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
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-md3-on-surface-variant)' }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
            width={36}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-md3-outline-variant)', fillOpacity: 0.08 }}
            content={<ChartTooltip unit={unit} showSeriesNames={seriesCount > 1} />}
          />
          {config.target !== undefined && (
            <ReferenceLine
              y={config.target}
              stroke="var(--color-md3-on-surface-variant)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: `Target ${config.target}${unit ?? ''}`,
                position: 'insideTopRight',
                fill: 'var(--color-md3-on-surface-variant)',
                fontSize: 10,
              }}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          )}
          {Array.from({ length: seriesCount }, (_, i) => (
            <Bar
              key={i}
              dataKey={`series_${i}`}
              name={legendLabels[i] ?? `Series ${i + 1}`}
              fill={`url(#bar-gradient-${i})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
            >
              {seriesCount === 1 &&
                chartData.map((_, cellIdx) => (
                  <Cell
                    key={cellIdx}
                    fill={
                      cellIdx === lastIdx ? `url(#bar-gradient-${i})` : 'url(#bar-gradient-muted)'
                    }
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
