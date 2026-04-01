'use client'
import dynamic from 'next/dynamic'

const V2PlanEditor = dynamic(
  () => import('@/views/v2/admin/V2PlanEditor').then((m) => ({ default: m.V2PlanEditor })),
  { ssr: false }
)

export default function DistrictAdminPlansPage() {
  return <V2PlanEditor />
}
