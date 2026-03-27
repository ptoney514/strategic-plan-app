'use client'
import dynamic from 'next/dynamic'

const V2GoalsOverview = dynamic(
  () => import('@/pages/v2/public/V2GoalsOverview').then((m) => ({ default: m.V2GoalsOverview })),
  { ssr: false }
)

export default function DistrictHomePage() {
  return <V2GoalsOverview />
}
