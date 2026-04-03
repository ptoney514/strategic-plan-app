'use client'
import { PublicTopNavLayout } from '@/components/v2/layout/PublicTopNavLayout'

export default function TopNavGroupLayout({ children }: { children: React.ReactNode }) {
  return <PublicTopNavLayout>{children}</PublicTopNavLayout>
}
