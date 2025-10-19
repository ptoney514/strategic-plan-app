import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface LikertScaleData {
  year: string;
  value: number;
  target?: number;
}

interface LikertScaleChartProps {
  data: LikertScaleData[];
  title?: string;
  description?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabel?: string;
  targetValue?: number;
  showAverage?: boolean;
}

export function LikertScaleChart({
  data,
  title,
  description,
  scaleMin = 1,
  scaleMax = 5,
  scaleLabel = '(5 high)',
  targetValue,
  showAverage = true
}: LikertScaleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-neutral-500">No likert scale data available</p>
      </div>
    );
  }

  // Calculate average score
  const average = data.reduce((sum, point) => sum + point.value, 0) / data.length;

  return (
    <div className="space-y-3">
      {title && <h4 className="font-semibold text-neutral-900">{title}</h4>}
      {description && <p className="text-sm text-neutral-600">{description}</p>}

      {showAverage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Average Score</p>
              <p className="text-3xl font-bold text-neutral-900">{average.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Scale: {scaleMin}-{scaleMax} {scaleLabel}
              </p>
            </div>
            {targetValue && (
              <div className="text-right">
                <p className="text-sm text-neutral-600">Target</p>
                <p className="text-2xl font-semibold text-green-600">{targetValue.toFixed(1)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full h-64 bg-white rounded-lg border border-neutral-200 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              domain={[scaleMin, scaleMax]}
              ticks={Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i)}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              formatter={(value: number) => [value.toFixed(2), 'Score']}
            />
            {targetValue && (
              <ReferenceLine
                y={targetValue}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Target: ${targetValue}`,
                  position: 'right',
                  fill: '#10b981',
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
            )}
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
