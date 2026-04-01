'use client'
import dynamic from 'next/dynamic'

const V2Import = dynamic(
  () => import('@/views/v2/admin/V2Import').then((m) => ({ default: m.V2Import })),
  { ssr: false }
)

export default function DistrictImportPage() {
  return <V2Import />
}
