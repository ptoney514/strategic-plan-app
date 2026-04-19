export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendChipProps {
  direction: TrendDirection;
  label: string;
}

const GLYPHS: Record<TrendDirection, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function TrendChip({ direction, label }: TrendChipProps) {
  return (
    <span className={`trend-chip trend-${direction}`}>
      <span aria-hidden="true">{GLYPHS[direction]}</span>
      {label}
    </span>
  );
}
