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
  testId?: string;
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
  testId,
}: NumberedObjectiveCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-md3-surface-lowest text-left transition-all ghost-border"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex h-full flex-col p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <span
            className="select-none text-4xl font-black tabular-nums sm:text-6xl"
            style={{ color: `${accentColor}08` }}
          >
            {number}
          </span>
          <MaterialIcon
            icon="north_east"
            className="text-slate-300 group-hover:text-md3-primary transition-colors"
          />
        </div>

        <h3 className="mb-3 text-xl font-bold leading-tight text-md3-on-surface sm:text-2xl">{title}</h3>
        {description && (
          <p className="mb-6 flex-1 text-sm leading-relaxed text-md3-on-surface-variant sm:mb-8 sm:text-base">{description}</p>
        )}

        <div className="space-y-5 sm:space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-md3-outline sm:text-[12px]">
              Goal Health
            </span>
            <div className="flex-1 h-[1px] bg-md3-outline-variant/30" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {statusDots.map((dot, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${dot.color}`} />
              ))}
            </div>
            <div className="text-sm font-medium leading-5">
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
    </button>
  );
}
