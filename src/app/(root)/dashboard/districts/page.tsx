'use client'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/layouts/DashboardLayout'

const DashboardDistrictsPage = dynamic(
  () => import('@/views/dashboard/DashboardDistrictsPage').then((m) => ({ default: m.DashboardDistrictsPage })),
  { ssr: false }
)

export default function DistrictsPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <DashboardDistrictsPage />
    </DashboardLayout>
  )
}
