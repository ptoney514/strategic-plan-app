'use client'
import { use } from 'react'
import { SubdomainOverrideProvider } from '@/contexts/SubdomainContext'

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
      {/* Material Symbols Outlined font for public dashboard icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      {children}
    </SubdomainOverrideProvider>
  )
}
