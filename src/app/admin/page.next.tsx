'use client'
import dynamic from 'next/dynamic'

const SystemDashboard = dynamic(() => import('@/pages/admin/SystemDashboard').then((m) => ({ default: m.SystemDashboard })), { ssr: false })

export default function Page() {
  return <SystemDashboard />
}
