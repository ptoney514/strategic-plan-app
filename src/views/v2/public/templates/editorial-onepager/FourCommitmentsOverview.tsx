'use client'
import type { HierarchicalGoal } from '@/lib/types'
import type { EditorialContent } from './fixtures/editorial-fixtures'

// Design tokens from community-dashboard-v4.html.
// Column index (0–3) maps to objective accent + mini-bar visual profile.
const COLUMN_VISUALS = [
  { accentVar: '--o1', baseRgba: 'rgba(47,90,138,' },
  { accentVar: '--o2', baseRgba: 'rgba(201,154,43,' },
  { accentVar: '--o3', baseRgba: 'rgba(47,158,102,' },
  { accentVar: '--o4', baseRgba: 'rgba(192,85,59,' },
] as const

// Mini-bar heights per column (v4 mockup): a trending-up shape for obj 1–3
// and a trending-down shape for obj 4. Phase 4 fixture; real widget time-
// series replace this later.
const MINI_BAR_HEIGHTS = [
  [55, 62, 72, 85, 100],
  [60, 65, 70, 78, 92],
  [40, 52, 60, 72, 88],
  [70, 65, 55, 48, 42],
] as const

const BAR_OPACITIES = [0.22, 0.32, 0.45, 0.6, 1] as const

function statusLabel(status: string | null | undefined): {
  label: string
  dotBg: string
} {
  const s = status?.toLowerCase().replace(/\s+/g, '_')
  if (s === 'on_target' || s === 'on_track' || s === 'complete') {
    return { label: 'On target', dotBg: 'var(--on-track)' }
  }
  if (s === 'at_risk' || s === 'in_progress') {
    return { label: 'In progress', dotBg: 'var(--in-progress)' }
  }
  if (s === 'off_track' || s === 'critical') {
    return { label: 'Needs focus', dotBg: 'var(--off-track)' }
  }
  return { label: 'Not started', dotBg: 'var(--not-started)' }
}

export interface FourCommitmentsOverviewProps {
  objectives: HierarchicalGoal[]
  heading: EditorialContent['fourCommitments']
}

export function FourCommitmentsOverview({
  objectives,
  heading,
}: FourCommitmentsOverviewProps) {
  const columns = objectives.slice(0, 4)

  return (
    <section
      id="overview"
      className="relative py-28"
      style={{ borderTop: '1px solid var(--line-soft)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-4">
            <div
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ color: 'var(--muted)' }}
            >
              The four commitments
            </div>
            <h2
              className="text-5xl md:text-6xl mt-3"
              style={{
                color: 'var(--ink)',
                lineHeight: 1,
                letterSpacing: '-0.015em',
                fontFamily: 'var(--font-editorial-display)',
              }}
            >
              {heading.headingPrefix}
              <br />
              <span style={{ fontStyle: 'italic' }}>
                {heading.headingEmphasis}
              </span>
            </h2>
          </div>
          <div className="md:col-span-8">
            <p
              className="md:max-w-xl"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}
            >
              These four strategic objectives are what our board, teachers,
              and families agreed matter most. Each one has measurable goals
              with an owner, a target, and a trend. Jump to any section to
              drill in.
            </p>
          </div>
        </div>

        <div
          className="mt-12 p-8 rounded-xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map((objective, idx) => {
              const visual = COLUMN_VISUALS[idx]
              const heights = MINI_BAR_HEIGHTS[idx]
              const status = statusLabel(objective.status)
              const childCount = (objective.children ?? []).length

              return (
                <a
                  key={objective.id}
                  href={`#obj-${objective.goal_number}`}
                  className="group block"
                >
                  <div
                    className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-4"
                    style={{ color: 'var(--muted)' }}
                  >
                    <span
                      className="inline-block w-4 h-0.5 rounded"
                      style={{ background: `var(${visual.accentVar})` }}
                      aria-hidden="true"
                    />
                    {`Objective 0${idx + 1}`}
                  </div>

                  <h3
                    className="text-2xl leading-tight"
                    style={{
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-editorial-serif)',
                    }}
                  >
                    {objective.title}
                  </h3>

                  <div
                    className="flex items-end gap-1.5 mt-5 h-16"
                    aria-hidden="true"
                  >
                    {heights.map((h, barIdx) => (
                      <div
                        key={barIdx}
                        className="w-6 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background:
                            barIdx === heights.length - 1
                              ? `var(${visual.accentVar})`
                              : `${visual.baseRgba}${BAR_OPACITIES[barIdx]})`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: status.dotBg }}
                      aria-hidden="true"
                    />
                    <span style={{ color: 'var(--ink-soft)' }}>
                      {status.label}
                    </span>
                  </div>
                  <div
                    className="mt-1 text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    {childCount} goal{childCount === 1 ? '' : 's'}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FourCommitmentsOverview
