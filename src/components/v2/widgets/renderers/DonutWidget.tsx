import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WidgetConfig } from '../../../../lib/types/v2';

interface DonutWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

/**
 * Shadcn-style donut:
 * - Thick ring, rounded segment cap, track color softly muted
 * - Big centered tabular number + caption line
 * - Optional trend row below the chart ("Trending up 5.2% this month ↗")
 * - Accent color read from config.colors[0] or falls back to primary CSS var
 */
export function DonutWidget({ config }: DonutWidgetProps) {
  const value = config.value ?? 0;
  const target = config.target ?? 100;
  const progressPct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const remainingPct = Math.max(100 - progressPct, 0);
  const label = config.label ?? 'of goal';
  const unit = config.unit ?? '';
  const accent = config.colors?.[0] ?? 'var(--color-md3-primary)';
  const trendDirection = config.trendDirection;
  const trendText = config.trend;

  const data = [
    { name: 'progress', value: progressPct },
    { name: 'remaining', value: remainingPct },
  ];

  const TrendIcon =
    trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendClasses =
    trendDirection === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trendDirection === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-md3-on-surface-variant';

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="95%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
              paddingAngle={progressPct > 0 && progressPct < 100 ? 2 : 0}
              isAnimationActive
            >
              <Cell fill={accent} />
              <Cell fill="var(--color-md3-surface-container)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums tracking-tight text-md3-on-surface">
            {value.toLocaleString()}
            {unit === '%' && <span className="text-2xl font-bold">%</span>}
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-md3-on-surface-variant">
            {label}
          </span>
        </div>
      </div>

      {(trendText || target > 0) && (
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          {trendText && (
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${trendClasses}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendText}</span>
            </div>
          )}
          <p className="text-xs text-md3-on-surface-variant">
            <span className="font-semibold tabular-nums text-md3-on-surface">
              {value.toLocaleString()}
              {unit && unit !== '%' ? ` ${unit}` : unit === '%' ? '%' : ''}
            </span>
            <span className="mx-1.5 text-md3-outline">/</span>
            <span className="tabular-nums">
              {target.toLocaleString()}
              {unit && unit !== '%' ? ` ${unit}` : unit === '%' ? '%' : ''}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
