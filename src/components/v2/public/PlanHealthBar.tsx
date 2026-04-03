import type { HealthSegment } from '@/lib/utils/goalHealth';

export interface PlanHealthBarProps {
  segments: HealthSegment[];
}

export function PlanHealthBar({ segments }: PlanHealthBarProps) {
  return (
    <div className="bg-md3-surface-lowest ghost-border rounded-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Plan Health at a Glance</h2>
        <div className="flex items-center gap-4 flex-wrap">
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

      <div className="relative w-full h-10 bg-slate-100 rounded-full overflow-hidden flex">
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

      <div className="mt-6 flex justify-between px-2">
        {['0%', '25%', '50%', '75%', '100%'].map((label) => (
          <span key={label} className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
