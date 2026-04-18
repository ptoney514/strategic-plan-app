import type { HealthSegment } from '@/lib/utils/goalHealth';

export interface PlanHealthBarProps {
  segments: HealthSegment[];
}

export function PlanHealthBar({ segments }: PlanHealthBarProps) {
  return (
    <div className="rounded-2xl bg-md3-surface-lowest p-5 ghost-border sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Plan Health at a Glance</h2>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-medium text-md3-on-surface-variant">
                {seg.label} ({seg.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex h-8 w-full overflow-hidden rounded-full bg-slate-100 sm:h-10">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
          >
            {seg.percent >= 8 && (
              <span className="text-[10px] text-white font-bold">{seg.percent}%</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-between px-1 sm:mt-6 sm:px-2">
        {['0%', '25%', '50%', '75%', '100%'].map((label) => (
          <span key={label} className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter sm:text-[10px]">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
