'use client'
import dynamic from 'next/dynamic'

const V2Appearance = dynamic(
  () => import('@/views/v2/admin/V2Appearance').then((m) => ({ default: m.V2Appearance })),
  { ssr: false }
)

export default function DistrictAppearancePage() {
  return <V2Appearance />
}
