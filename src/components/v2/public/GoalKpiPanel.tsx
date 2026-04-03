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
    <div className="bg-md3-surface-lowest p-8 rounded-xl border border-md3-outline-variant/15 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-md3-on-surface-variant">
            {total != null ? 'Completion' : 'Current Status'}
          </span>
          {statusLabel && (
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded ${statusColor}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {/* Big Number */}
        <div className="mb-10">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-md3-on-surface">
              {value}
            </span>
            {total != null ? (
              <span className="text-2xl font-bold text-md3-on-surface-variant">
                of {total} {totalLabel || unit}
              </span>
            ) : (
              <span className="text-2xl font-bold text-md3-on-surface-variant">{unit}</span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className="mt-4 flex items-center gap-3">
              <span className={`flex items-center text-sm font-bold px-2 py-0.5 rounded ${
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
          <div className="space-y-6 pt-8 border-t border-md3-outline-variant/10">
            {target != null && (
              <div className="flex justify-between items-center py-3 border-b border-md3-outline-variant/10">
                <span className="text-sm font-medium text-md3-on-surface-variant">
                  {new Date().getFullYear()} Target
                </span>
                <span className="text-lg font-bold text-md3-on-surface tabular-nums">
                  {target}{unit === '%' ? '%' : ` ${unit}`}
                </span>
              </div>
            )}
            {baseline != null && (
              <div className="flex justify-between items-center py-3 border-b border-md3-outline-variant/10">
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
          <div className="mt-8 p-4 rounded-lg bg-md3-surface-low border border-md3-outline-variant/10">
            <p className="text-[10px] font-bold text-md3-outline uppercase tracking-widest mb-1">Forecast</p>
            <p className="text-xs text-md3-on-surface-variant leading-relaxed">{forecast}</p>
          </div>
        )}
      </div>
    </div>
  );
}
