'use client'
import dynamic from 'next/dynamic'

const AboutPage = dynamic(() => import('@/pages/legal').then((m) => ({ default: m.AboutPage })), { ssr: false })

export default function Page() {
  return <AboutPage />
}
