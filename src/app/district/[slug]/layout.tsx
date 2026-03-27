'use client'
import { use } from 'react'
import { SubdomainOverrideProvider } from '@/contexts/SubdomainContext'
import { V2PublicLayout } from '@/components/v2/layout/V2PublicLayout'

export default function DistrictLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  return (
    <SubdomainOverrideProvider slug={slug}>
      <V2PublicLayout>{children}</V2PublicLayout>
    </SubdomainOverrideProvider>
  )
}
