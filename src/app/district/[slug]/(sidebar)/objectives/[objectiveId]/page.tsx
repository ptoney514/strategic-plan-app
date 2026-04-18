'use client'
import dynamic from 'next/dynamic'

const ObjectiveDetailView = dynamic(
  () => import('@/views/v2/public/ObjectiveDetailView').then((m) => ({ default: m.ObjectiveDetailView })),
  { ssr: false }
)

export default function ObjectiveDetailPage() {
  return <ObjectiveDetailView />
}
