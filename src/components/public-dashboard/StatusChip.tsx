import type { CSSProperties } from 'react';

export type StatusValue =
  | 'on-track'
  | 'in-progress'
  | 'off-track'
  | 'not-started'
  | 'completed';

export type StatusChipSize = 'sm' | 'md';

export interface StatusChipProps {
  status: StatusValue;
  label?: string;
  size?: StatusChipSize;
}

const DEFAULT_LABELS: Record<StatusValue, string> = {
  'on-track': 'On target',
  'in-progress': 'In progress',
  'off-track': 'Off track',
  'not-started': 'Not started',
  completed: 'Complete',
};

const SMALL_STYLE: CSSProperties = {
  fontSize: '9px',
  padding: '3px 7px',
};

export function StatusChip({ status, label, size = 'md' }: StatusChipProps) {
  return (
    <span
      className={`chip chip-${status}`}
      style={size === 'sm' ? SMALL_STYLE : undefined}
    >
      <span className="status-dot" aria-hidden="true" />
      {label ?? DEFAULT_LABELS[status]}
    </span>
  );
}
