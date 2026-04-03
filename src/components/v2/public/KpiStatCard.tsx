export interface KpiStatCardProps {
  label: string;
  value: number | string;
  statusDot?: string; // tailwind color class e.g. 'bg-emerald-500'
  valueColor?: string; // tailwind text color class
}

export function KpiStatCard({ label, value, statusDot, valueColor }: KpiStatCardProps) {
  return (
    <div className="bg-md3-surface-lowest ghost-border rounded-xl p-6 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] text-md3-on-surface-variant uppercase tracking-widest font-bold">
          {label}
        </p>
        {statusDot && <div className={`w-2 h-2 rounded-full ${statusDot}`} />}
      </div>
      <div className={`text-4xl font-bold tabular-nums ${valueColor || 'text-md3-on-surface'}`}>
        {value}
      </div>
    </div>
  );
}
