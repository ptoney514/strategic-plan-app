'use client'
import dynamic from 'next/dynamic'

const PrivacyPage = dynamic(() => import('@/views/legal').then((m) => ({ default: m.PrivacyPage })), { ssr: false })

export default function Page() {
  return <PrivacyPage />
}
