'use client'
import dynamic from 'next/dynamic'

const ObjectivesOverviewView = dynamic(
  () => import('@/views/v2/public/ObjectivesOverviewView').then((m) => ({ default: m.ObjectivesOverviewView })),
  { ssr: false }
)

export default function ObjectivesPage() {
  return <ObjectivesOverviewView />
}
