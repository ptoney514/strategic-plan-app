export interface ProgressRingProps {
  progress: number; // 0-100
  size?: number; // Default: 40
  strokeWidth?: number; // Default: 3
  className?: string;
}

export function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 3,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const fontSize = size * 0.25;

  const strokeColor =
    clamped >= 100
      ? 'var(--editorial-accent-success, #16a34a)'
      : 'var(--editorial-accent-primary)';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`${Math.round(clamped)}% progress`}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--editorial-border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      {/* Center text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fill="currentColor"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
