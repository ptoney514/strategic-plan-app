'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function AppearancePage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Appearance"
        description="Customize the look and feel of your dashboard experience."
      />
    </DashboardLayout>
  )
}
