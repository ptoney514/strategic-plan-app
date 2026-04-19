'use client'
import { useSubdomain } from '@/contexts/SubdomainContext'
import { EditorialNav } from './EditorialNav'
import { EditorialHero } from './EditorialHero'
import { getEditorialContent } from './fixtures/editorial-fixtures'

export function EditorialLandingView() {
  const { slug } = useSubdomain()
  const content = getEditorialContent(slug)

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'Geist, -apple-system, system-ui, sans-serif',
        scrollBehavior: 'smooth',
      }}
    >
      <EditorialNav content={content.nav} />
      <EditorialHero content={content.hero} />
      {/* Stage 6 — FourCommitmentsOverview + per-objective ObjectiveSection x4 */}
      {/* Stage 7 — PullQuoteBand + QuarterlyCTABand + EditorialFooter */}
    </div>
  )
}

export default EditorialLandingView
