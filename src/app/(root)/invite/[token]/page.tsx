'use client'
import dynamic from 'next/dynamic'

const AcceptInvitation = dynamic(() => import('@/views/AcceptInvitation').then((m) => ({ default: m.AcceptInvitation })), { ssr: false })

export default function Page() {
  return <AcceptInvitation />
}
