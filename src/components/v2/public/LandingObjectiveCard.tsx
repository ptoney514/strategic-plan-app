import { MaterialIcon } from './MaterialIcon';

export interface LandingObjectiveCardProps {
  title: string;
  description?: string;
  icon: string;
  iconBgClass: string; // e.g. 'bg-violet-100 text-violet-600'
  statusBadge: { label: string; classes: string };
  statusDots: { color: string }[]; // e.g. [{ color: 'bg-emerald-500' }, { color: 'bg-amber-500' }]
  goalCount: number;
  onTargetCount: number;
  offTrackCount: number;
  onClick?: () => void;
  testId?: string;
}

export function LandingObjectiveCard({
  title,
  description,
  icon,
  iconBgClass,
  statusBadge,
  statusDots,
  goalCount,
  onTargetCount,
  offTrackCount,
  onClick,
  testId,
}: LandingObjectiveCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="group flex w-full cursor-pointer flex-col rounded-2xl bg-md3-surface-lowest p-5 text-left transition-all ghost-border hover:border-md3-primary/30 sm:p-8"
    >
      <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
        <div className={`rounded-xl p-3 ${iconBgClass}`}>
          <MaterialIcon icon={icon} size={24} />
        </div>
        <div className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusBadge.classes}`}>
          {statusBadge.label}
        </div>
      </div>

      <h4 className="mb-3 text-lg font-bold leading-tight sm:text-xl">{title}</h4>
      {description && (
        <p className="mb-6 flex-grow text-sm leading-relaxed text-md3-on-surface-variant sm:mb-8">
          {description}
        </p>
      )}

      <div className="border-t border-slate-100 pt-5 sm:pt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusDots.map((dot, i) => (
              <span key={i} className={`w-2.5 h-2.5 rounded-full ${dot.color}`} />
            ))}
          </div>
          <span className="text-xs leading-5 text-md3-on-surface-variant sm:text-[11px]">
            {onTargetCount} on target &middot; {offTrackCount} off track
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {goalCount} Total Goals
          </span>
          <MaterialIcon
            icon="arrow_forward_ios"
            size={16}
            className="text-slate-300 group-hover:text-md3-primary transition-colors"
          />
        </div>
      </div>
    </button>
  );
}
