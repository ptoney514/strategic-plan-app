'use client'
import dynamic from 'next/dynamic'

const V2Landing = dynamic(
  () => import('@/pages/v2/marketing/V2Landing').then((m) => ({ default: m.V2Landing })),
  { ssr: false }
)

export default function HomePage() {
  return <V2Landing />
}
