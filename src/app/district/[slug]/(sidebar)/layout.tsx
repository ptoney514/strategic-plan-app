'use client'
import { PublicSidebarLayout } from '@/components/v2/layout/PublicSidebarLayout'

export default function SidebarGroupLayout({ children }: { children: React.ReactNode }) {
  return <PublicSidebarLayout>{children}</PublicSidebarLayout>
}
