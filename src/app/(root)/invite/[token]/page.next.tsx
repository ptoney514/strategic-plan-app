'use client'
import dynamic from 'next/dynamic'

const AcceptInvitation = dynamic(() => import('@/pages/AcceptInvitation').then((m) => ({ default: m.AcceptInvitation })), { ssr: false })

export default function Page() {
  return <AcceptInvitation />
}
