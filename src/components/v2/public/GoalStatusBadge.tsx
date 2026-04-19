export interface GoalStatusBadgeProps {
  status: string | undefined;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; bgColor: string; textColor: string }> = {
  // design.md §5.3 values
  on_track: { label: 'On Track', bgColor: '#dcfce7', textColor: '#166534' },
  off_track: { label: 'Off Track', bgColor: '#fee2e2', textColor: '#991b1b' },
  complete: { label: 'Complete', bgColor: '#dcfce7', textColor: '#166534' },
  // legacy values still emitted by some pre-v4 code paths
  completed: { label: 'Completed', bgColor: '#dcfce7', textColor: '#166534' },
  'on-target': { label: 'On Target', bgColor: '#dcfce7', textColor: '#166534' },
  in_progress: { label: 'In Progress', bgColor: '#fef3c7', textColor: '#92400e' },
  'at-risk': { label: 'At Risk', bgColor: '#fef3c7', textColor: '#92400e' },
  critical: { label: 'Critical', bgColor: '#fee2e2', textColor: '#991b1b' },
  'off-target': { label: 'Off Target', bgColor: '#fee2e2', textColor: '#991b1b' },
  not_started: { label: 'Not Started', bgColor: '#f3f4f6', textColor: '#374151' },
  on_hold: { label: 'On Hold', bgColor: '#f3f4f6', textColor: '#374151' },
  planning: { label: 'Planning', bgColor: '#f3f4f6', textColor: '#374151' },
};

const DEFAULT_STATUS = { label: 'Not Started', bgColor: '#f3f4f6', textColor: '#374151' };

export function GoalStatusBadge({ status, className = '' }: GoalStatusBadgeProps) {
  const config = (status && STATUS_MAP[status]) || DEFAULT_STATUS;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {config.label}
    </span>
  );
}
