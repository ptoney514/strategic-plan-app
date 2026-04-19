'use client'
import { Suspense } from 'react'
import { useSubdomain } from '@/contexts/SubdomainContext'
import { usePlansBySlug } from '@/hooks/v2/usePlans'
import {
  getPublicTemplate,
  selectActivePublicPlan,
  DEFAULT_PUBLIC_TEMPLATE_ID,
} from '@/lib/public-templates'

function DispatchFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-md3-primary" />
    </div>
  )
}

export default function DistrictLandingPage() {
  const { slug } = useSubdomain()
  const { data: plans, isLoading } = usePlansBySlug(slug || '')

  if (isLoading) return <DispatchFallback />

  const activePlan = selectActivePublicPlan(plans)
  const templateId = activePlan?.public_template ?? DEFAULT_PUBLIC_TEMPLATE_ID
  const { LandingView } = getPublicTemplate(templateId)

  return (
    <Suspense fallback={<DispatchFallback />}>
      <LandingView />
    </Suspense>
  )
}
