'use client'
import dynamic from 'next/dynamic'

const V2LaunchTraction = dynamic(
  () => import('@/pages/v2/public/V2LaunchTraction').then((m) => ({ default: m.V2LaunchTraction })),
  { ssr: false }
)

export default function LaunchPage() {
  return <V2LaunchTraction />
}
