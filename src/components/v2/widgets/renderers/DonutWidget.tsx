import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';

interface DonutWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

export function DonutWidget({ config }: DonutWidgetProps) {
  const value = config.value ?? 0;
  const target = config.target ?? 100;
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const remaining = Math.max(100 - progress, 0);
  const label = config.label ?? 'of goal';

  const data = [
    { name: 'Progress', value: progress },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill="var(--editorial-accent-primary, #6366f1)" />
              <Cell fill="var(--editorial-border, #e5e7eb)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {progress.toFixed(0)}%
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--editorial-text-secondary)' }}
          >
            {label}
          </span>
        </div>
      </div>
      <div
        className="mt-2 text-sm text-center"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        <span style={{ color: 'var(--editorial-text-primary)' }}>
          {value.toLocaleString()}
        </span>
        {' / '}
        {target.toLocaleString()}
        {config.unit && <span className="ml-1">{config.unit}</span>}
      </div>
    </div>
  );
}
