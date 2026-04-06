import { MaterialIcon } from './MaterialIcon';

export interface GoalKpiPanelProps {
  value: number;
  unit?: string;
  total?: number;
  totalLabel?: string;
  statusLabel?: string;
  statusColor?: string; // tailwind color class
  trend?: { delta: number; direction: 'up' | 'down' | 'flat'; label?: string };
  target?: number;
  baseline?: number;
  forecast?: string;
}

export function GoalKpiPanel({
  value,
  unit = '%',
  total,
  totalLabel,
  statusLabel,
  statusColor = 'text-md3-secondary bg-md3-secondary/5',
  trend,
  target,
  baseline,
  forecast,
}: GoalKpiPanelProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-md3-outline-variant/15 bg-md3-surface-lowest p-5 sm:p-8">
      <div>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-md3-on-surface-variant sm:text-xs">
            {total != null ? 'Completion' : 'Current Status'}
          </span>
          {statusLabel && (
            <span className={`flex w-fit items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold ${statusColor}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {/* Big Number */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums tracking-tighter text-md3-on-surface sm:text-6xl">
              {value}
            </span>
            {total != null ? (
              <span className="text-lg font-bold text-md3-on-surface-variant sm:text-2xl">
                of {total} {totalLabel || unit}
              </span>
            ) : (
              <span className="text-lg font-bold text-md3-on-surface-variant sm:text-2xl">{unit}</span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className="mt-4 flex items-center gap-3">
              <span className={`flex flex-wrap items-center text-sm font-bold px-2 py-0.5 rounded ${
                trend.direction === 'up' ? 'text-md3-secondary bg-md3-secondary/10' :
                trend.direction === 'down' ? 'text-md3-error bg-md3-error/10' :
                'text-slate-500 bg-slate-100'
              }`}>
                <MaterialIcon icon={trend.direction === 'up' ? 'trending_up' : trend.direction === 'down' ? 'trending_down' : 'trending_flat'} size={16} className="mr-1" />
                {trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : ''} {Math.abs(trend.delta).toFixed(1)}% {trend.label || 'from baseline'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Target / Baseline rows */}
      <div>
        {(target != null || baseline != null) && (
          <div className="space-y-5 border-t border-md3-outline-variant/10 pt-6 sm:space-y-6 sm:pt-8">
            {target != null && (
              <div className="flex flex-col gap-1 border-b border-md3-outline-variant/10 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-md3-on-surface-variant">
                  {new Date().getFullYear()} Target
                </span>
                <span className="text-lg font-bold text-md3-on-surface tabular-nums">
                  {target}{unit === '%' ? '%' : ` ${unit}`}
                </span>
              </div>
            )}
            {baseline != null && (
              <div className="flex flex-col gap-1 border-b border-md3-outline-variant/10 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-md3-on-surface-variant">Baseline</span>
                <span className="text-lg font-bold text-md3-on-surface tabular-nums">
                  {baseline}{unit === '%' ? '%' : ` ${unit}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Forecast */}
        {forecast && (
          <div className="mt-6 rounded-xl border border-md3-outline-variant/10 bg-md3-surface-low p-4 sm:mt-8">
            <p className="text-[10px] font-bold text-md3-outline uppercase tracking-widest mb-1">Forecast</p>
            <p className="text-xs text-md3-on-surface-variant leading-relaxed">{forecast}</p>
          </div>
        )}
      </div>
    </div>
  );
}
