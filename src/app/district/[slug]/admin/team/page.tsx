'use client'
import dynamic from 'next/dynamic'

const V2Team = dynamic(
  () => import('@/views/v2/admin/V2Team').then((m) => ({ default: m.V2Team })),
  { ssr: false }
)

export default function DistrictTeamPage() {
  return <V2Team />
}
