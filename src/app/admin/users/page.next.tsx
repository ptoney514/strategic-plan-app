'use client'
import dynamic from 'next/dynamic'

const UserManagement = dynamic(() => import('@/pages/admin/UserManagement').then((m) => ({ default: m.UserManagement })), { ssr: false })

export default function Page() {
  return <UserManagement />
}
