import { MaterialIcon } from './MaterialIcon';

export interface NumberedObjectiveCardProps {
  number: string; // "01", "02", etc.
  title: string;
  description?: string;
  accentColor: string; // hex color for left bar
  statusDots: { color: string }[];
  onTargetCount: number;
  offTrackCount: number;
  goalCount: number;
  onClick?: () => void;
}

export function NumberedObjectiveCard({
  number,
  title,
  description,
  accentColor,
  statusDots,
  onTargetCount,
  offTrackCount,
  goalCount,
  onClick,
}: NumberedObjectiveCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-md3-surface-lowest ghost-border rounded-xl transition-all overflow-hidden cursor-pointer"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-8 lg:p-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <span
            className="text-6xl font-black select-none tabular-nums"
            style={{ color: `${accentColor}08` }}
          >
            {number}
          </span>
          <MaterialIcon
            icon="north_east"
            className="text-slate-300 group-hover:text-md3-primary transition-colors"
          />
        </div>

        <h3 className="text-2xl font-bold text-md3-on-surface mb-3 leading-tight">{title}</h3>
        {description && (
          <p className="text-md3-on-surface-variant leading-relaxed mb-8 flex-1">{description}</p>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-bold uppercase tracking-widest text-md3-outline">
              Goal Health
            </span>
            <div className="flex-1 h-[1px] bg-md3-outline-variant/30" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {statusDots.map((dot, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${dot.color}`} />
              ))}
            </div>
            <div className="text-sm font-medium">
              <span className="text-md3-on-surface">{onTargetCount} on target</span>
              <span className="text-md3-outline mx-1.5">&middot;</span>
              <span className="text-md3-on-surface">{offTrackCount} off track</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-widest text-md3-outline">
              Total Goals
            </span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: accentColor }}>
              {goalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
