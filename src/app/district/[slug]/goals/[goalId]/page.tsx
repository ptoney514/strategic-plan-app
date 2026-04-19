'use client'
import dynamic from 'next/dynamic'
import { PublicSidebarLayout } from '@/components/v2/layout/PublicSidebarLayout'

const GoalDetailView = dynamic(
  () => import('@/views/v2/public/GoalDetailView').then((m) => ({ default: m.GoalDetailView })),
  { ssr: false },
)

export default function GoalDetailPage() {
  return (
    <PublicSidebarLayout>
      <GoalDetailView />
    </PublicSidebarLayout>
  )
}
