'use client'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PlaceholderPage } from '@/views/dashboard/PlaceholderPage'

export default function InvitePage() {
  return (
    <DashboardLayout basePath="/dashboard">
      <PlaceholderPage
        title="Invite Teammates"
        description="Invite team members to collaborate on strategic plans."
      />
    </DashboardLayout>
  )
}
