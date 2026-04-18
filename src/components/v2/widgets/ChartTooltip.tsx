interface TooltipPayloadEntry {
  value: number;
  name: string;
  color?: string;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  /** Optional unit suffix rendered after each value (e.g. "%", "pts"). */
  unit?: string;
  /** When true, render each entry's `name` next to its value (used for multi-series). */
  showSeriesNames?: boolean;
}

/**
 * Shared tooltip for Recharts. Shadcn-style:
 * - Compact card, ghost border, soft shadow
 * - Timestamp/label in a small muted header
 * - One row per series with a color dot, name, and right-aligned value
 * - Theme-aware via Tailwind utility classes (no hardcoded hex)
 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  showSeriesNames,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const multi = payload.length > 1 || showSeriesNames;

  return (
    <div className="rounded-lg border border-md3-outline-variant/30 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm dark:bg-slate-900/95 dark:border-slate-700">
      {label && (
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-md3-on-surface-variant">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div
            key={`${entry.dataKey ?? entry.name}-${i}`}
            className="flex items-center gap-2.5 text-md3-on-surface"
          >
            {multi && (
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: entry.color ?? 'var(--color-md3-primary)' }}
                aria-hidden
              />
            )}
            {multi && (
              <span className="text-md3-on-surface-variant">{entry.name}</span>
            )}
            <span className="ml-auto font-semibold tabular-nums">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {unit && <span className="ml-0.5 text-md3-on-surface-variant">{unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
