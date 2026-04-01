'use client'
import dynamic from 'next/dynamic'

const SystemSettings = dynamic(() => import('@/views/admin/SystemSettings').then((m) => ({ default: m.SystemSettings })), { ssr: false })

export default function Page() {
  return <SystemSettings />
}
