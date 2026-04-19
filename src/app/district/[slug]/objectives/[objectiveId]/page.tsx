'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useSubdomain, useDistrictLink } from '@/contexts/SubdomainContext'
import { usePlansBySlug } from '@/hooks/v2/usePlans'
import { useGoal } from '@/hooks/useGoals'
import { PublicSidebarLayout } from '@/components/v2/layout/PublicSidebarLayout'
import { selectActivePublicPlan } from '@/lib/public-templates'

const ObjectiveDetailView = dynamic(
  () => import('@/views/v2/public/ObjectiveDetailView').then((m) => ({ default: m.ObjectiveDetailView })),
  { ssr: false },
)

// Editorial-template districts render every objective on the landing page
// as anchored sections, so deep links like /objectives/{uuid} must redirect
// to /#obj-{goal_number} to keep bookmarks alive. Sidebar-template districts
// still drill into the full ObjectiveDetailView.
export default function ObjectiveDetailPage() {
  const { slug } = useSubdomain()
  const params = useParams<{ objectiveId: string }>()
  const objectiveId = params?.objectiveId ?? ''
  const router = useRouter()
  const link = useDistrictLink()

  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '')
  const activePlan = selectActivePublicPlan(plans)
  const isEditorial = activePlan?.public_template === 'editorial-onepager'

  const { data: goal, isLoading: goalLoading } = useGoal(
    isEditorial ? objectiveId : '',
  )

  useEffect(() => {
    if (!isEditorial) return
    if (!goal?.goal_number) return
    router.replace(`${link('/')}#obj-${goal.goal_number}`)
  }, [isEditorial, goal?.goal_number, router, link])

  if (plansLoading || (isEditorial && goalLoading) || isEditorial) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
      </div>
    )
  }

  return (
    <PublicSidebarLayout>
      <ObjectiveDetailView />
    </PublicSidebarLayout>
  )
}
