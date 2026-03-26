import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { WidgetConfig } from '../../../../lib/types/v2';

interface PieBreakdownWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];

export function PieBreakdownWidget({ config }: PieBreakdownWidgetProps) {
  const items = config.breakdownItems ?? [];

  if (items.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-40 text-sm"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              nameKey="label"
            >
              {items.map((item, i) => (
                <Cell key={i} fill={item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
            />
            <span style={{ color: 'var(--editorial-text-secondary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
