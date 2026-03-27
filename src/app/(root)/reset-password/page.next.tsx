'use client'
import dynamic from 'next/dynamic'

const ResetPassword = dynamic(() => import('@/pages/ResetPassword').then((m) => ({ default: m.ResetPassword })), { ssr: false })

export default function Page() {
  return <ResetPassword />
}
