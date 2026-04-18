import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface GoalKpiPanelV2Props {
  value: number;
  unit?: string;
  /** When set, the header reads "Completion" and the value is shown as "X of TOTAL unit". */
  total?: number;
  totalLabel?: string;
  statusLabel?: string;
  /**
   * Tailwind text/bg color classes describing the status pill.
   * Example: "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10"
   */
  statusColor?: string;
  trend?: { delta: number; direction: 'up' | 'down' | 'flat'; label?: string };
  target?: number;
  baseline?: number;
  forecast?: string;
}

/**
 * Shadcn-style KPI panel for goal detail pages.
 *
 * Layout:
 *   [ STATUS chip                                         CURRENT / COMPLETION ]
 *
 *                   88      ← huge tabular number with unit suffix
 *                   %
 *
 *   ↗ +7.0%  from baseline (65%)    ← trend pill, color by direction
 *
 *   ─────────────────────────────────────
 *   Target       Baseline
 *   85%          65%                ← 2-column stat grid
 *   ─────────────────────────────────────
 *   FORECAST
 *   Off Track — projected to miss target by ...  ← optional callout
 *
 * Prop contract matches GoalKpiPanel v1 so GoalDetailView can swap it in as-is.
 */
export function GoalKpiPanelV2({
  value,
  unit = '%',
  total,
  totalLabel,
  statusLabel,
  statusColor = 'text-md3-secondary bg-md3-secondary/10 dark:bg-md3-secondary/15',
  trend,
  target,
  baseline,
  forecast,
}: GoalKpiPanelV2Props) {
  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  const trendTone =
    trend?.direction === 'up'
      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300'
      : trend?.direction === 'down'
        ? 'text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300'
        : 'text-slate-600 bg-slate-100 dark:bg-slate-500/10 dark:text-slate-300';

  const showStatGrid = target != null || baseline != null;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-md3-outline-variant/25 bg-md3-surface-lowest p-6 shadow-sm sm:p-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-md3-on-surface-variant">
          {total != null ? 'Completion' : 'Current'}
        </span>
        {statusLabel && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColor}`}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* Big value */}
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-6xl font-black tabular-nums leading-none tracking-tight text-md3-on-surface sm:text-7xl">
          {value.toLocaleString()}
        </span>
        {total != null ? (
          <span className="text-lg font-semibold text-md3-on-surface-variant">
            of {total.toLocaleString()} {totalLabel ?? unit}
          </span>
        ) : (
          <span className="text-2xl font-bold text-md3-on-surface-variant">{unit}</span>
        )}
      </div>

      {/* Trend pill */}
      {trend && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${trendTone}`}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular-nums">
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '−' : ''}
              {Math.abs(trend.delta).toFixed(1)}%
            </span>
            {trend.label && (
              <span className="font-normal opacity-80"> {trend.label}</span>
            )}
          </span>
        </div>
      )}

      {/* Stat grid */}
      {showStatGrid && (
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-md3-outline-variant/20 pt-6">
          {target != null && (
            <div className="rounded-lg bg-md3-surface-container/40 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-md3-on-surface-variant">
                {new Date().getFullYear()} Target
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-md3-on-surface">
                {target.toLocaleString()}
                {unit === '%' ? '%' : unit ? <span className="ml-1 text-sm font-semibold text-md3-on-surface-variant">{unit}</span> : null}
              </p>
            </div>
          )}
          {baseline != null && (
            <div className="rounded-lg bg-md3-surface-container/40 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-md3-on-surface-variant">
                Baseline
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-md3-on-surface">
                {baseline.toLocaleString()}
                {unit === '%' ? '%' : unit ? <span className="ml-1 text-sm font-semibold text-md3-on-surface-variant">{unit}</span> : null}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Forecast */}
      {forecast && (
        <div className="mt-5 rounded-lg border border-md3-outline-variant/25 bg-md3-surface-low p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-md3-on-surface-variant">
            Forecast
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-md3-on-surface-variant">{forecast}</p>
        </div>
      )}
    </div>
  );
}
