import { Target, BarChart3, FileText, Users } from 'lucide-react';

interface KPICardsGridProps {
  goalsCount: number;
  metricsCount: number;
  planStatus: string;
  teamCount: number;
}

const cards = [
  { key: 'goals', label: 'Active Goals', subtext: 'Strategic objectives', icon: Target },
  { key: 'metrics', label: 'Tracked Metrics', subtext: 'Key results', icon: BarChart3 },
  { key: 'plans', label: 'Active Plans', subtext: 'Current status', icon: FileText },
  { key: 'team', label: 'Team Members', subtext: 'Contributors', icon: Users },
] as const;

export function KPICardsGrid({ goalsCount, metricsCount, planStatus, teamCount }: KPICardsGridProps) {
  const values: Record<string, string> = {
    goals: String(goalsCount),
    metrics: String(metricsCount),
    plans: planStatus,
    team: String(teamCount),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, subtext, icon: Icon }) => (
        <div
          key={key}
          className="rounded-xl p-5 flex items-start gap-4"
          style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(45, 130, 130, 0.1)', color: '#2d8282' }}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <div
              className="text-2xl font-semibold leading-tight"
              style={{ color: 'var(--editorial-text-primary)' }}
            >
              {values[key]}
            </div>
            <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--editorial-text-primary)' }}>
              {label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
              {subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
