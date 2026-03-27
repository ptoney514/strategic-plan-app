'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function DashboardsPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Dashboards"
        description="Custom dashboards for monitoring strategic plan progress."
      />
    </DashboardLayout>
  )
}
