'use client'
import dynamic from 'next/dynamic'

const PlanLandingView = dynamic(
  () => import('@/views/v2/public/PlanLandingView').then((m) => ({ default: m.PlanLandingView })),
  { ssr: false }
)

export default function PlanLandingPage() {
  return <PlanLandingView />
}
