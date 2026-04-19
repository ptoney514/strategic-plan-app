import { SignatureMetricCard } from '@/components/public-dashboard/SignatureMetricCard';
import { StatTile } from '@/components/public-dashboard/StatTile';
import { TrendChip } from '@/components/public-dashboard/TrendChip';
import { StatusChip } from '@/components/public-dashboard/StatusChip';
import { AccordionGoalRow } from '@/components/public-dashboard/AccordionGoalRow';
import { NestedSubGoal } from '@/components/public-dashboard/NestedSubGoal';
import {
  accordionGoalRowCollapsedFixtures,
  accordionGoalRowOpenFixture,
  nestedSubGoalFixtures,
  signatureMetricCardFixture,
  statTileCurrentFixture,
  statTileTargetFixture,
  statusChipFixtures,
  trendChipFixtures,
} from './fixtures';

export default function DevComponentsPage() {
  return (
    <main
      className="mx-auto max-w-5xl space-y-16 px-6 py-12"
      style={{
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'Geist, sans-serif',
      }}
    >
      <header>
        <h1 className="text-2xl font-semibold">
          Phase 2 · Component Showcase
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
          Fixture-driven render of each new public-dashboard primitive. Not
          wired to real data.
        </p>
      </header>

      <section id="signature-metric-card">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          SignatureMetricCard · design.md §5.7
        </h2>
        <SignatureMetricCard {...signatureMetricCardFixture} />
      </section>

      <section id="stat-tile">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          StatTile · design.md §5.10
        </h2>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <StatTile
            {...statTileCurrentFixture}
            footer={<TrendChip direction="up" label="7 pts vs baseline" />}
          />
          <StatTile
            {...statTileTargetFixture}
            footer={
              <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
                13 pts to go
              </span>
            }
          />
        </div>
      </section>

      <section id="trend-chip">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          TrendChip · design.md §5.11
        </h2>
        <div className="flex flex-wrap gap-3">
          {trendChipFixtures.map((f) => (
            <TrendChip key={`${f.direction}-${f.label}`} {...f} />
          ))}
        </div>
      </section>

      <section id="status-chip">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          StatusChip · design.md §5.3
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {statusChipFixtures.map((f) => (
            <StatusChip key={f.status} {...f} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {statusChipFixtures.map((f) => (
            <StatusChip key={`${f.status}-sm`} {...f} size="sm" />
          ))}
        </div>
      </section>

      <section id="accordion-goal-row">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          AccordionGoalRow · design.md §5.8 (Pattern A)
        </h2>
        <div>
          <AccordionGoalRow {...accordionGoalRowOpenFixture}>
            <div className="grid grid-cols-12 items-start gap-5">
              <div className="col-span-12 md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  <StatTile
                    label="Current"
                    value="72%"
                    footer={<TrendChip direction="up" label="7 pts vs baseline" />}
                  />
                  <StatTile
                    label="Target"
                    value="85%"
                    tone="muted"
                    footer={
                      <span
                        className="text-[12px]"
                        style={{ color: 'var(--ink-3)' }}
                      >
                        13 pts to go
                      </span>
                    }
                  />
                </div>
                <div
                  className="mt-3 rounded-xl p-4"
                  style={{
                    background: 'rgba(47,90,138,0.06)',
                    borderLeft: '3px solid var(--o1)',
                  }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'var(--o1)' }}
                  >
                    Narrative
                  </div>
                  <p
                    className="mt-1.5 text-[13px]"
                    style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}
                  >
                    Seven points above baseline and moving. Tier 2 readers in
                    grades 3–5 gained an average of{' '}
                    <strong style={{ color: 'var(--ink)' }}>+14 pts</strong>{' '}
                    with targeted small-group support.
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-7">
                <div className="stat-tile" style={{ padding: '16px 18px' }}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--ink)' }}
                    >
                      Reading proficiency trend
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: 'var(--ink-3)' }}
                    >
                      2021–2026
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 420 150"
                    width="100%"
                    height="150"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="devO1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2E5BD9" stopOpacity="1" />
                        <stop
                          offset="100%"
                          stopColor="#2E5BD9"
                          stopOpacity="0.22"
                        />
                      </linearGradient>
                    </defs>
                    <rect x="56" y="95" width="60" height="15" rx="4" fill="url(#devO1)" fillOpacity="0.5" />
                    <rect x="130" y="85" width="60" height="25" rx="4" fill="url(#devO1)" fillOpacity="0.6" />
                    <rect x="204" y="72" width="60" height="38" rx="4" fill="url(#devO1)" fillOpacity="0.75" />
                    <rect x="278" y="58" width="60" height="52" rx="4" fill="url(#devO1)" fillOpacity="0.88" />
                    <rect x="352" y="46" width="60" height="64" rx="4" fill="url(#devO1)" />
                    {['62','65','67','69','72'].map((v, i) => (
                      <text
                        key={v}
                        x={86 + i * 74}
                        y={91 - i * 9}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={i === 4 ? 700 : 600}
                        fill="#0B0A1A"
                      >
                        {v}
                      </text>
                    ))}
                    {['2022','2023','2024','2025','2026'].map((y, i) => (
                      <text
                        key={y}
                        x={86 + i * 74}
                        y={130}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={i === 4 ? 600 : 400}
                        fill={i === 4 ? '#0B0A1A' : '#6B6884'}
                      >
                        {y}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </AccordionGoalRow>
          {accordionGoalRowCollapsedFixtures.map((f) => (
            <div key={f.id} className="mt-3">
              <AccordionGoalRow {...f} />
            </div>
          ))}
        </div>
      </section>

      <section id="nested-sub-goal">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          NestedSubGoal · design.md §5.9
        </h2>
        <div
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: 'var(--line)' }}
        >
          <div
            className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--green-emphasis)' }}
          >
            ↳ Sub-sub-goals · 2
          </div>
          <div className="space-y-2">
            {nestedSubGoalFixtures.map((f) => (
              <NestedSubGoal key={f.badgeText} {...f} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
