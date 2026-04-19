'use client'
import dynamic from 'next/dynamic'
import { PublicSidebarLayout } from '@/components/v2/layout/PublicSidebarLayout'

const ObjectivesOverviewView = dynamic(
  () => import('@/views/v2/public/ObjectivesOverviewView').then((m) => ({ default: m.ObjectivesOverviewView })),
  { ssr: false },
)

export default function ObjectivesPage() {
  return (
    <PublicSidebarLayout>
      <ObjectivesOverviewView />
    </PublicSidebarLayout>
  )
}
