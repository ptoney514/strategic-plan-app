import type { ReactNode } from 'react';

export type StatTileTone = 'ink' | 'muted';

export interface StatTileProps {
  label: string;
  value: string;
  tone?: StatTileTone;
  footer?: ReactNode;
}

export function StatTile({ label, value, tone = 'ink', footer }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="label">{label}</div>
      <div
        className="value"
        style={tone === 'muted' ? { color: 'var(--ink-2)' } : undefined}
      >
        {value}
      </div>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
