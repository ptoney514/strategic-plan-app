'use client'
import dynamic from 'next/dynamic'

const V2Pricing = dynamic(
  () => import('@/pages/v2/marketing/V2Pricing').then((m) => ({ default: m.V2Pricing })),
  { ssr: false }
)

export default function PricingPage() {
  return <V2Pricing />
}
