'use client'
import dynamic from 'next/dynamic'

const V2GoalDetail = dynamic(
  () => import('@/pages/v2/admin/V2GoalDetail').then((m) => ({ default: m.V2GoalDetail })),
  { ssr: false }
)

export default function DistrictAdminGoalDetailPage() {
  return <V2GoalDetail />
}
