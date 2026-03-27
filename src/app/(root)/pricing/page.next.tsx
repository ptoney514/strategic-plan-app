'use client'
import dynamic from 'next/dynamic'
import { V2MarketingLayout } from '@/components/v2/layout/V2MarketingLayout'

const V2Pricing = dynamic(
  () => import('@/pages/v2/marketing/V2Pricing').then((m) => ({ default: m.V2Pricing })),
  { ssr: false }
)

export default function PricingPage() {
  return (
    <V2MarketingLayout>
      <V2Pricing />
    </V2MarketingLayout>
  )
}
