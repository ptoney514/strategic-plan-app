import { GoalStatusBadge } from './GoalStatusBadge';

export interface ObjectiveCardProps {
  goalNumber: string;
  title: string;
  childCount: number;
  status?: string;
  primaryColor?: string;
  onClick?: () => void;
}

export function ObjectiveCard({
  goalNumber,
  title,
  childCount,
  status,
  primaryColor = '#1e293b',
  onClick,
}: ObjectiveCardProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-md"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex items-center justify-center rounded-lg font-bold text-sm text-white flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: primaryColor }}
        >
          {goalNumber}
        </div>
        <h3
          className="font-semibold text-base"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {title}
        </h3>
      </div>
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        <span>{childCount} {childCount === 1 ? 'goal' : 'goals'} &middot;</span>
        <GoalStatusBadge status={status} />
      </div>
    </div>
  );
}
