interface StatusBadgeProps {
  status?: 'on-target' | 'needs-attention' | 'off-track' | 'complete' | 'on-track' | 'not-started';
  customText?: string;
  customColor?: 'green' | 'amber' | 'red' | 'gray';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const statusConfig = {
  'on-target': {
    label: 'On Target',
    bg: 'bg-green-500',
    text: 'text-white',
    border: '',
    dot: 'bg-white',
  },
  'on-track': {
    label: 'On Track',
    bg: 'bg-green-500',
    text: 'text-white',
    border: '',
    dot: 'bg-white',
  },
  'complete': {
    label: 'Complete',
    bg: 'bg-green-500',
    text: 'text-white',
    border: '',
    dot: 'bg-white',
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

// Color mapping for custom badge colors
const customColorConfig = {
  green: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: '',
    dot: 'bg-white',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100',
    dot: 'bg-red-500',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
};

export function StatusBadge({ status, customText, customColor, size = 'md', showDot = true }: StatusBadgeProps) {
  // Use custom color/text if provided, otherwise fall back to status-based config
  let config;
  let label;

  if (customColor && customText) {
    // Custom badge mode
    config = customColorConfig[customColor];
    label = customText;
  } else if (status) {
    // Auto-calculated status mode (backward compatibility)
    config = statusConfig[status] || statusConfig['not-started'];
    label = config.label;
  } else {
    // Fallback to not-started
    config = statusConfig['not-started'];
    label = config.label;
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${config.border ? 'border' : ''} ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {label}
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
