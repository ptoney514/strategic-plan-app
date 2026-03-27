'use client'
import dynamic from 'next/dynamic'

const Login = dynamic(() => import('@/pages/Login').then((m) => ({ default: m.Login })), { ssr: false })

export default function Page() {
  return <Login />
}
