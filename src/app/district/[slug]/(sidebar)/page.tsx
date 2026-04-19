'use client'
import dynamic from 'next/dynamic'

const SidebarLandingView = dynamic(
  () => import('@/views/v2/public/templates/sidebar-tree/SidebarLandingView'),
  { ssr: false }
)

export default function PlanLandingPage() {
  return <SidebarLandingView />
}
