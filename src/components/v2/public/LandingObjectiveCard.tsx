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
}: LandingObjectiveCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-md3-surface-lowest ghost-border rounded-xl p-8 flex flex-col group hover:border-md3-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          <MaterialIcon icon={icon} size={28} />
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge.classes}`}>
          {statusBadge.label}
        </div>
      </div>

      <h4 className="text-xl font-bold mb-3">{title}</h4>
      {description && (
        <p className="text-md3-on-surface-variant leading-relaxed text-sm mb-8 flex-grow">
          {description}
        </p>
      )}

      <div className="pt-6 border-t border-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {statusDots.map((dot, i) => (
              <span key={i} className={`w-2.5 h-2.5 rounded-full ${dot.color}`} />
            ))}
          </div>
          <span className="text-[11px] font-medium text-md3-on-surface-variant">
            {onTargetCount} on target &middot; {offTrackCount} off track
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {goalCount} Total Goals
          </span>
          <MaterialIcon
            icon="arrow_forward_ios"
            size={16}
            className="text-slate-300 group-hover:text-md3-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
