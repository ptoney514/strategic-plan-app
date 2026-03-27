'use client'
import dynamic from 'next/dynamic'

const DistrictsPage = dynamic(() => import('@/pages/admin/DistrictsPage').then((m) => ({ default: m.DistrictsPage })), { ssr: false })

export default function Page() {
  return <DistrictsPage />
}
