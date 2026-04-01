'use client'
import { usePathname } from 'next/navigation'
import { SystemAdminEditorialLayout } from '@/layouts/SystemAdminEditorialLayout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap login page in admin layout
  if (pathname?.endsWith('/login')) {
    return <>{children}</>
  }

  return <SystemAdminEditorialLayout>{children}</SystemAdminEditorialLayout>
}
