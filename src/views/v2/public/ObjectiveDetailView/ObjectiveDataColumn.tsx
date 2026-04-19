import { SignatureMetricCard } from '@/components/public-dashboard/SignatureMetricCard';
import { AccordionGoalRow } from '@/components/public-dashboard/AccordionGoalRow';
import { StatTile } from '@/components/public-dashboard/StatTile';
import { TrendChip } from '@/components/public-dashboard/TrendChip';
import { computeGoalTrend } from '@/lib/utils/goalHealth';
import {
  isHonestFramingStatus,
  normalizeToStatusValue,
  type ObjectiveNarrative,
} from '@/lib/utils/objectiveFixtures';
import type { HierarchicalGoal } from '@/lib/types';
import type { Widget } from '@/lib/types/v2';
import { HonestFramingBand } from './HonestFramingBand';

export interface ObjectiveDataColumnProps {
  narrative: ObjectiveNarrative;
  objectiveStatus: string | undefined;
  childGoals: HierarchicalGoal[];
  widgets: Widget[];
}

interface GoalRowData {
  id: string;
  badgeText: string;
  title: string;
  description?: string;
  currentValue: string;
  targetValue: string;
  currentUnit?: string;
  widget?: Widget;
}

function buildRowData(goal: HierarchicalGoal, widget?: Widget): GoalRowData {
  if (!widget) {
    return {
      id: goal.id,
      badgeText: goal.goal_number,
      title: goal.title,
      description: goal.description,
      currentValue: '—',
      targetValue: '—',
      currentUnit: 'awaiting data',
    };
  }

  const trend = computeGoalTrend(widget);
  const unit = widget.config?.unit ?? '';

  return {
    id: goal.id,
    badgeText: goal.goal_number,
    title: goal.title,
    description: goal.description,
    currentValue: String(trend.value),
    targetValue: `${trend.target}${unit}`,
    currentUnit: widget.config?.label,
    widget,
  };
}

function ExpandedPaneContent({ widget }: { widget: Widget }) {
  const trend = computeGoalTrend(widget);
  const unit = widget.config?.unit ?? '';
  const remaining = Math.max(0, Math.round((trend.target - trend.value) * 10) / 10);
  const deltaLabel = `${Math.abs(Math.round(trend.delta * 10) / 10)}${unit} vs baseline`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        label="Current"
        value={`${trend.value}${unit}`}
        footer={<TrendChip direction={trend.direction} label={deltaLabel} />}
      />
      <StatTile
        label="Target"
        value={`${trend.target}${unit}`}
        tone="muted"
        footer={
          <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
            {remaining > 0 ? `${remaining}${unit} to go` : 'on target'}
          </span>
        }
      />
    </div>
  );
}

export function ObjectiveDataColumn({
  narrative,
  objectiveStatus,
  childGoals,
  widgets,
}: ObjectiveDataColumnProps) {
  const showHonestFraming =
    isHonestFramingStatus(objectiveStatus) && !!narrative.honestFraming;
  const widgetByGoal = new Map(widgets.map((w) => [w.goalId, w]));
  const openByDefault = childGoals.length <= 3;

  return (
    <div className="md:col-span-7">
      {showHonestFraming && narrative.honestFraming ? (
        <HonestFramingBand framing={narrative.honestFraming} />
      ) : null}

      <SignatureMetricCard {...narrative.signatureMetric} />

      {childGoals.length > 0 ? (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ color: 'var(--ink-3)' }}
            >
              The {childGoals.length}{' '}
              {childGoals.length === 1 ? 'goal' : 'goals'} behind this objective
            </div>
            <div
              className="flex-1 border-t"
              style={{ borderColor: 'var(--line)' }}
            />
          </div>

          <div className="space-y-3">
            {childGoals.map((goal, i) => {
              const widget = widgetByGoal.get(goal.id);
              const rowData = buildRowData(goal, widget);
              const rowStatus = widget
                ? normalizeToStatusValue(goal.status)
                : 'not-started';

              return (
                <AccordionGoalRow
                  key={rowData.id}
                  id={rowData.id}
                  badgeText={rowData.badgeText}
                  title={rowData.title}
                  description={rowData.description}
                  currentValue={rowData.currentValue}
                  targetValue={rowData.targetValue}
                  currentUnit={rowData.currentUnit}
                  status={rowStatus}
                  accentColor={narrative.accentColor}
                  defaultOpen={openByDefault && i === 0}
                >
                  {widget ? <ExpandedPaneContent widget={widget} /> : (
                    <p
                      className="text-[13px]"
                      style={{ color: 'var(--ink-3)', lineHeight: 1.5 }}
                    >
                      Data for this goal is being collected. Check back soon.
                    </p>
                  )}
                </AccordionGoalRow>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
