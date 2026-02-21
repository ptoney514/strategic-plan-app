import type { Goal, Plan } from '../../../lib/types';

interface DistrictHealthCardProps {
  goals: Goal[];
  plans: Plan[];
}

function getHealthColor(value: number): string {
  if (value >= 70) return 'var(--editorial-accent-success)';
  if (value >= 40) return '#d4a017';
  return '#c0392b';
}

function getHealthLabel(value: number): string {
  if (value >= 70) return 'On Track';
  if (value >= 40) return 'At Risk';
  return 'Critical';
}

export function DistrictHealthCard({ goals, plans }: DistrictHealthCardProps) {
  const activePlans = plans.filter((p) => p.is_active);
  const planProgress = plans.length > 0 ? Math.round((activePlans.length / plans.length) * 100) : 0;

  const level0Goals = goals.filter((g) => g.level === 0);
  const goalProgress =
    level0Goals.length > 0
      ? Math.round(level0Goals.reduce((sum, g) => sum + (g.overall_progress ?? 0), 0) / level0Goals.length)
      : 0;

  const overallHealth = level0Goals.length > 0 ? goalProgress : planProgress;

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-lg font-medium"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
        >
          District Health
        </h3>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: `${getHealthColor(overallHealth)}20`,
            color: getHealthColor(overallHealth),
          }}
        >
          {getHealthLabel(overallHealth)}
        </span>
      </div>

      <div className="space-y-5">
        {/* Goal Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>
              Goal Progress
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
              {goalProgress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--editorial-surface-alt)' }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${goalProgress}%`,
                backgroundColor: getHealthColor(goalProgress),
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            Average progress across {level0Goals.length} top-level objective{level0Goals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Plan Status */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>
              Plan Activation
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--editorial-text-primary)' }}>
              {activePlans.length}/{plans.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--editorial-surface-alt)' }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${planProgress}%`,
                backgroundColor: getHealthColor(planProgress),
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
            {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''} of {plans.length} total
          </p>
        </div>
      </div>
    </div>
  );
}
