'use client'
import dynamic from 'next/dynamic'

const Welcome = dynamic(() => import('@/views/Welcome').then((m) => ({ default: m.Welcome })), { ssr: false })

export default function Page() {
  return <Welcome />
}
