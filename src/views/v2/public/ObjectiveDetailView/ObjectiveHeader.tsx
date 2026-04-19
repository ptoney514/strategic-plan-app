import {
  normalizeToStatusValue,
  type ObjectiveNarrative,
  type ObjectiveStat,
} from '@/lib/utils/objectiveFixtures';
import type { StatusValue } from '@/components/public-dashboard/StatusChip';

export interface ObjectiveHeaderProps {
  narrative: ObjectiveNarrative;
  status: string | undefined;
}

const STATUS_LABELS: Record<StatusValue, string> = {
  'on-track': 'On target',
  'in-progress': 'In progress',
  'off-track': 'Needs focus',
  'not-started': 'Awaiting data',
  completed: 'Complete',
};

const STATUS_COLORS: Record<StatusValue, string> = {
  'on-track': 'var(--on-track)',
  'in-progress': 'var(--in-progress)',
  'off-track': 'var(--off-track)',
  'not-started': 'var(--ink-3)',
  completed: 'var(--on-track)',
};

function StatCallout({ stat }: { stat: ObjectiveStat }) {
  return (
    <div>
      <div
        className="leading-none"
        style={{
          color: 'var(--ink)',
          fontFamily: 'Geist, sans-serif',
          fontSize: '40px',
          fontWeight: 600,
          letterSpacing: '-0.04em',
        }}
      >
        {stat.value}
        {stat.unit ? (
          <span
            className="text-[18px]"
            style={{ color: 'var(--ink-3)', fontWeight: 600 }}
          >
            {stat.unit}
          </span>
        ) : null}
      </div>
      <div
        className="mt-2 text-[11px] leading-snug"
        style={{ color: 'var(--ink-3)' }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export function ObjectiveHeader({ narrative, status }: ObjectiveHeaderProps) {
  const statusValue = normalizeToStatusValue(status);
  const statusLabel = STATUS_LABELS[statusValue];
  const statusColor = STATUS_COLORS[statusValue];

  return (
    <div className="md:col-span-5 md:sticky md:top-28">
      <div
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em]"
        style={{ color: 'var(--ink-3)' }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            height: 3,
            width: 42,
            borderRadius: 2,
            background: narrative.accentColor,
          }}
        />
        <span>{narrative.eyebrow}</span>
        <span style={{ color: 'var(--line)' }}>·</span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: statusColor }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 999,
              background: statusColor,
            }}
          />
          {statusLabel}
        </span>
      </div>

      <h2
        className="mt-5 text-5xl leading-[1.02] md:text-6xl"
        style={{
          color: 'var(--ink)',
          fontFamily: "'Instrument Serif', Georgia, serif",
        }}
      >
        {narrative.titlePrefix}
        <br />
        <em
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
            color: narrative.accentColor,
          }}
        >
          {narrative.titleEmphasis}
        </em>
        {narrative.titleSuffix ? <> {narrative.titleSuffix}</> : null}
      </h2>

      <p
        className="mt-5"
        style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}
      >
        {narrative.narrative}
      </p>

      {narrative.pullQuote ? (
        <blockquote
          className="mt-8 rounded-r-xl p-[18px_20px]"
          style={{
            borderLeft: '2px solid currentColor',
            color: narrative.accentColor,
            background: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <p
            className="text-2xl md:text-[26px]"
            style={{
              color: 'var(--ink)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic',
              lineHeight: 1.35,
            }}
          >
            &ldquo;{narrative.pullQuote.text}&rdquo;
          </p>
          <div
            className="mt-2.5 text-xs"
            style={{ color: 'var(--ink-3)' }}
          >
            — {narrative.pullQuote.attribution}
          </div>
        </blockquote>
      ) : null}

      <div
        className="mt-10 grid grid-cols-3 gap-5 pt-8"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        {narrative.stats.map((stat, i) => (
          <StatCallout key={`${stat.label}-${i}`} stat={stat} />
        ))}
      </div>
    </div>
  );
}
