import { Target, BarChart3, Clock } from 'lucide-react';
import type { Goal, Metric } from '../../../lib/types';

interface ActivityFeedProps {
  goals: Goal[];
  metrics: Metric[];
}

interface ActivityItem {
  id: string;
  icon: 'goal' | 'metric';
  description: string;
  timestamp: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed({ goals, metrics }: ActivityFeedProps) {
  const items: ActivityItem[] = [];

  for (const goal of goals) {
    if (goal.updated_at) {
      items.push({
        id: `goal-upd-${goal.id}`,
        icon: 'goal',
        description: `"${goal.title}" updated`,
        timestamp: goal.updated_at,
      });
    } else if (goal.created_at) {
      items.push({
        id: `goal-crt-${goal.id}`,
        icon: 'goal',
        description: `"${goal.title}" created`,
        timestamp: goal.created_at,
      });
    }
  }

  for (const metric of metrics) {
    const ts = metric.updated_at;
    const created = metric.created_at;
    if (ts) {
      items.push({
        id: `metric-upd-${metric.id}`,
        icon: 'metric',
        description: `Metric "${metric.metric_name}" updated`,
        timestamp: ts,
      });
    } else if (created) {
      items.push({
        id: `metric-crt-${metric.id}`,
        icon: 'metric',
        description: `Metric "${metric.metric_name}" created`,
        timestamp: created,
      });
    }
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recent = items.slice(0, 8);

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
    >
      <h3
        className="text-lg font-medium mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
      >
        Recent Activity
      </h3>
      {recent.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            No recent activity.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--editorial-border)' }}>
          {recent.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--editorial-surface-alt)', color: 'var(--editorial-text-muted)' }}
              >
                {item.icon === 'goal' ? <Target size={14} /> : <BarChart3 size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug truncate" style={{ color: 'var(--editorial-text-primary)' }}>
                  {item.description}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={11} style={{ color: 'var(--editorial-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--editorial-text-muted)' }}>
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
