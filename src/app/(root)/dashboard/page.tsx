'use client'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/layouts/DashboardLayout'

const UserDashboard = dynamic(
  () => import('@/views/dashboard/UserDashboard').then((m) => ({ default: m.UserDashboard })),
  { ssr: false }
)

export default function DashboardPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <UserDashboard />
    </DashboardLayout>
  )
}
