'use client'
import dynamic from 'next/dynamic'

const V2AdminDashboard = dynamic(
  () => import('@/pages/v2/admin/V2AdminDashboard').then((m) => ({ default: m.V2AdminDashboard })),
  { ssr: false }
)

export default function DistrictAdminPage() {
  return <V2AdminDashboard />
}
