export interface SvgDonutChartProps {
  value: number;
  total: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function SvgDonutChart({
  value,
  total,
  color = '#994100',
  trackColor = '#e2e8f0',
  label,
}: SvgDonutChartProps) {
  const percent = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-md3-surface-lowest p-8 rounded-xl border border-md3-outline-variant/15 flex flex-col items-center justify-center h-full">
      <div className="relative w-72 h-72">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={trackColor}
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black tracking-tighter text-md3-on-surface tabular-nums">
            {Math.round(percent)}%
          </span>
          {label && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-md3-on-surface-variant mt-1">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium text-md3-on-surface">Actual Completion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: trackColor }} />
          <span className="text-xs font-medium text-md3-on-surface">Remaining Gap</span>
        </div>
      </div>
    </div>
  );
}
