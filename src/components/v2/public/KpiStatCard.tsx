export interface KpiStatCardProps {
  label: string;
  value: number | string;
  statusDot?: string; // tailwind color class e.g. 'bg-emerald-500'
  valueColor?: string; // tailwind text color class
}

export function KpiStatCard({ label, value, statusDot, valueColor }: KpiStatCardProps) {
  return (
    <div className="rounded-2xl bg-md3-surface-lowest p-4 transition-all ghost-border sm:p-6">
      <div className="mb-2 flex items-start gap-2 sm:items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-md3-on-surface-variant">
          {label}
        </p>
        {statusDot && <div className={`w-2 h-2 rounded-full ${statusDot}`} />}
      </div>
      <div className={`text-3xl font-bold tabular-nums sm:text-4xl ${valueColor || 'text-md3-on-surface'}`}>
        {value}
      </div>
    </div>
  );
}
