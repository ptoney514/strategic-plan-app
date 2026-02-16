import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Goal } from '../../../lib/types';

interface GoalProgressChartProps {
  goals: Goal[];
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  const level0Goals = goals.filter((g) => g.level === 0);

  if (level0Goals.length === 0) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <h3
          className="text-lg font-medium mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
        >
          Objective Progress
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            No objectives to display yet.
          </p>
        </div>
      </div>
    );
  }

  const data = level0Goals.map((goal) => ({
    name: goal.title.length > 25 ? goal.title.slice(0, 25) + '...' : goal.title,
    progress: goal.overall_progress ?? 0,
    fullTitle: goal.title,
  }));

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <h3
        className="text-lg font-medium mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
      >
        Objective Progress
      </h3>
      <div style={{ width: '100%', height: Math.max(200, level0Goals.length * 48) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              fontSize={12}
              tick={{ fill: 'var(--editorial-text-secondary)' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Progress']}
              labelFormatter={(_label: string, payload: readonly unknown[]) => {
                const first = payload?.[0] as { payload?: { fullTitle?: string } } | undefined;
                return first?.payload?.fullTitle ?? _label;
              }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--editorial-border)',
                fontSize: 13,
              }}
            />
            <Bar dataKey="progress" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((_entry, index) => (
                <Cell key={index} fill={index % 2 === 0 ? '#2d8282' : '#3a9e9e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
