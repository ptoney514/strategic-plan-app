'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function VisualsPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Visual Library"
        description="Browse and manage visual assets for your strategic plans."
      />
    </DashboardLayout>
  )
}
