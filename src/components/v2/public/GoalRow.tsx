import { GoalStatusBadge } from './GoalStatusBadge';

export interface GoalRowProps {
  goalNumber: string;
  title: string;
  description?: string;
  status?: string;
  primaryColor?: string;
}

export function GoalRow({
  goalNumber,
  title,
  description,
  status,
  primaryColor = '#1e293b',
}: GoalRowProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl p-4"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg font-bold text-sm text-white flex-shrink-0"
        style={{ width: 40, height: 40, backgroundColor: primaryColor }}
      >
        {goalNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-medium"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {title}
        </div>
        {description && (
          <div
            className="text-sm line-clamp-2"
            style={{ color: 'var(--editorial-text-secondary)' }}
          >
            {description}
          </div>
        )}
      </div>
      <GoalStatusBadge status={status} />
    </div>
  );
}
