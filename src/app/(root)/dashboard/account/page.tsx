'use client'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/layouts/DashboardLayout'

const DashboardAccountPage = dynamic(
  () => import('@/views/dashboard/DashboardAccountPage').then((m) => ({ default: m.DashboardAccountPage })),
  { ssr: false }
)

export default function AccountPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <DashboardAccountPage />
    </DashboardLayout>
  )
}
