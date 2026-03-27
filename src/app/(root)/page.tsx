'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { V2MarketingLayout } from '@/components/v2/layout/V2MarketingLayout'
import { useSubdomain } from '@/contexts/SubdomainContext'

const V2Landing = dynamic(
  () => import('@/views/v2/marketing/V2Landing').then((m) => ({ default: m.V2Landing })),
  { ssr: false }
)

export default function HomePage() {
  const router = useRouter()
  const subdomain = useSubdomain()

  useEffect(() => {
    if (subdomain.type === 'district' && subdomain.slug) {
      router.replace(`/district/${subdomain.slug}`)
    }
  }, [subdomain, router])

  if (subdomain.type === 'district') {
    return null
  }

  return (
    <V2MarketingLayout>
      <V2Landing />
    </V2MarketingLayout>
  )
}
