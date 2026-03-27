'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function ReportsPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Reports"
        description="Generate and export reports on strategic planning progress."
      />
    </DashboardLayout>
  )
}
