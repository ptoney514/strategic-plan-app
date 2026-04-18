import type { Goal } from '../types';
import type { Widget, WidgetConfig } from '../types/v2';

export interface StatusCounts {
  onTarget: number;
  atRisk: number;
  critical: number;
  noData: number;
  total: number;
}

export interface HealthSegment {
  color: string;
  percent: number;
  label: string;
  count: number;
}

function normalizeStatus(status?: string): 'on_target' | 'at_risk' | 'critical' | 'no_data' {
  switch (status?.toLowerCase().replace(/\s+/g, '_')) {
    case 'on_target':
    case 'exceeding':
    case 'completed':
      return 'on_target';
    case 'at_risk':
    case 'in_progress':
      return 'at_risk';
    case 'critical':
    case 'off_track':
      return 'critical';
    default:
      return 'no_data';
  }
}

export function computeStatusCounts(goals: Goal[]): StatusCounts {
  const counts: StatusCounts = { onTarget: 0, atRisk: 0, critical: 0, noData: 0, total: goals.length };

  for (const goal of goals) {
    const s = normalizeStatus(goal.status);
    if (s === 'on_target') counts.onTarget++;
    else if (s === 'at_risk') counts.atRisk++;
    else if (s === 'critical') counts.critical++;
    else counts.noData++;
  }

  return counts;
}

export function computeHealthSegments(goals: Goal[]): HealthSegment[] {
  const counts = computeStatusCounts(goals);
  const total = counts.total || 1;

  return [
    { color: '#10b981', percent: Math.round((counts.onTarget / total) * 100), label: 'On Target', count: counts.onTarget },
    { color: '#f59e0b', percent: Math.round((counts.atRisk / total) * 100), label: 'At Risk', count: counts.atRisk },
    { color: '#ef4444', percent: Math.round((counts.critical / total) * 100), label: 'Critical', count: counts.critical },
    { color: '#94a3b8', percent: Math.round((counts.noData / total) * 100), label: 'No Data', count: counts.noData },
  ].filter((s) => s.count > 0);
}

export function computeGoalTrend(widget: Widget | undefined): {
  delta: number;
  direction: 'up' | 'down' | 'flat';
  value: number;
  target: number;
  baseline: number;
  progress: number;
} {
  const config: WidgetConfig = widget?.config || {};
  const value = config.value ?? 0;
  const target = config.target ?? 100;
  const baseline = config.baseline ?? 0;
  const delta = baseline > 0 ? value - baseline : 0;
  const direction = config.trendDirection ?? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat');
  const range = Math.abs(target - baseline) || 1;
  const progress = Math.min(Math.round((Math.abs(value - baseline) / range) * 100), 100);

  return { delta, direction, value, target, baseline, progress };
}

export function statusBadgeClasses(status?: string): string {
  const s = normalizeStatus(status);
  switch (s) {
    case 'on_target':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'at_risk':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'critical':
      return 'bg-red-50 text-red-700 border border-red-100';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}

export function statusBadgeLabel(status?: string): string {
  const s = normalizeStatus(status);
  switch (s) {
    case 'on_target': return 'On Target';
    case 'at_risk': return 'In Progress';
    case 'critical': return 'Off Track';
    default: return 'Not Started';
  }
}
