'use client'
import { useSubdomain } from '@/contexts/SubdomainContext'
import { usePlansBySlug } from '@/hooks/v2/usePlans'
import { useGoalsByPlan } from '@/hooks/v2/useGoals'
import { useWidgetsByGoals } from '@/hooks/v2/useWidgets'
import { selectActivePublicPlan } from '@/lib/public-templates'
import { EditorialNav } from './EditorialNav'
import { EditorialHero } from './EditorialHero'
import { FourCommitmentsOverview } from './FourCommitmentsOverview'
import { ObjectiveSection } from './ObjectiveSection'
import { PullQuoteBand } from './PullQuoteBand'
import { QuarterlyCTABand } from './QuarterlyCTABand'
import { EditorialFooter } from './EditorialFooter'
import { getEditorialContent } from './fixtures/editorial-fixtures'
import type { HierarchicalGoal } from '@/lib/types'

export function EditorialLandingView() {
  const { slug } = useSubdomain()
  const content = getEditorialContent(slug)

  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '')
  const activePlan = selectActivePublicPlan(plans)
  const { data: goals, isLoading: goalsLoading } = useGoalsByPlan(
    activePlan?.id || '',
  )

  const objectives = (
    goals?.filter((g) => g.level === 0) || []
  ) as HierarchicalGoal[]
  const allChildIds = objectives.flatMap((o) =>
    (o.children ?? []).map((c) => c.id),
  )

  const { data: widgets } = useWidgetsByGoals(slug || '', allChildIds)

  const isLoading = plansLoading || goalsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
          No public plan available
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'Geist, -apple-system, system-ui, sans-serif',
      }}
    >
      <EditorialNav content={content.nav} />
      <EditorialHero content={content.hero} />
      <FourCommitmentsOverview
        objectives={objectives}
        heading={content.fourCommitments}
      />
      <PullQuoteBand content={content.pullQuote} />
      {objectives.map((objective, idx) => (
        <ObjectiveSection
          key={objective.id}
          objective={objective}
          objectiveIndex={idx}
          widgets={widgets ?? []}
        />
      ))}
      <QuarterlyCTABand content={content.cta} />
      <EditorialFooter content={content.footer} />
    </div>
  )
}

export default EditorialLandingView
