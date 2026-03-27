'use client'
import dynamic from 'next/dynamic'

const TermsPage = dynamic(() => import('@/pages/legal').then((m) => ({ default: m.TermsPage })), { ssr: false })

export default function Page() {
  return <TermsPage />
}
