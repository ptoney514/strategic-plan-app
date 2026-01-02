interface StatusBadgeProps {
  status: 'on-target' | 'needs-attention' | 'off-track' | 'complete' | 'on-track' | 'not-started';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const statusConfig = {
  'on-target': {
    label: 'On Target',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    dot: 'bg-green-500',
  },
  'on-track': {
    label: 'On Track',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    dot: 'bg-green-500',
  },
  'complete': {
    label: 'Complete',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    dot: 'bg-green-500',
  },
  'needs-attention': {
    label: 'Needs Attention',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
  },
  'off-track': {
    label: 'Off Track',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100',
    dot: 'bg-red-500',
  },
  'not-started': {
    label: 'Not Started',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
};

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['not-started'];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}

// Export status type for reuse
export type StatusType = keyof typeof statusConfig;

// Helper to calculate status from progress
export function calculateStatus(progress: number | null | undefined): StatusType {
  if (progress === null || progress === undefined) {
    return 'not-started';
  }
  if (progress >= 80) {
    return 'on-target';
  }
  if (progress >= 50) {
    return 'needs-attention';
  }
  return 'off-track';
}
