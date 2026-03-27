'use client'
import dynamic from 'next/dynamic'

const ForgotPassword = dynamic(() => import('@/pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })), { ssr: false })

export default function Page() {
  return <ForgotPassword />
}
