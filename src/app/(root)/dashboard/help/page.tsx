'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function HelpPage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Help & Support"
        description="Get help with StrataDASH features and contact support."
      />
    </DashboardLayout>
  )
}
