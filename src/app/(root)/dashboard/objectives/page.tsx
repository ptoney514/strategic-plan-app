'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function ObjectivesPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Objectives & Goals"
        description="Track and manage objectives across all your strategic plans."
      />
    </DashboardLayout>
  )
}
