'use client'
import dynamic from 'next/dynamic'
import { V2MarketingLayout } from '@/components/v2/layout/V2MarketingLayout'

const V2Landing = dynamic(
  () => import('@/pages/v2/marketing/V2Landing').then((m) => ({ default: m.V2Landing })),
  { ssr: false }
)

export default function HomePage() {
  return (
    <V2MarketingLayout>
      <V2Landing />
    </V2MarketingLayout>
  )
}
