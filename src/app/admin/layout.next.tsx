'use client'
import { SystemAdminEditorialLayout } from '@/layouts/SystemAdminEditorialLayout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SystemAdminEditorialLayout>{children}</SystemAdminEditorialLayout>
}
