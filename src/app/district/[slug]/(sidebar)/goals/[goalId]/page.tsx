'use client'
import dynamic from 'next/dynamic'

const GoalDetailView = dynamic(
  () => import('@/views/v2/public/GoalDetailView').then((m) => ({ default: m.GoalDetailView })),
  { ssr: false }
)

export default function GoalDetailPage() {
  return <GoalDetailView />
}
