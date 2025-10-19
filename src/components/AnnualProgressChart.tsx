import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AnnualProgressData {
  year: string;
  value: number;
  target?: number;
}

interface AnnualProgressChartProps {
  data: AnnualProgressData[];
  title?: string;
  description?: string;
  unit?: string;
}

export function AnnualProgressChart({ data, title, description, unit = '' }: AnnualProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-neutral-500">No annual progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && <h4 className="font-semibold text-neutral-900">{title}</h4>}
      {description && <p className="text-sm text-neutral-600">{description}</p>}

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
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#d1d5db' }}
              label={{ value: unit, angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
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
              formatter={(value: number) => [`${value}${unit}`, 'Value']}
            />
            {data.some(d => d.target) && (
              <ReferenceLine
                y={data[0]?.target}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: 'Target', position: 'right', fill: '#10b981', fontSize: 12 }}
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
