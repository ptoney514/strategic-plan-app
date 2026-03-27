'use client'
import dynamic from 'next/dynamic'

const AccountSettings = dynamic(() => import('@/pages/AccountSettings').then((m) => ({ default: m.AccountSettings })), { ssr: false })

export default function Page() {
  return <AccountSettings />
}
