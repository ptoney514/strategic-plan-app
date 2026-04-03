import { MaterialIcon } from './MaterialIcon';
import { statusBadgeClasses, statusBadgeLabel } from '@/lib/utils/goalHealth';

export interface GoalMetricCardProps {
  goalNumber: string;
  title: string;
  status?: string;
  currentScore?: number;
  unit?: string;
  trendDelta?: number;
  trendDirection?: 'up' | 'down' | 'flat';
  target?: number;
  progressPercent?: number;
  onClick?: () => void;
}

function trendColor(direction?: string): string {
  if (direction === 'up') return 'bg-emerald-50 text-emerald-600';
  if (direction === 'down') return 'bg-red-50 text-red-600';
  return 'bg-slate-100 text-slate-500';
}

function trendIcon(direction?: string): string {
  if (direction === 'up') return 'arrow_upward';
  if (direction === 'down') return 'arrow_downward';
  return 'horizontal_rule';
}

function progressBarColor(status?: string): string {
  switch (status?.toLowerCase().replace(/\s+/g, '_')) {
    case 'on_target':
    case 'on target':
    case 'exceeding':
    case 'completed':
      return 'bg-emerald-500';
    case 'at_risk':
    case 'at risk':
    case 'in_progress':
    case 'in progress':
      return 'bg-amber-400';
    case 'critical':
    case 'off_track':
    case 'off track':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

export function GoalMetricCard({
  goalNumber,
  title,
  status,
  currentScore,
  unit = '%',
  trendDelta,
  trendDirection,
  target,
  progressPercent,
  onClick,
}: GoalMetricCardProps) {
  const hasScore = currentScore != null;

  return (
    <div
      onClick={onClick}
      className="bg-white ghost-border p-8 rounded-xl transition-all hover:border-slate-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tabular-nums bg-slate-100 text-slate-500 px-2 py-1 rounded">
            {goalNumber}
          </span>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        </div>
        <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-tighter ${statusBadgeClasses(status)}`}>
          {statusBadgeLabel(status)}
        </span>
      </div>

      {/* Current Score */}
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
          Current Score
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black tabular-nums text-slate-900 animate-countUp">
            {hasScore ? `${currentScore}${unit}` : '--'}
          </span>
          {trendDelta != null && trendDelta !== 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center ${trendColor(trendDirection)}`}>
              <MaterialIcon icon={trendIcon(trendDirection)} size={12} />
              {Math.abs(trendDelta).toFixed(1)}%
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">from baseline</span>
      </div>

      {/* Progress Bar */}
      {target != null && (
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span />
            <span>Target: {target}{unit}</span>
          </div>
          <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${progressBarColor(status)}`}
              style={{ width: `${Math.min(progressPercent ?? 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend Strip */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
          Trend
        </span>
        <div className="flex gap-1 h-6">
          {Array.from({ length: 6 }).map((_, i) => {
            const opacity = 0.15 + (i * 0.15);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  backgroundColor: progressBarColor(status).includes('emerald')
                    ? `rgba(16, 185, 129, ${opacity})`
                    : progressBarColor(status).includes('amber')
                    ? `rgba(245, 158, 11, ${opacity})`
                    : progressBarColor(status).includes('red')
                    ? `rgba(239, 68, 68, ${opacity})`
                    : `rgba(148, 163, 184, ${opacity})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
