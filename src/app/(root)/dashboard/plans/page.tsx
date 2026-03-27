'use client'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/layouts/DashboardLayout'

const DashboardPlansPage = dynamic(
  () => import('@/views/dashboard/DashboardPlansPage').then((m) => ({ default: m.DashboardPlansPage })),
  { ssr: false }
)

export default function PlansPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <DashboardPlansPage />
    </DashboardLayout>
  )
}
