'use client'
import dynamic from 'next/dynamic'

const V2GoalDrillDown = dynamic(
  () => import('@/views/v2/public/V2GoalDrillDown').then((m) => ({ default: m.V2GoalDrillDown })),
  { ssr: false }
)

export default function GoalDrillDownPage() {
  return <V2GoalDrillDown />
}
