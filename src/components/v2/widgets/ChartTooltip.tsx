interface TooltipPayloadEntry {
  value: number;
  name: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--editorial-surface, #ffffff)',
        border: '1px solid var(--editorial-border, #e8e6e1)',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '8px 12px',
      }}
    >
      {label && (
        <p
          style={{
            fontSize: 11,
            color: 'var(--editorial-text-muted, #8a8a8a)',
            marginBottom: 4,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--editorial-text-primary, #1a1a1a)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {payload.length > 1 && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color || 'var(--editorial-accent-primary)',
                flexShrink: 0,
              }}
            />
          )}
          {entry.value}
        </p>
      ))}
    </div>
  );
}
