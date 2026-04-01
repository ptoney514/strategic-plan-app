'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function MetricsPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Metrics"
        description="Measure performance and track key metrics across your districts."
      />
    </DashboardLayout>
  )
}
