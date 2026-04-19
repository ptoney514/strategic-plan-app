import type { ObjectiveHonestFraming, ObjectiveHonestFramingPanel } from '@/lib/utils/objectiveFixtures';

export interface HonestFramingBandProps {
  framing: ObjectiveHonestFraming;
}

function Panel({ panel }: { panel: ObjectiveHonestFramingPanel }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--bg-elev)', borderColor: 'var(--line)' }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: 'var(--off-track)' }}
      >
        {panel.label}
      </div>
      <h4
        className="mt-2 text-lg leading-snug"
        style={{
          color: 'var(--ink)',
          fontFamily: "'Instrument Serif', Georgia, serif",
        }}
      >
        {panel.title}
        {panel.titleEmphasis ? (
          <>
            {' '}
            <span
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              {panel.titleEmphasis}
            </span>
          </>
        ) : null}
      </h4>
      <p
        className="mt-2 text-[12px]"
        style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}
      >
        {panel.body}
      </p>
    </div>
  );
}

export function HonestFramingBand({ framing }: HonestFramingBandProps) {
  return (
    <div
      className="mb-7 grid grid-cols-1 gap-3 md:grid-cols-3"
      data-testid="honest-framing-band"
    >
      <Panel panel={framing.problem} />
      <Panel panel={framing.action} />
      <Panel panel={framing.timeline} />
    </div>
  );
}
