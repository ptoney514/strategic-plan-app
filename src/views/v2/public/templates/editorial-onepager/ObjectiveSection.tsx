'use client'
import { getObjectiveNarrative } from '@/lib/utils/objectiveFixtures'
import { ObjectiveHeader } from '@/views/v2/public/ObjectiveDetailView/ObjectiveHeader'
import { ObjectiveDataColumn } from '@/views/v2/public/ObjectiveDetailView/ObjectiveDataColumn'
import type { HierarchicalGoal } from '@/lib/types'
import type { Widget } from '@/lib/types/v2'

export interface ObjectiveSectionProps {
  objective: HierarchicalGoal
  objectiveIndex: number
  widgets: Widget[]
}

/**
 * Per-objective section on the editorial one-pager. Body is the Phase 3
 * narrative-left / data-right layout lifted out of ObjectiveDetailView,
 * minus the page wrapper + breadcrumb. Anchor id #obj-{goal_number} is
 * what the nav links and the FourCommitmentsOverview scroll to.
 */
export function ObjectiveSection({
  objective,
  objectiveIndex,
  widgets,
}: ObjectiveSectionProps) {
  const narrative = getObjectiveNarrative(objective.goal_number)
  const childGoals = (objective.children || []) as HierarchicalGoal[]
  const objNumber = String(objectiveIndex + 1).padStart(2, '0')

  return (
    <section
      id={`obj-${objective.goal_number}`}
      className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--line-soft)',
      }}
    >
      <div
        className="obj-wm"
        aria-hidden="true"
        data-testid="objective-watermark"
      >
        {objNumber}
      </div>

      <div
        className="relative grid items-start gap-10 md:grid-cols-12 md:gap-14"
        data-testid="objective-section-grid"
      >
        <ObjectiveHeader narrative={narrative} status={objective.status} />
        <ObjectiveDataColumn
          narrative={narrative}
          objectiveStatus={objective.status}
          childGoals={childGoals}
          widgets={widgets}
        />
      </div>
    </section>
  )
}

export default ObjectiveSection
