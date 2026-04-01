'use client'
import dynamic from 'next/dynamic'

const AboutPage = dynamic(() => import('@/views/legal').then((m) => ({ default: m.AboutPage })), { ssr: false })

export default function Page() {
  return <AboutPage />
}
