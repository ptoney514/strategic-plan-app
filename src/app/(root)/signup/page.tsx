'use client'
import dynamic from 'next/dynamic'

const Signup = dynamic(() => import('@/views/Signup').then((m) => ({ default: m.Signup })), { ssr: false })

export default function Page() {
  return <Signup />
}
